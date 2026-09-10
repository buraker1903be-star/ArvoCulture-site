import { NextResponse } from "next/server";
import { getStorefrontProduct } from "@/lib/products";
import type { Product } from "@/lib/product-types";

/**
 * Favori ürünleri slug listesiyle döndürür.
 *
 * Favoriler tarayıcıda tutuluyor; sunucu hangi ürünlerin istendiğini
 * ancak istemci söyleyince bilir. Eskiden favoriler sayfası tüm
 * kataloğu çekip eşleştirmeyi istemcide yapıyordu. Bunun iki bedeli
 * vardı: sayfa 3.400 ürünlük katalogda megabaytlarca HTML'e şişiyor
 * ve katalog sınırının dışında kalan ürünler sessizce kayboluyordu —
 * müşteri favorilediği ürünü listede bulamıyordu. Artık yalnızca
 * istenen ürünler çekiliyor; katalog ne kadar büyürse büyüsün bu
 * sayfanın maliyeti favori sayısıyla orantılı kalır.
 */

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;

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

  const raw = (body as { slugs?: unknown } | null)?.slugs;
  if (!Array.isArray(raw)) {
    return NextResponse.json(
      { products: [], error: "slugs bir dizi olmalı." },
      { status: 400 },
    );
  }

  const slugs = [
    ...new Set(
      raw.filter(
        (value): value is string =>
          typeof value === "string" && SLUG_PATTERN.test(value),
      ),
    ),
  ].slice(0, MAX_SLUGS);

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  /*
    Tek bir ürünün çekilememesi tüm listeyi düşürmemeli: o ürün
    listeden sessizce çıkar, diğerleri görünmeye devam eder.
  */
  const found = await Promise.all(
    slugs.map((slug) =>
      getStorefrontProduct(slug).catch(() => undefined),
    ),
  );

  /* Sıra korunuyor: müşterinin ekleme sırası listenin sırasıdır. */
  const products = found.filter((item): item is Product => Boolean(item));

  return NextResponse.json({ products });
}
