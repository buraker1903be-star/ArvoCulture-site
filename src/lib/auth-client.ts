"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Tarayıcı tarafı kimlik doğrulama istemcisi.
 *
 * Bağlantı bilgileri `NEXT_PUBLIC_` ortam değişkeninden değil,
 * sunucu bileşeninden prop olarak gelir. Sebebi: `NEXT_PUBLIC_`
 * değişkenleri derleme anında koda gömülür; panelde tanımlı olsa
 * bile o değişkenler eklenmeden önce yapılmış bir derleme onları
 * içermez ve sessizce boş kalır.
 *
 * Publishable anahtar zaten herkese açıktır; güvenlik RLS
 * politikalarından gelir.
 */
let client: SupabaseClient | null = null;

export function getAuthClient(url: string, key: string) {
  if (client) return client;

  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  /*
    İstemci kuruldu: favoriler (layout.tsx'teki FavouritesProvider)
    Supabase'i kendisi yüklemiyorsa bu olayla bağlanıyor. Hesap
    panelinden giriş yapan müşterinin favorileri böylece sayfa
    yenilenmeden eşitleniyor. Mikro görevde: kurulum bir bileşenin
    çizimi sırasında olabilir, olay çizimi bölmemeli.
  */
  if (typeof window !== "undefined") {
    queueMicrotask(() => window.dispatchEvent(new Event("arvo:auth-client")));
  }

  return client;
}
