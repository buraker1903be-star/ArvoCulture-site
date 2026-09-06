"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tarayıcı tarafı kimlik doğrulama istemcisi.
 *
 * Yalnızca publishable (anon) anahtar kullanır — bu anahtar zaten
 * herkese açıktır, güvenlik RLS politikalarından gelir. Oturum
 * tarayıcıda saklanır ve sekmeler arasında paylaşılır.
 */
let client: SupabaseClient | null = null;

/** Yapılandırma tam mı? Eksikse sayfa çökmez, uyarı gösterir. */
export function isAuthConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getAuthClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Ortam değişkeni eksik: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  }

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}
