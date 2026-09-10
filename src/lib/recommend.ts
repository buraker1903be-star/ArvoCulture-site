import type { SearchItem } from "@/lib/search-index";

/**
 * "Senin için" önerileri.
 *
 * Öneri, müşterinin kendi davranışından çıkıyor: gezdiği ve
 * favorilediği ürünler. Uydurulan hiçbir sinyal yok — "şu an 14
 * kişi bakıyor" türü sayılar burada da, başka bir yerde de
 * üretilmiyor.
 *
 * Mantık kasten basit tutuldu, çünkü veri de basit: elimizde
 * kategori ve marka var. Karmaşık bir model kurmak, olmayan
 * bilgiden anlam çıkarmaya çalışmak olurdu.
 *
 *   - Müşterinin baktığı ürünlerin kategorileri ve markaları
 *     sayılıyor.
 *   - Yeni bakılan ürün, eski bakılandan daha ağır sayılıyor:
 *     bugün pantolon arayan biri, üç gün önceki parfüm bakışıyla
 *     yönlendirilmemeli.
 *   - Kategori markadan ağır. Müşteri genelde bir ihtiyaçla gelir
 *     ("tişört lazım"), markayla değil.
 *   - Aynı markadan en fazla dört ürün öneriliyor: yoksa raf tek
 *     bir markanın vitrinine dönüşüyor ve öneri gibi değil,
 *     reklam gibi duruyor.
 */

const KATEGORI_AGIRLIGI = 3;
const MARKA_AGIRLIGI = 2;
const MARKA_BASINA_TAVAN = 4;

/** Listedeki sıraya göre azalan ağırlık: ilk sıradaki en taze. */
const tazelik = (sira: number) => 1 / (1 + sira * 0.2);

export function recommend(
  index: SearchItem[],
  gorulenSluglar: string[],
  limit = 10,
): SearchItem[] {
  const gorulen = new Set(gorulenSluglar);
  if (gorulen.size === 0) return [];

  const bySlug = new Map(index.map((item) => [item.slug, item]));

  const kategoriPuan = new Map<string, number>();
  const markaPuan = new Map<string, number>();

  gorulenSluglar.forEach((slug, sira) => {
    const item = bySlug.get(slug);
    /* Katalogdan kalkmış ya da stoğu bitmiş ürün: dizinde yok.
       Sessizce atlanıyor, öneri yine de üretiliyor. */
    if (!item) return;

    const agirlik = tazelik(sira);
    kategoriPuan.set(
      item.category,
      (kategoriPuan.get(item.category) ?? 0) + agirlik,
    );
    markaPuan.set(item.brand, (markaPuan.get(item.brand) ?? 0) + agirlik);
  });

  if (kategoriPuan.size === 0 && markaPuan.size === 0) return [];

  const puanlanan: Array<{ item: SearchItem; puan: number }> = [];

  for (const item of index) {
    if (gorulen.has(item.slug)) continue;

    const puan =
      KATEGORI_AGIRLIGI * (kategoriPuan.get(item.category) ?? 0) +
      MARKA_AGIRLIGI * (markaPuan.get(item.brand) ?? 0);

    /* Hiçbir sinyalle bağı olmayan ürün öneri değildir. */
    if (puan <= 0) continue;
    puanlanan.push({ item, puan });
  }

  puanlanan.sort(
    (a, b) =>
      b.puan - a.puan ||
      /* Eşitlikte indirimli olan önce: müşteriye daha iyi teklif. */
      indirimOrani(b.item) - indirimOrani(a.item) ||
      a.item.name.localeCompare(b.item.name, "tr"),
  );

  const secilen: SearchItem[] = [];
  const markaSayaci = new Map<string, number>();

  for (const { item } of puanlanan) {
    if (secilen.length >= limit) break;
    const adet = markaSayaci.get(item.brand) ?? 0;
    if (adet >= MARKA_BASINA_TAVAN) continue;
    markaSayaci.set(item.brand, adet + 1);
    secilen.push(item);
  }

  return secilen;
}

const indirimOrani = (item: SearchItem) =>
  item.oldPrice && item.oldPrice > item.price
    ? 1 - item.price / item.oldPrice
    : 0;
