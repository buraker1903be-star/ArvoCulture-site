"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import { readRecent, pushRecent } from "@/lib/recent";
import { useProductList } from "@/lib/use-product-list";

/**
 * Son gezilen ürünler rafı.
 *
 * Ürün sayfasında o ürünü listeye ekler ve diğerlerini gösterir.
 * Ana sayfada yalnızca gösterir.
 *
 * Önceden bu bileşene sayfanın elindeki ürün listesi veriliyor ve
 * son gezilenler onun içinde aranıyordu. Ana sayfa katalogdan 200,
 * ürün sayfası 120 ürün alıyor; katalog ise 3.429 ürün. Yani
 * müşterinin gezdiği ürünün bu pencereye düşme ihtimali yüzde altı
 * civarındaydı ve raf neredeyse hiç görünmüyordu — sitedeki tek
 * kişiselleştirme, sessizce çalışmıyordu.
 *
 * Artık ürünler slug'larıyla /api/urunler'den isteniyor. Katalog ne
 * kadar büyürse büyüsün raf çalışıyor ve maliyet on iki ürünle
 * sınırlı kalıyor.
 */
export function RecentProducts({
  currentSlug,
  title = "Son gezdikleriniz",
}: {
  /** Ürün sayfasındaysa o ürün listeye eklenir ve gösterilmez. */
  currentSlug?: string;
  title?: string;
}) {
  const [slugs, setSlugs] = useState<string[] | null>(null);

  useEffect(() => {
    // Önce mevcut listeyi oku, sonra bu ürünü ekle: aksi hâlde
    // ürün kendi rafında görünürdü.
    const previous = readRecent();
    // Tek seferlik başlangıç değeri; zincirleme render riski yok.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(previous.filter((slug) => slug !== currentSlug));
    if (currentSlug) pushRecent(currentSlug);
  }, [currentSlug]);

  const { durum, products } = useProductList("/api/urunler", slugs);

  /*
    İki üründen az varsa raf göstermeye değmez. Yükleniyorken de
    iskelet çizilmiyor: bu raf sayfanın altında, müşteri oraya
    gelene kadar liste çoktan hazır oluyor ve boş bir kutunun
    belirip dolması sayfayı zıplatmaktan başka işe yaramıyor.
  */
  if (durum !== "hazir" || products.length < 2) return null;

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>{title}</h2>
          <p>Kaldığınız yerden devam edin.</p>
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
