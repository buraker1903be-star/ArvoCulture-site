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
const toWords = (value: string) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

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
 * "parfum" yazınca parfümler.
 */
const matchesWord = (haystackWords: string[], word: string) =>
  haystackWords.some((candidate) => candidate.startsWith(word));

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
    const nameWords = toWords(item.name);
    const brandWords = toWords(item.brand);
    const categoryWords = toWords(item.category);

    /* Her arama kelimesi bir yerde karşılık bulmalı. */
    const hepsiVar = words.every(
      (word) =>
        matchesWord(nameWords, word) ||
        matchesWord(brandWords, word) ||
        matchesWord(categoryWords, word),
    );
    if (!hepsiVar) continue;

    let score = 0;
    for (const word of words) {
      /* Ürün adının ilk kelimesiyle başlıyorsa en güçlü sinyal. */
      if (nameWords[0]?.startsWith(word)) score += 6;
      else if (matchesWord(nameWords, word)) score += 4;
      else if (matchesWord(brandWords, word)) score += 2;
      else score += 1;
    }

    scored.push({ item, score });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score || a.item.name.localeCompare(b.item.name, "tr"),
    )
    .map((entry) => entry.item);
}
