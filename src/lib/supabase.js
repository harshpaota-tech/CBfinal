// =============================================================================
// Supabase client + database schema
// =============================================================================
//
// Run the SQL in `supabase/schema.sql` once against your Supabase project to
// create the `profiles` table, the `kyc-documents` storage bucket, RLS
// policies, and the auth.users → profiles auto-insert trigger.
//
// Required schema (mirrored in supabase/schema.sql):
//
//   -- profiles table
//   create table public.profiles (
//     id uuid references auth.users primary key,
//     name text,
//     email text,
//     phone text,
//     role text,                          -- 'buyer' | 'seller' | 'business'
//     company text,
//     country text default 'IN',
//     kyc_status text default 'pending',  -- 'pending' | 'approved' | 'rejected'
//     kyc_doc_url text,
//     wallet_balance numeric default 0,
//     created_at timestamptz default now()
//   );
//
//   -- Storage bucket
//   insert into storage.buckets (id, name, public)
//   values ('kyc-documents', 'kyc-documents', false);
//
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[Carbon Bridge] Supabase env vars missing.\n" +
      "Copy .env.example to .env.local and set VITE_SUPABASE_URL and " +
      "VITE_SUPABASE_ANON_KEY.\n" +
      "On Render: dashboard → service → Environment → add both vars, then redeploy."
  );
}

// Use placeholder values when unconfigured so import never throws. All auth
// calls will fail gracefully with a clear "not configured" error from auth.js.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // handle OAuth redirect
    },
  }
);
