import "server-only";
import { getStorefrontProduct } from "@/lib/products";
import type { Product } from "@/lib/product-types";

/**
 * Slug listesiyle ürün çekmenin ortak parçaları.
 *
 * İki uç aynı işi yapıyor: /api/urunler (favoriler, son gezilenler)
 * ve /api/oneri (önerilen ürünler). Doğrulama kurallarının iki
 * yerde ayrı ayrı yazılması, birinde unutulan bir sınırın diğerinde
 * fark edilmemesi demek olurdu.
 */

/*
  Slug biçimi katı: yalnızca küçük harf, rakam ve tire. Bu bir
  görgü kuralı değil, gelen değerin doğrudan veritabanı sorgusuna
  parametre olarak gitmesinden dolayı sınırın kendisi.
*/
const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{0,199}$/;

/**
 * Gelen gövdedeki slug dizisini süzer.
 *
 * Dizi değilse `null` döner — çağıran taraf bunu 400 olarak
 * cevaplar. Geçersiz tek bir slug isteği düşürmüyor, yalnızca
 * kendisi eleniyor.
 */
export function parseSlugs(raw: unknown, max: number): string[] | null {
  if (!Array.isArray(raw)) return null;

  return [
    ...new Set(
      raw.filter(
        (value): value is string =>
          typeof value === "string" && SLUG_PATTERN.test(value),
      ),
    ),
  ].slice(0, max);
}

/**
 * Ürünleri çeker, istenen sırayı korur.
 *
 * Tek bir ürünün çekilememesi tüm listeyi düşürmemeli: o ürün
 * listeden sessizce çıkar, diğerleri görünmeye devam eder.
 * Müşterinin sırası listenin sırasıdır — favoride ekleme sırası,
 * son gezilenlerde en yeniden eskiye.
 */
export async function productsBySlugs(slugs: string[]): Promise<Product[]> {
  const found = await Promise.all(
    slugs.map((slug) => getStorefrontProduct(slug).catch(() => undefined)),
  );
  return found.filter((item): item is Product => Boolean(item));
}
