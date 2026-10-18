import { NextResponse } from "next/server";
import { getStorefrontCollections } from "@/lib/collections";
import { koleksiyonKapsami } from "@/lib/koleksiyon-kapsami";
import {
  getStorefrontCollectionProductsPage,
  getStorefrontProductsPage,
} from "@/lib/products";
/* Sıralama anahtarları süzgeç bileşeninde tanımlı: tek liste. */
import type { SortKey } from "@/components/collection-filters";

/**
 * "Daha fazla yükle": koleksiyonun sonraki sayfası.
 *
 * KAPSAM HESABI SAYFAYLA ORTAK (`lib/koleksiyon-kapsami`). İki
 * yerde ayrı yazılsaydı düğmeyle gelen ürünler sayfadakinden
 * FARKLI bir kümeden çıkardı — aynı listede iki ayrı katalog, ve
 * bunu kimse fark etmezdi.
 *
 * Süzgeçler de aynı adlarla geliyor; sunucu onları yeniden
 * yorumlamıyor, sayfanın verdiği değerleri olduğu gibi aynı veri
 * fonksiyonuna geçiriyor.
 */

export const dynamic = "force-dynamic";

const SIRALAMALAR = new Set<SortKey>([
  "onerilen",
  "ucuz",
  "pahali",
  "indirim",
  "yeni",
]);

export async function POST(request: Request) {
  let govde: unknown;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const g = govde as Record<string, unknown>;
  const slug = String(g.slug ?? "").trim();
  const sayfa = Number(g.sayfa ?? 0);

  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug) || !Number.isInteger(sayfa) || sayfa < 2) {
    return NextResponse.json({ error: "Geçersiz sayfa." }, { status: 400 });
  }

  const metin = (anahtar: string, uzunluk: number) => {
    const deger = typeof g[anahtar] === "string" ? (g[anahtar] as string) : "";
    return deger.trim().slice(0, uzunluk);
  };
  const sayi = (anahtar: string) => {
    const n = Number(g[anahtar]);
    return Number.isFinite(n) && n > 0 ? n : 0;
  };

  const siralaHam = metin("sirala", 20) as SortKey;
  const suzgecler = {
    brand: metin("marka", 120),
    size: metin("beden", 20),
    maxPrice: sayi("ust"),
    onlyDiscounted: g.indirimli === true,
    /* Tükenenler varsayılan olarak gizli; sayfa da öyle. */
    onlyAvailable: g.tukenenler !== true,
    sort: SIRALAMALAR.has(siralaHam) ? siralaHam : ("onerilen" as SortKey),
  };

  try {
    if (slug === "tumu") {
      const sonuc = await getStorefrontProductsPage(sayfa, suzgecler);
      return NextResponse.json({
        products: sonuc.products,
        pageCount: sonuc.pageCount,
        page: sonuc.page,
      });
    }

    const koleksiyonlar = await getStorefrontCollections();
    const varMi = koleksiyonlar.some((k) => k.slug === slug);
    const sonuc = await getStorefrontCollectionProductsPage(sayfa, {
      ...koleksiyonKapsami(slug, varMi),
      ...suzgecler,
    });

    /*
      OKUNAMADI BOŞ LİSTE DEĞİL. Boş dönmek müşteriye "başka ürün
      yok" demek olurdu; düğme kaybolur ve kataloğun geri kalanı
      sessizce erişilemez hale gelirdi.
    */
    if (sonuc.okunamadi) {
      return NextResponse.json({ error: "Liste okunamadı." }, { status: 503 });
    }

    return NextResponse.json({
      products: sonuc.products,
      pageCount: sonuc.pageCount,
      page: sonuc.page,
    });
  } catch (hata) {
    console.error("Koleksiyon sayfası okunamadı:", slug, sayfa, hata);
    return NextResponse.json({ error: "Liste okunamadı." }, { status: 503 });
  }
}
