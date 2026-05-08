-- =============================================================================
-- Carbon Bridge — Supabase schema
-- =============================================================================
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run.
-- Idempotent: safe to re-run.
-- =============================================================================

-- 1. profiles table -----------------------------------------------------------
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  name            text,
  email           text,
  phone           text,
  role            text check (role in ('buyer', 'seller', 'business')),
  company         text,
  country         text default 'IN',
  kyc_status      text default 'pending' check (kyc_status in ('pending', 'approved', 'rejected')),
  kyc_doc_url     text,
  wallet_balance  numeric default 0,
  created_at      timestamptz default now()
);

-- 2. Row Level Security -------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "Users can view their own profile" on public.profiles;
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 3. Auto-create profile on signup -------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, phone, role, company)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'role', 'buyer'),
    coalesce(new.raw_user_meta_data->>'company', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. KYC documents storage bucket --------------------------------------------
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', false)
on conflict (id) do nothing;

-- Storage RLS: users can upload + read their own KYC docs (filed under {uid}/...).
drop policy if exists "Users can upload their own KYC docs" on storage.objects;
create policy "Users can upload their own KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can read their own KYC docs" on storage.objects;
create policy "Users can read their own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
