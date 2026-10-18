"use client";

import { createContext, useContext } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/lib/order-types";

/**
 * Hesap kabuğunun bölümlerle paylaştığı veri.
 *
 * NEDEN VAR: altı bölümün her biri kendi `AccountPanel`'ini
 * çiziyordu. Bölüm değiştirmek paneli baştan kuruyor, bu da her
 * seferinde `getSession()` + `claim_arvoculture_orders` +
 * `arc_storefront_my_orders` demekti — üstelik karşılama şeridi ve
 * yan menü de sökülüp yeniden takılıyordu. Müşterinin gördüğü şey
 * buydu: tıkla, bir şey olmasın, sonra sayfa zıplasın.
 *
 * Kabuk artık `/hesap/layout.tsx`'te. Next düzeni alt sayfalar
 * arasında SÖKMEDİĞİ için panel bir kez kuruluyor; bölümler
 * veriyi buradan okuyor ve geçişte yalnızca içerik sütunu
 * değişiyor.
 */
export type HesapBaglamiDegeri = {
  supabase: SupabaseClient;
  supabaseUrl: string;
  supabaseKey: string;
  eposta: string | undefined;
  uyelikTarihi: string | undefined;

  orders: Order[] | null;
  siparisOkunamadi: boolean;
  siparisleriYenile: () => void;

  profileName: string;
  profilePhone: string;
  setProfileName: (deger: string) => void;
  setProfilePhone: (deger: string) => void;
  kaydet: (ad: string, telefon: string) => Promise<{ hata: boolean }>;
  sifreDegistir: () => Promise<{ hata: boolean }>;
};

const HesapBaglami = createContext<HesapBaglamiDegeri | null>(null);

export const HesapBaglamiSaglayici = HesapBaglami.Provider;

export function useHesap(): HesapBaglamiDegeri {
  const deger = useContext(HesapBaglami);
  if (!deger) {
    throw new Error(
      "useHesap, hesap kabuğunun içinde kullanılmalı (app/[konak]/hesap/layout.tsx).",
    );
  }
  return deger;
}
