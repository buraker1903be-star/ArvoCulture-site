"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { useFavourites } from "@/components/favourites";
import { readRecent } from "@/lib/recent";
import { useProductList } from "@/lib/use-product-list";

/**
 * "Senin için" rafı.
 *
 * Vitrini müşteriye göre değiştiren parça. Girdi yalnızca
 * müşterinin kendi davranışı: gezdiği ürünler ve favorileri.
 * Sunucu bunlardan kategori ve marka eğilimini çıkarıp katalogdan
 * benzerlerini seçiyor.
 *
 * Üç sınır bilinçli:
 *
 *   1. Yeni ziyaretçide hiç görünmüyor. Kimseyi tanımadan
 *      "senin için" demek, kişiselleştirme değil süs olurdu.
 *      En az üç sinyal gerekiyor.
 *   2. Uydurma sinyal yok. "Şu an 14 kişi bakıyor", "senin gibi
 *      müşteriler" gibi ifadeler elimizde karşılığı olmadığı için
 *      kullanılmıyor.
 *   3. Veri sunucuda kalmıyor. Liste tarayıcıdan gidiyor, öneri
 *      dönüyor, istek bitince kayboluyor.
 */

/** Bu sayının altında öneri "kişisel" sayılmaz. */
const EN_AZ_SINYAL = 3;
const EN_AZ_ONERI = 4;

export function ForYou() {
  const { slugs: favoriler, syncing } = useFavourites();
  const [gezilen, setGezilen] = useState<string[] | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGezilen(readRecent());
  }, []);

  /*
    Gezilenler önce: bugünkü ilgi, geçen ayki favoriden daha
    belirleyici. Öneri ağırlığı listedeki sıraya bağlı.
  */
  const sinyaller =
    gezilen === null || syncing
      ? null
      : [...new Set([...gezilen, ...favoriler])];

  const yeterli = sinyaller !== null && sinyaller.length >= EN_AZ_SINYAL;

  const { durum, products } = useProductList(
    "/api/oneri",
    yeterli ? sinyaller : null,
  );

  if (durum !== "hazir" || products.length < EN_AZ_ONERI) return null;

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>Senin için</h2>
          <p>Gezdiğin ürünlere ve favorilerine bakarak seçtik.</p>
        </div>
      </div>

      <Rail>
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </Rail>
    </section>
  );
}
