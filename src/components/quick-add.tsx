"use client";

import { usePathname } from "next/navigation";
import { dilOneki, yoldanDil } from "@/lib/dil-onek";

import Link from "next/link";
import { useContext, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/components/cart";
import { flyToCart } from "@/lib/fly-to-cart";
import type { Product } from "@/lib/product-types";
import type { VaryantOzeti } from "@/lib/varyant-ozeti";

/**
 * Kartlardan doğrudan sepete ekleme.
 *
 * ÖLÇÜT KATEGORİ DEĞİL, VARYANT SAYISI (17.10.2026). Önceden kural
 * şuydu: kategori "Giyim" ise bedene gidilir, değilse ürün doğrudan
 * sepete atılır. Vitrin yalnızca tekstil satarken doğruydu.
 * Kozmetikte beden yok ama RENK var (LR rujunun altı tonu,
 * 30.09.2026); kart o ürünü de SKU'suz sepete atıyor, ArvoARC
 * siparişi stokta olan herhangi bir tona bağlıyordu — kutudan başka
 * ton çıkıyordu (lib/varyant-ozeti.ts).
 *
 * Kart verisi varyant taşımadığı için seçenek sayısı düğmeye
 * basıldığında sorulur: tek varyantlıysa o SKU ile eklenir, birden
 * çoksa müşteri ürün sayfasında seçer. Sorgu başarısızsa da ürün
 * sayfasına gidilir — yanlış varyantı sepete yazmaktansa bir adım
 * fazla attırmak yeğ.
 */
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const router = useRouter();
  const yol = usePathname();
  const [durum, setDurum] = useState<"hazir" | "sorguluyor" | "eklendi">("hazir");
  const buttonRef = useRef<HTMLButtonElement>(null);

  if (product.available === false) {
    return (
      <button className="btn btn-ghost btn-block" type="button" disabled>
        Tükendi
      </button>
    );
  }

  /* Dil önekini yoldan çıkarıyor: istemci bileşeni olduğu için
     kanca kullanabiliyor ve prop zincirine gerek kalmıyor
     (lib/dil-onek). */
  const urunSayfasi = `${dilOneki(yoldanDil(yol))}/urun/${product.slug}`;

  /*
    Giyimde seçenek sorulmadan karttan ekleme yapılmıyor: bedensiz
    sipariş, iade sebeplerinin başında geliyor. Tek bedenli bir
    giyim ürünü için de fazladan bir tık, yanlış beden göndermekten
    iyidir.
  */
  if (product.category === "Giyim") {
    return (
      <Link className="btn btn-ghost btn-block" href={urunSayfasi}>
        Beden seç
      </Link>
    );
  }

  async function ekle() {
    setDurum("sorguluyor");
    let ozet: VaryantOzeti | null = null;
    try {
      const yanit = await fetch(
        `/api/varyantlar?slug=${encodeURIComponent(product.slug)}`,
        { cache: "no-store" },
      );
      if (yanit.ok) ozet = (await yanit.json()) as VaryantOzeti;
    } catch {
      /* Ağ hatası: aşağıdaki yönlendirme devralıyor. */
    }

    if (!ozet?.tek) {
      /* Seçenek var ya da bilinmiyor: seçim ürün sayfasında yapılır. */
      setDurum("hazir");
      router.push(urunSayfasi);
      return;
    }

    // Görsel, karttan sepet ikonuna uçar: eklemenin gerçekten
    // olduğunu ve nereye gittiğini gösterir.
    flyToCart(buttonRef.current, product.image);
    add(product, ozet.tek);
    setDurum("eklendi");
    setTimeout(() => setDurum("hazir"), 1600);
  }

  return (
    <button
      type="button"
      className="btn btn-ghost btn-block"
      disabled={durum !== "hazir"}
      ref={buttonRef}
      onClick={ekle}
    >
      {durum === "eklendi"
        ? "Sepete eklendi ✓"
        : durum === "sorguluyor"
          ? "Ekleniyor…"
          : "Sepete ekle"}
    </button>
  );
}
