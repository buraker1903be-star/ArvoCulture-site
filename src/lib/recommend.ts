import type { SearchItem } from "@/lib/search-index";
import { toWords } from "@/lib/search";

/**
 * "Senin için" önerileri.
 *
 * Öneri, müşterinin kendi davranışından çıkıyor: gezdiği ve
 * favorilediği ürünler. Uydurulan hiçbir sinyal yok — "şu an 14
 * kişi bakıyor" türü sayılar burada da, başka bir yerde de
 * üretilmiyor.
 *
 * İLK SÜRÜM NEDEN YETMEDİ
 *
 * Önce yalnızca kategori ve marka üzerinden puanlıyordum. Canlıda
 * denediğimde işe yaramadığı ortaya çıktı ve sebebi kataloğun
 * şeklinde: `inferCategory` yalnızca beş kova üretiyor (Giyim,
 * Parfüm, Kozmetik, Takviyeler, Kişisel Bakım) ve katalogda
 * topu topu iki marka var. Yani "aynı kategori" demek "Giyim"
 * demekti — binlerce ürün. Öneri pratikte "giysiye baktın, işte
 * giysiler, alfabetik" anlamına geliyordu. Kişiselleşmiş
 * görünüyordu ama değildi.
 *
 * ŞİMDİ NE YAPIYOR
 *
 * Asıl bilgi ürün adının içinde duruyor: "Ace Vintage Oversize
 * Erkek Tişört Beyaz". Burada cinsiyet, giysi tipi, kesim ve renk
 * var — kategorinin veremediği her şey. Öneri artık ürün adındaki
 * kelimelerin örtüşmesine bakıyor.
 *
 * Kelimeler eşit ağırlıkta değil. "tisort" katalogda yüzlerce
 * üründe geçiyor, "zeitgard" bir avuç üründe. Az geçen kelime
 * daha çok şey anlatır; bu yüzden her kelimenin ağırlığı
 * katalogdaki seyrekliğinden hesaplanıyor (ters belge sıklığı).
 * Böylece "erkek tişört"e bakan müşteriye rastgele bir tişört
 * değil, benzer kesimde ve benzer tarzda olanlar geliyor.
 */

/** Ürün adı kelimelerinin ağırlığı; kategori ve marka destek. */
const KELIME_AGIRLIGI = 1;
const KATEGORI_AGIRLIGI = 0.6;
const MARKA_AGIRLIGI = 0.3;

/**
 * Aynı ürünün başka rengi öneri değildir.
 *
 * "Ace Vintage Oversize Erkek Tişört Beyaz" ile aynısının siyahı
 * katalogda iki ayrı kayıt ama müşteri için aynı şey; ikisini yan
 * yana önermek rafın yarısını harcamak demek.
 *
 * Önce kelime örtüşme oranına bakıyordum ve bu güvenilir
 * değildi: uzun adlarda iki renk %71 örtüşüyor, kısa adlarda
 * ("Kadın Tayt Siyah" / "Kadın Tayt Lacivert") aynı ürün olmasına
 * rağmen %50'ye düşüyor. Tek bir eşik ikisini birden yakalayamaz.
 *
 * Şimdi doğrudan asıl farka bakılıyor: renk kelimeleri çıkarılıp
 * geri kalan karşılaştırılıyor. Aynı üründe geriye kalan ad aynı
 * oluyor, farklı üründe olmuyor — ad uzunluğundan bağımsız.
 */
const AYNI_URUN_ESIGI = 0.9;

/**
 * Renk kelimeleri. Türkçe karakterler `toWords` tarafından
 * sadeleştirildiği için ASCII yazılıyor ("yesil", "kirmizi").
 */
const RENKLER = new Set([
  "beyaz",
  "siyah",
  "lacivert",
  "mavi",
  "kirmizi",
  "yesil",
  "sari",
  "pembe",
  "mor",
  "turuncu",
  "gri",
  "bej",
  "krem",
  "ekru",
  "kahverengi",
  "kahve",
  "bordo",
  "haki",
  "antrasit",
  "vizon",
  "gumus",
  "altin",
  "somon",
  "turkuaz",
  "petrol",
  "indigo",
  "fusya",
  "lila",
  "mint",
  "renkli",
]);

/** Listedeki sıraya göre azalan ağırlık: ilk sıradaki en taze. */
const tazelik = (sira: number) => 1 / (1 + sira * 0.2);

/** İki harfli ve daha kısa parçalar ("l", "xl", "2") ayırt etmiyor. */
const anlamli = (kelime: string) => kelime.length >= 3;

type Sozluk = {
  kelimeler: Map<string, Set<string>>;
  /** Kelimenin ağırlığı: katalogda ne kadar seyrekse o kadar yüksek. */
  agirlik: Map<string, number>;
  markaSayisi: number;
};

/*
  Sözlük dizin başına bir kez kuruluyor. Arama dizini süreç
  belleğinde beş dakika duruyor ve her istekte aynı dizi geliyor;
  WeakMap sayesinde dizin tazelendiğinde sözlük de kendiliğinden
  düşüyor, elle temizlemek gerekmiyor.
*/
const sozlukler = new WeakMap<SearchItem[], Sozluk>();

