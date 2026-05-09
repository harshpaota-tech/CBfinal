// =============================================================================
// Supabase 'transactions' table helpers
//
// Schema (also in supabase/schema.sql):
//   create table public.transactions (
//     id                  uuid default uuid_generate_v4() primary key,
//     user_id             uuid references public.profiles(id) on delete cascade,
//     credit_id           int,
//     credit_name         text,
//     qty                 int,
//     price_inr           numeric,
//     total_inr           numeric,
//     payment_id          text,
//     razorpay_order_id   text,
//     cert_id             text unique,
//     status              text,        -- 'completed' | 'failed' | 'refunded'
//     registry            text,
//     vintage             int,
//     retired             boolean default false,
//     created_at          timestamptz default now()
//   );
//
// RLS: users can read/insert their own transactions only. See schema.sql.
// =============================================================================

import { supabase, isSupabaseConfigured } from "./supabase.js";

export async function insertTransaction(row) {
  if (!isSupabaseConfigured) {
    // Stub mode: pretend it persisted so the rest of the UI can be tested
    // without a Supabase project. Logged so it's obvious in dev.
    console.warn("[Carbon Bridge] Supabase not configured — transaction not persisted:", row);
    return { ...row, id: row.cert_id, _stub: true };
  }

  const { data, error } = await supabase
    .from("transactions")
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchUserTransactions(userId) {
  if (!isSupabaseConfigured || !userId) return [];

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.warn("[Carbon Bridge] Could not fetch transactions:", error.message);
    return [];
  }
  return data || [];
}

export async function retireTransaction(certId) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase
    .from("transactions")
    .update({ retired: true })
    .eq("cert_id", certId);
  if (error) throw error;
}
