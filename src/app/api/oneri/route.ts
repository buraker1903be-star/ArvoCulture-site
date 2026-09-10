import { NextResponse } from "next/server";
import { getCachedSearchIndex } from "@/lib/search-cache";
import { recommend } from "@/lib/recommend";
import { parseSlugs, productsBySlugs } from "@/lib/products-by-slug";

/**
 * "Senin için" önerileri.
 *
 * İstemci, müşterinin gezdiği ve favorilediği ürünlerin slug'larını
 * gönderiyor; sunucu bunlardan kategori ve marka eğilimini çıkarıp
 * katalogdan benzerlerini seçiyor.
 *
 * İki tasarım kararı önemli:
 *
 *   1. Öneri, arama dizini üzerinden yapılıyor. O dizin süreç
 *      belleğinde beş dakika duruyor ve yalnızca stokta olan
 *      ürünleri içeriyor — yani öneri için ayrıca katalog çekilmiyor
 *      ve tükenmiş ürün önerilmiyor.
 *   2. Kart için gereken tam ürün bilgisi yalnızca seçilen on ürün
 *      için çekiliyor. Katalog 3.400 ürün; öneriyi hesaplamak
 *      ucuz, göstermek de öyle olmalı.
 *
 * Müşteri verisi sunucuda saklanmıyor: gelen slug listesi istek
 * bitince kayboluyor. Kişiselleştirme tarayıcıda yaşıyor.
 */

const MAX_SLUGS = 40;
const ONERI_SAYISI = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { products: [], error: "Geçersiz istek gövdesi." },
      { status: 400 },
    );
  }

  const slugs = parseSlugs(
    (body as { slugs?: unknown } | null)?.slugs,
    MAX_SLUGS,
  );

  if (slugs === null) {
    return NextResponse.json(
      { products: [], error: "slugs bir dizi olmalı." },
      { status: 400 },
    );
  }

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  try {
    const index = await getCachedSearchIndex();
    const secilen = recommend(index, slugs, ONERI_SAYISI);

    if (secilen.length === 0) {
      return NextResponse.json({ products: [] });
    }

    return NextResponse.json({
      products: await productsBySlugs(secilen.map((item) => item.slug)),
    });
  } catch (error) {
    /*
      Öneri sayfanın yardımcı bir parçası; olmazsa raf hiç
      görünmüyor. Ama hata boş sonuç gibi gösterilmiyor: arıza ile
      "önerecek bir şey yok" ayrı şeyler ve ikisini karıştırmak,
      sonradan bakanı yanlış yere bakmaya götürür.
    */
    console.error("Öneri üretilemedi:", error);
    return NextResponse.json(
      { products: [], error: "Öneriler şu anda hazırlanamıyor." },
      { status: 503 },
    );
  }
}
