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

/**
 * Arama. Sorgu kelimelere bölünür ve her kelimenin ürün adı,
 * marka veya kategoride geçmesi aranır — böylece "zeitgard serum"
 * gibi çok kelimeli aramalar da çalışır.
 *
 * Sıralama: adında geçenler önce, sonra marka, sonra kategori.
 */
export function searchProducts(items: SearchItem[], query: string) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const scored: Array<{ item: SearchItem; score: number }> = [];

  for (const item of items) {
    const name = normalize(item.name);
    const brand = normalize(item.brand);
    const category = normalize(item.category);
    const haystack = `${name} ${brand} ${category}`;

    if (!words.every((word) => haystack.includes(word))) continue;

    let score = 0;
    for (const word of words) {
      if (name.startsWith(word)) score += 6;
      else if (name.includes(word)) score += 4;
      else if (brand.includes(word)) score += 2;
      else score += 1;
    }

    scored.push({ item, score });
  }

  return scored
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, "tr"))
    .map((entry) => entry.item);
}
