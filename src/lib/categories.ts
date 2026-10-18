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
  KARTTAKİ ÜRÜN SAYISININ YAZIMI.

  Kartlarda her kategorinin altında aynı "Keşfet" yazıyordu: dört
  kart dört ayrı fotoğraftan başka hiçbir şey söylemiyordu. Sayının
  kendisi `lib/kategori-vitrini`den geliyor; koda "binlerce ürün"
  yazmak gerçeğe bağlanmayan bir pazarlama cümlesi olurdu.
*/
/** 3225 → "3.225 ürün". */
export const urunSayisiYazisi = (sayi: number): string =>
  `${sayi.toLocaleString("tr-TR")} ürün`;


/*
  SABİT KATEGORİ SAYFALARININ KAPSAMI.

  Koleksiyon sayfasında duruyordu; ana sayfadaki kategori
  kartları da aynı grupları sayınca iki kopya olurdu ve biri
  güncellenmediğinde kart ile sayfa FARKLI sayı gösterirdi.

  Dört kategori sayfası (/koleksiyon/giyim, /bakim, /kozmetik,
  /parfum) ArvoARC'ta karşılığı olan koleksiyon DEĞİL; menü
  gruplarından toplanıyor.
*/
export const KATEGORI_MENU_GRUPLARI: Record<string, string[]> = {
  /*
    GRUP ADLARI ÖLÇÜMDEN (17.10.2026).

    Bu adlar ArvoARC'ta koleksiyon üstverisindeki `menu_group`
    değerleriyle BİREBİR eşleşmek zorunda; eşleşmeyen ad sessizce
    hiçbir şey getiriyor. Önce adları menünün ekrandaki
    başlıklarından çıkarmaya çalıştım ve üçü de yanlış çıktı:
    "Makyaj" ve "İhtiyaca Göre" diye grup YOK, "Kime Göre" ise
    parfüm grubu değil — 3.264 ürünle bütün kataloğu kapsayan
    çapraz bir grup. Doğru liste veritabanından sayıldı:

      Üst Giyim 2228 · Çocuk 383 · Dış Giyim 232 · Alt Giyim 222 ·
      Alt Üst Takım 111 · Giyim 45 · Aksesuar 37 · İç Giyim 27 ·
      Kime Göre 3264 · Kişisel Bakım 90 · Parfüm 43 ·
      Sorununa Göre 43 · Cilt Bakımı 35 · Diğer Bakımlar 24 ·
      Vücut Bakımı 19 · Kampanyalar 17 · Kozmetik 13 · Saç Bakımı 3

    Değişen tek şey "giyim": yalnızca "Giyim" grubunu (45 ürün)
    arıyordu, oysa giyim kataloğu altı grupta duruyor ve ~3.250
    ürün. Aksesuar burada yok: kendi sayfası var ve kemer ile gözlük
    "giyim" değil.
  */
  giyim: [
    "Giyim",
    "Üst Giyim",
    "Alt Giyim",
    "Dış Giyim",
    "Alt Üst Takım",
    "İç Giyim",
    "Çocuk",
  ],
  bakim: [
    "Kişisel Bakım",
    "Cilt Bakımı",
    "Saç Bakımı",
    "Vücut Bakımı",
    "Diğer Bakımlar",
    "Sorununa Göre",
  ],
  kozmetik: ["Kozmetik"],
  parfum: ["Parfüm"],
};
