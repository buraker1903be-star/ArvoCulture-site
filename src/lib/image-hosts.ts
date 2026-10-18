import { supabaseHostname } from "@/lib/env";

/*
  next/image yalnızca next.config.ts'teki `remotePatterns`'a uyan
  adresleri optimize edebilir; uymayan bir adres verilirse sayfa hata
  verir. Hero ve kampanya görselleri ArvoARC panelinden geliyor ve herhangi
  bir adres olabilir. Listede olanlar optimize ediliyor (telefona 1920px
  yerine ekran genişliğinde WebP gidiyor), olmayanlar eskisi gibi
  olduğu gibi gösteriliyor.

  Bu liste next.config.ts ile AYNI tutulmalı.
*/
const SUPABASE_PATHS = [
  "/storage/v1/object/public/organization-assets/",
  "/storage/v1/object/public/arc-product-images/",
];

export function canOptimizeImage(url: string | null | undefined): boolean {
  if (!url) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Göreli adres: public/ altındaki yerel dosya.
    return url.startsWith("/");
  }

  if (parsed.protocol !== "https:") return false;

  /*
    Ayarlı adres ya da HERHANGİ bir supabase.co projesi.

    İkincisi geçiş için: Supabase'e özel alan adı tanımlanıp
    ARC_SUPABASE_URL değiştirildiğinde veritabanındaki görsel
    adresleri eski `*.supabase.co` adresinde kalıyor. Yalnızca
    ayarlı adrese bakılsaydı o görseller optimize edilemez
    sayılır, `next/image` izin listesinde de olmadıkları için
    ürün sayfaları hata verirdi (next.config.ts ile aynı liste).
  */
  if (
    parsed.hostname === supabaseHostname ||
    parsed.hostname.endsWith(".supabase.co")
  ) {
    return SUPABASE_PATHS.some((path) => parsed.pathname.startsWith(path));
  }
  if (parsed.hostname === "cdn.shopify.com") {
    return parsed.pathname.startsWith("/s/files/");
  }
  return parsed.hostname === "percdn.com";
}
