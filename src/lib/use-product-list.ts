"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/product-types";

/**
 * Slug listesinden ürün çeken ortak kanca.
 *
 * Üç raf aynı işi yapıyor: favoriler, son gezilenler ve öneriler.
 * Hepsinde liste tarayıcıda, ürün bilgisi sunucuda.
 *
 * Hata bilerek boş listeden ayrı tutuluyor. "Bir şey yok" ile
 * "getiremedim" farklı şeyler; ikisini aynı göstermek müşteriye
 * olmayan bir gerçeği söylemek olur — bu oturumun başındaki
 * favoriler hatasının mekanizması tam olarak buydu.
 */

export type ListeDurumu = "bekliyor" | "yukleniyor" | "hazir" | "bos" | "hata";

export function useProductList(
  endpoint: string,
  /** `null`: liste henüz bilinmiyor (tarayıcıdan okunmadı). */
  slugs: string[] | null,
) {
  const [cevap, setCevap] = useState<{
    anahtar: string;
    products: Product[];
  } | null>(null);
  const [hataliAnahtar, setHataliAnahtar] = useState<string | null>(null);

  const anahtar = slugs?.join("|") ?? null;

  useEffect(() => {
    if (!slugs || slugs.length === 0) return;

    let iptal = false;

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { products?: Product[] };
        if (iptal) return;
        setCevap({
          anahtar: slugs.join("|"),
          products: Array.isArray(data.products) ? data.products : [],
        });
      })
      .catch((error) => {
        if (iptal) return;
        console.error(`${endpoint} başarısız:`, error);
        setHataliAnahtar(slugs.join("|"));
      });

    return () => {
      iptal = true;
    };
    /* `anahtar` listenin kimliği; `slugs` her render'da yeni bir
       dizi olabilir ve ona bağlanmak sonsuz istek üretirdi. */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anahtar, endpoint]);

  const durum: ListeDurumu =
    anahtar === null
      ? "bekliyor"
      : anahtar === ""
        ? "bos"
        : hataliAnahtar === anahtar
          ? "hata"
          : cevap?.anahtar !== anahtar
            ? "yukleniyor"
            : cevap.products.length === 0
              ? "bos"
              : "hazir";

  return { durum, products: cevap?.products ?? [] };
}
