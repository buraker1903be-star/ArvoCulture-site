import type { SearchItem } from "@/lib/search-index";

/**
 * Türkçe arama normalleştirmesi.
 *
 * Kullanıcı "parfum" yazdığında "parfüm" bulunmalı, "sampuan"
 * yazdığında "şampuan". Türkçe karakterleri ASCII karşılığına
 * indirger; `toLocaleLowerCase("tr-TR")` tek başına bunu yapmaz.
 */
export function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/â/g, "a")
    .trim();
}

/** Normalleştirilmiş metni aranabilir kelimelere böler. */
export const toWords = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

/*
  TÜRKÇE ÇEKİM EKLERİ.

  Eşleşme yalnızca tek yöne bakıyordu: dizindeki kelime sorguyla
  başlıyor mu. "dudak kalemi" çalışıyordu ama "dudak kalemleri" hiç
  sonuç vermiyordu — "kalem" kelimesi "kalemleri" ile BAŞLAMIYOR.
  30.09.2026'da canlı uçta ölçüldü: "rujlar", "şampuanlar",
  "aloe verası", "kadın parfümü", "cilt bakımı", "güneş kremleri"
  hepsi 0 sonuç; tekil hâlleri çalışıyordu. Müşteri çoğul yazdığı
  için kataloğu boş sanıyordu.

  Tam bir Türkçe gövdeleyici değil, bilerek: sesli uyumunu ve ünsüz
  yumuşamasını çözmeye kalkmak (kitap→kitabı) burada kazandırdığından
  çok yanlış eşleşme üretirdi. Yalnızca sık çekim ekleri, uzundan
  kısaya soyuluyor.

  Ekler normalleştirilmiş (ASCII) hâlleriyle yazılı: normalize() ı→i,
  ü→u, ö→o, ş→s yaptığı için "ları" burada "lari".
*/
const EKLER = [
  "lerinden", "larindan", "lerine", "larina", "lerini", "larini",
  "leriyle", "lariyla", "lerin", "larin", "lerden", "lardan",
  "lerde", "larda", "lere", "lara", "leri", "lari", "ler", "lar",
  "nin", "nun", "nin", "sin", "sun", "den", "dan", "ten", "tan",
  "siyle", "siyla", "yle", "yla", "ile",
  "de", "da", "te", "ta", "ne", "na", "ni", "nu", "si", "su",
  "in", "un", "ye", "ya", "i", "u", "e", "a",
];

/* Gövde bundan kısalırsa ek soyulmuyor: "eli" → "el" gibi iki
   harflik gövdeler hemen her ürüne uyar ve arama anlamsızlaşır. */
const EN_KISA_GOVDE = 3;

/** Kelimenin kendisi ve eki soyulmuş hâli. */
export function govdeler(word: string): string[] {
  for (const ek of EKLER) {
    if (!word.endsWith(ek)) continue;
    const govde = word.slice(0, -ek.length);
    if (govde.length >= EN_KISA_GOVDE) return [word, govde];
  }
  return [word];
}

/**
 * Bir arama kelimesi, metindeki herhangi bir kelimenin başında
 * geçiyor mu?
 *
 * Önceden metnin herhangi bir yerinde geçmesi yeterliydi ve bu
 * yanlış sonuçlar üretiyordu: "şort" araması tişörtleri getiriyordu,
 * çünkü normalleştirilmiş "tisort" metni "sort" dizisini içeriyor.
 * Şort arayan müşteriye tişört göstermek, aramanın işini yapmaması
 * demek.
 *
 * Kelime başı eşleşmesi hem bu hatayı bitiriyor hem de yazarken
 * arama davranışına uygun: "zeit" yazınca ZEITGARD geliyor,
 * "parfum" yazınca parfümler. Ek soyulmuş gövde de aynı kuralla
 * aranıyor, "içinde geçiyor mu"ya dönülmüyor.
 */
const matchesWord = (haystackWords: string[], word: string) =>
  govdeler(word).some((aday) =>
    haystackWords.some((candidate) => candidate.startsWith(aday)),
  );

