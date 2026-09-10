import { NextResponse } from "next/server";
import { parseSlugs, productsBySlugs } from "@/lib/products-by-slug";

/**
 * Verilen slug listesindeki ürünleri döndürür.
 *
 * Müşteriye özel listelerin hepsi tarayıcıda tutuluyor: favoriler
 * (misafirde), son gezilenler, öneri girdisi. Sunucu hangi ürünlerin
 * istendiğini ancak istemci söyleyince bilir.
 *
 * Eskiden bu sayfalar tüm kataloğu çekip eşleştirmeyi istemcide
 * yapıyordu. İki bedeli vardı: sayfa 3.400 ürünlük katalogda
 * megabaytlarca HTML’e şişiyor ve katalog sınırının dışında kalan
 * ürünler sessizce kayboluyordu — müşteri favorilediği ürünü
 * listede bulamıyordu. Artık yalnızca istenen ürünler çekiliyor;
 * katalog ne kadar büyürse büyüsün maliyet liste uzunluğuyla
 * orantılı kalır.
 *
 * Uç önce yalnızca favoriler içindi ve adı /api/favoriler’di. Son
 * gezilenler rafı da aynı işi istediği için adı yaptığı işe
 * çevrildi: bu uç favori bilmiyor, slug biliyor.
 */

/**
 * Tek istekteki üst sınır. Favori listesi bundan uzunsa sayfalamak
 * gerekir; sınır aynı zamanda bu uca dayanarak veritabanına yük
 * bindirilmesini de engeller.
 */
const MAX_SLUGS = 100;

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

  return NextResponse.json({ products: await productsBySlugs(slugs) });
}
