import { KATEGORI_MENU_GRUPLARI } from "@/lib/categories";

/**
 * Bir koleksiyon sayfasının KAPSAMI: hangi koleksiyonlardan ya da
 * hangi menü gruplarından besleniyor.
 *
 * NEDEN AYRI DOSYA: aynı hesabı iki yer yapıyor — sayfanın kendisi
 * ve "daha fazla yükle" ucu. İkisi ayrılırsa düğmeyle gelen ürünler
 * sayfadakinden farklı bir kümeden çıkar; müşteri aynı listede iki
 * ayrı katalog görür ve bunu kimse fark etmez.
 */

/**
 * Tek sayfada birleştirilen koleksiyonlar.
 *
 * Burada uydurulan bir koleksiyon yok: hepsi ArvoARC'ta duran
 * gerçek koleksiyonlar, yalnızca tek sayfada toplanıyorlar.
 * ArvoARC tarafında birleştirilirlerse buradaki satır silinir ve
 * hiçbir şey değişmez.
 */
export const MERGED_COLLECTIONS: Record<string, string[]> = {
  "parfumler-erkek": [
    "parfumler-erkek",
    "kozmetik-kisisel-bakim-erkek-parfumu",
  ],
  "parfumler-kadin": [
    "parfumler-kadin",
    "kozmetik-kisisel-bakim-kadin-parfumu",
  ],
};

/** Birleştirmede yutulan koleksiyonlar: hangi sayfaya ait oldukları. */
export const MERGED_INTO = new Map(
  Object.entries(MERGED_COLLECTIONS).flatMap(([hedef, kaynaklar]) =>
    kaynaklar
      .filter((kaynak) => kaynak !== hedef)
      .map((kaynak) => [kaynak, hedef] as const),
  ),
);

export type KoleksiyonKapsami = {
  collectionSlugs: string[];
  menuGroups: string[] | undefined;
};

/**
 * Sayfanın kapsamı.
 *
 * `varMi`: bu slug ArvoARC'ta gerçek bir koleksiyon mu. Değilse
 * kapsam menü gruplarından kuruluyor (Erkek, Kadın gibi çatı
 * sayfalar birden çok grubu topluyor).
 */
export function koleksiyonKapsami(
  slug: string,
  varMi: boolean,
): KoleksiyonKapsami {
  const kaynaklar = MERGED_COLLECTIONS[slug] ?? (varMi ? [slug] : []);
  return {
    collectionSlugs: kaynaklar,
    menuGroups: kaynaklar.length ? undefined : KATEGORI_MENU_GRUPLARI[slug],
  };
}