/** Bir ürünün sorgu kelimelerine verdiği karşılık. */
function puanla(item: SearchItem, words: string[]) {
  const nameWords = toWords(item.name);
  const brandWords = toWords(item.brand);
  const categoryWords = toWords(item.category);

  let score = 0;
  let eslesen = 0;
  for (const word of words) {
    /* Ürün adının ilk kelimesiyle başlıyorsa en güçlü sinyal. */
    if (nameWords[0] && matchesWord([nameWords[0]], word)) {
      score += 6;
      eslesen += 1;
    } else if (matchesWord(nameWords, word)) {
      score += 4;
      eslesen += 1;
    } else if (matchesWord(brandWords, word)) {
      score += 2;
      eslesen += 1;
    } else if (matchesWord(categoryWords, word)) {
      score += 1;
      eslesen += 1;
    }
  }
  return { score, eslesen };
}

/**
 * Arama. Sorgu kelimelere bölünür ve her kelimenin ürün adı,
 * marka veya kategoride geçmesi aranır — böylece "zeitgard serum"
 * gibi çok kelimeli aramalar da çalışır.
 *
 * Sıralama: adında geçenler önce, sonra marka, sonra kategori.
 */
export function searchProducts(items: SearchItem[], query: string) {
  const words = toWords(query);
  if (words.length === 0) return [];

  const scored: Array<{ item: SearchItem; score: number }> = [];
  for (const item of items) {
    const { score, eslesen } = puanla(item, words);
    /* Her arama kelimesi bir yerde karşılık bulmalı. */
    if (eslesen === words.length) scored.push({ item, score });
  }
  return sirala(scored);
}

const sirala = (scored: Array<{ item: SearchItem; score: number }>) =>
  scored
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.localeCompare(b.item.name, "tr"),
    )
    .map((entry) => entry.item);

/**
 * Aramanın dışarıya açılan hâli: önce tam eşleşme, olmazsa yakın
 * sonuçlar.
 *
 * NEDEN VAR: müşteri ürünü kataloğun kelimeleriyle değil, kendi
 * kelimeleriyle arıyor. 30.09.2026'da canlı uçta ölçüldü —
 * "kadın parfümü" 0 sonuç veriyordu, oysa 43 parfüm var; katalogda
 * "kadın" kelimesi geçmiyor diye hepsi eleniyordu. "güneş kremi" de
 * 0'dı: ürünler "Güneş Koruyucu" ve "Güneş Spreyi". Müşteriye boş
 * sayfa göstermek, elimizde olanı göstermemekten daha kötü.
 *
 * Yalnızca TAM EŞLEŞME HİÇ YOKKEN ve sorgu çok kelimeliyken devreye
 * giriyor; tek kelimelik sorguda "yakın" diye bir şey yok, o zaten
 * ya eşleşir ya eşleşmez. Sonuç `yaklasik` ile işaretleniyor: liste
 * aradığının tam karşılığıymış gibi sunulursa müşteri yanlış ürünü
 * aradığı sanır.
 */
export function aramaSonuclari(
  items: SearchItem[],
  query: string,
): { sonuclar: SearchItem[]; yaklasik: boolean } {
  const tam = searchProducts(items, query);
  if (tam.length > 0) return { sonuclar: tam, yaklasik: false };

  const words = toWords(query);
  if (words.length < 2) return { sonuclar: [], yaklasik: false };

  const scored: Array<{ item: SearchItem; score: number }> = [];
  for (const item of items) {
    const { score, eslesen } = puanla(item, words);
    if (eslesen === 0) continue;
    /* Çok kelimesi tutan önce: "güneş kremi"nde iki kelimeyi birden
       karşılayan bir ürün varsa tek kelimeliklerin üstünde durmalı. */
    scored.push({ item, score: eslesen * 100 + score });
  }
  return { sonuclar: sirala(scored), yaklasik: scored.length > 0 };
}