function sozlukKur(index: SearchItem[]): Sozluk {
  const mevcut = sozlukler.get(index);
  if (mevcut) return mevcut;

  const kelimeler = new Map<string, Set<string>>();
  const sayac = new Map<string, number>();
  const markalar = new Set<string>();

  for (const item of index) {
    markalar.add(item.brand);
    const set = new Set(toWords(item.name).filter(anlamli));
    kelimeler.set(item.slug, set);
    for (const kelime of set) sayac.set(kelime, (sayac.get(kelime) ?? 0) + 1);
  }

  /*
    Ters belge sıklığı. Her üründe geçen kelime sıfıra yakın ağırlık
    alıyor, birkaç üründe geçen kelime yüksek. Logaritma, seyrek
    kelimelerin ağırlığının kontrolsüz büyümesini engelliyor.
  */
  const toplam = Math.max(index.length, 1);
  const agirlik = new Map<string, number>();
  for (const [kelime, adet] of sayac) {
    agirlik.set(kelime, Math.log(toplam / adet));
  }

  const sozluk: Sozluk = { kelimeler, agirlik, markaSayisi: markalar.size };
  sozlukler.set(index, sozluk);
  return sozluk;
}

/** Rengi çıkarılmış ad: ürünün kimliği. */
const cekirdek = (kelimeler: Set<string>) =>
  new Set([...kelimeler].filter((kelime) => !RENKLER.has(kelime)));

/** İki kelime kümesinin örtüşme oranı (Jaccard). */
function ortusme(a: Set<string>, b: Set<string>) {
  /*
    İki kelimeden kısa çekirdek ("Tayt") ayırt etmeye yetmiyor;
    böyle bir adla karşılaştırma yapmak, alakasız ürünleri aynı
    sanıp elemek olurdu.
  */
  if (a.size < 2 || b.size < 2) return 0;
  let kesisim = 0;
  for (const kelime of a) if (b.has(kelime)) kesisim += 1;
  return kesisim / (a.size + b.size - kesisim);
}

export function recommend(
  index: SearchItem[],
  gorulenSluglar: string[],
  limit = 10,
): SearchItem[] {
  const gorulen = new Set(gorulenSluglar);
  if (gorulen.size === 0 || index.length === 0) return [];

  const sozluk = sozlukKur(index);
  const bySlug = new Map(index.map((item) => [item.slug, item]));

  /* Her kelimenin, kategorinin ve markanın müşteri nezdindeki puanı. */
  const kelimePuan = new Map<string, number>();
  const kategoriPuan = new Map<string, number>();
  const markaPuan = new Map<string, number>();
  const gorulenKelimeKumeleri: Array<Set<string>> = [];

  gorulenSluglar.forEach((slug, sira) => {
    const item = bySlug.get(slug);
    /* Katalogdan kalkmış ya da stoğu bitmiş ürün: dizinde yok.
       Sessizce atlanıyor, öneri yine de üretiliyor. */
    if (!item) return;

    const agirlik = tazelik(sira);
    const set = sozluk.kelimeler.get(slug);
    if (set) {
      gorulenKelimeKumeleri.push(cekirdek(set));
      for (const kelime of set) {
        kelimePuan.set(kelime, (kelimePuan.get(kelime) ?? 0) + agirlik);
      }
    }

    kategoriPuan.set(
      item.category,
      (kategoriPuan.get(item.category) ?? 0) + agirlik,
    );
    markaPuan.set(item.brand, (markaPuan.get(item.brand) ?? 0) + agirlik);
  });

  if (kelimePuan.size === 0 && kategoriPuan.size === 0) return [];

  const puanlanan: Array<{
    item: SearchItem;
    puan: number;
    kelimeler: Set<string>;
  }> = [];

  for (const item of index) {
    if (gorulen.has(item.slug)) continue;

    const set = sozluk.kelimeler.get(item.slug) ?? new Set<string>();

    let kelimeToplami = 0;
    for (const kelime of set) {
      const puan = kelimePuan.get(kelime);
      if (puan) kelimeToplami += puan * (sozluk.agirlik.get(kelime) ?? 0);
    }

    const puan =
      KELIME_AGIRLIGI * kelimeToplami +
      KATEGORI_AGIRLIGI * (kategoriPuan.get(item.category) ?? 0) +
      MARKA_AGIRLIGI * (markaPuan.get(item.brand) ?? 0);

    /* Hiçbir sinyalle bağı olmayan ürün öneri değildir. */
    if (puan <= 0) continue;
    puanlanan.push({ item, puan, kelimeler: set });
  }

  puanlanan.sort(
    (a, b) =>
      b.puan - a.puan ||
      /* Eşitlikte indirimli olan önce: müşteriye daha iyi teklif. */
      indirimOrani(b.item) - indirimOrani(a.item) ||
      a.item.name.localeCompare(b.item.name, "tr"),
  );

  /*
    Marka tavanı yalnızca katalogda yeterince marka varsa
    uygulanıyor. İlk sürümde koşulsuzdu ve bu katalogda iki marka
    olduğu için öneri sayısını dörde düşürüyordu — çeşitlilik
    korunayım derken rafı boşaltmak.
  */
  const markaTavani = sozluk.markaSayisi >= 4 ? 4 : limit;

  const secilen: SearchItem[] = [];
  const secilenKelimeler: Array<Set<string>> = [];
  const markaSayaci = new Map<string, number>();

  for (const aday of puanlanan) {
    if (secilen.length >= limit) break;

    const adet = markaSayaci.get(aday.item.brand) ?? 0;
    if (adet >= markaTavani) continue;

    /* Zaten seçilmiş ya da zaten gezilmiş bir ürünün başka rengi mi? */
    const adayCekirdegi = cekirdek(aday.kelimeler);
    const tekrar = [...secilenKelimeler, ...gorulenKelimeKumeleri].some(
      (set) => ortusme(set, adayCekirdegi) >= AYNI_URUN_ESIGI,
    );
    if (tekrar) continue;

    markaSayaci.set(aday.item.brand, adet + 1);
    secilen.push(aday.item);
    secilenKelimeler.push(adayCekirdegi);
  }

  return secilen;
}

const indirimOrani = (item: SearchItem) =>
  item.oldPrice && item.oldPrice > item.price
    ? 1 - item.price / item.oldPrice
    : 0;
