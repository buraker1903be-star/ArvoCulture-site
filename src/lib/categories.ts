/**
 * Ana sayfadaki kategori listesi.
 *
 * page.tsx içinde duruyordu; iki yerden okunuyor (kategori kartları ve
 * hero'nun altındaki kısayol şeridi) ve o dosya sunucuya özel modüller
 * çektiği için test edilemiyordu. Ayrı ve saf bir modülde durunca
 * tests/kategori.test.ts listeyi doğrulayabiliyor.
 *
 * `href`in son parçası aynı zamanda GÖRSEL ANAHTARIDIR: kart
 * `public/kategori/<anahtar>.jpg` dosyasını basar. Dosya yoksa ana
 * sayfada kırık görsel çıkar ve hiçbir şey uyarmaz — test bu yüzden
 * her anahtarın dosyasını arıyor.
 */
export type SiteCategory = { label: string; href: string };

export const CATEGORIES: SiteCategory[] = [
  { label: "Giyim", href: "/koleksiyon/giyim" },
  { label: "Kişisel Bakım", href: "/koleksiyon/bakim" },
  { label: "Kozmetik", href: "/koleksiyon/kozmetik" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
];

/** "/koleksiyon/bakim" → "bakim" */
export const categoryKey = (href: string): string => href.split("/").pop() ?? "";

/**
 * Türkçe adı adres parçasına indirger: "Çocuk" → "cocuk".
 *
 * `toLocaleLowerCase("tr-TR")` tek başına yetmiyor; ç, ş, ğ, ü, ö
 * küçük hâllerinde de Türkçe karakter olarak kalıyor ve ArvoARC'ın
 * slug'ları ASCII.
 */
export const asciiSlug = (value: string): string =>
  value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a");

/**
 * ArvoARC'ta koleksiyonu olmayan, vitrinin kendi kurduğu sayfalar.
 *
 * Koleksiyon rotası hem gerçek ArvoARC koleksiyonlarına hem bu sabit
 * adreslere cevap veriyor; "tanınmayan slug" kararı ikisine birden
 * bakmak zorunda. Liste hem sayfada (başlık) hem yerleşimde (404
 * kararı) okunuyor, bu yüzden tek yerde duruyor.
 */
export const SABIT_KOLEKSIYONLAR: Record<string, string> = {
  giyim: "Giyim",
  bakim: "Kişisel Bakım",
  kozmetik: "Kozmetik",
  parfum: "Parfüm",
  tumu: "Tüm Ürünler",
};

/*
  KATEGORİ ADINDAN SAYFA ADRESİ (17.10.2026).

  Ürün sayfasındaki ekmek kırıntısı "Ana sayfa / Kozmetik / <ürün>"
  diyor ama ortadaki bağlantı /koleksiyon/tumu'ya gidiyordu: adı
  "Kozmetik" olan bir bağlantı 3.400 ürünlük tüm kataloğu açıyordu.
  Hem müşteri için yanıltıcı, hem BreadcrumbList şemasında adıyla
  hedefi uyuşmayan bir basamak.

  Kategorinin kendi sayfası zaten var (SABIT_KOLEKSIYONLAR); burada
  ad → slug yönü kuruluyor. Tanınmayan ad "tumu"ya düşüyor —
  inferCategory ileride yeni bir kova eklerse kırık bağlantı değil,
  geniş bir liste çıkar.
*/
export const kategoriAdresi = (etiket: string): string => {
  const slug = Object.entries(SABIT_KOLEKSIYONLAR).find(
    ([, ad]) => ad.toLocaleLowerCase("tr-TR") === etiket.trim().toLocaleLowerCase("tr-TR"),
  )?.[0];
  return `/koleksiyon/${slug ?? "tumu"}`;
};


/*
  KATEGORİ KARTINDAKİ ÜRÜN SAYISI.

  Kartlarda her kategorinin altında aynı "Keşfet" yazıyordu: dört
  kart dört ayrı fotoğraftan başka hiçbir şey söylemiyordu. Müşteri
  bölümün büyüklüğünü ancak içine girince görüyordu — oysa "3.225
  ürün" tek başına girme sebebi.

  Sayı ArvoARC'tan geliyor (`arc_storefront_collections.product_count`,
  menünün de kullandığı çağrı: aynı istekte `cache` ile bir kez
  okunuyor, ek sorgu YOK). Koda "binlerce ürün" yazmak gerçeğe
  bağlanmayan bir pazarlama cümlesi olurdu; katalog her gün
  değişiyor.

  Eşleşme kategori anahtarı ile koleksiyon slug'ı üzerinden: anahtar
  `/koleksiyon/<slug>` adresinin son parçası, yani zaten aynı şey.
  Eşleşme yoksa ya da sayı sıfırsa alan BOŞ kalıyor — "0 ürün" yazan
  bir kart, kategoriyi hiç göstermemekten kötü.
*/
export type KategoriKarti = SiteCategory & { urunSayisi?: number };

export function kategoriSayilariyla(
  items: SiteCategory[],
  koleksiyonlar: Array<{ slug: string; product_count: number }>,
): KategoriKarti[] {
  const sayilar = new Map(
    koleksiyonlar.map((koleksiyon) => [koleksiyon.slug, koleksiyon.product_count]),
  );
  return items.map((item) => {
    const sayi = sayilar.get(categoryKey(item.href));
    return Number.isFinite(sayi) && (sayi ?? 0) > 0
      ? { ...item, urunSayisi: sayi }
      : item;
  });
}

/** 3225 → "3.225 ürün". */
export const urunSayisiYazisi = (sayi: number): string =>
  `${sayi.toLocaleString("tr-TR")} ürün`;
