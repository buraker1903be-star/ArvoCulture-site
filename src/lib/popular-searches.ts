import "server-only";
import { getCachedSearchIndex } from "@/lib/search-cache";

/*
  Sık arananlar.

  Görsel kutular yerine metin: görsel eşleştirmesi katalog
  değiştikçe boşalıyordu ve tek satıra ancak altı kutu sığıyordu.
  Metinle çok daha fazla terim gösterilebiliyor ve hiçbir zaman
  boş kalmıyor.

  Terimler aramaya yazılıyor, koleksiyon slug’ına gitmiyor:
  koleksiyon adı değişse bile kırılmaz.
*/
const SEARCH_TERMS = [
  "Güneş kremi",
  "El kremi",
  "Yüz serumu",
  "Nemlendirici",
  "Şampuan",
  "Oversize tişört",
  "Sweatshirt",
  "Eşofman",
  "Parfüm",
  "Ruj",
  "Vitamin",
  "Kolajen",
  "Aloe vera",
  "Kapüşonlu",
  "Ceket",
];

/**
 * Katalogda karşılığı olan sık arananlar.
 *
 * Ana sayfadaki arama katmanı ve /arama sayfası aynı listeyi
 * kullanıyor. Sonuç vermeyen terimler gösterilmiyor: müşteri
 * tıklayıp boş listeyle karşılaşmasın.
 *
 * Dizin yalnızca sunucuda okunuyor; istemciye yalnızca terimler
 * gidiyor. Dizin çekilemezse terimlerin tamamı dönüyor: öneri
 * listesinin boş kalması, birkaç teriminin sonuçsuz çıkmasından
 * daha kötü.
 */
export async function getPopularSearches(): Promise<string[]> {
  const index = await getCachedSearchIndex().catch((error) => {
    console.error("Sık arananlar için arama dizini getirilemedi:", error);
    return [];
  });

  if (index.length === 0) return SEARCH_TERMS;

  return SEARCH_TERMS.filter((term) => {
    const needle = term.toLocaleLowerCase("tr-TR");
    return index.some((item) =>
      `${item.name} ${item.category}`
        .toLocaleLowerCase("tr-TR")
        .includes(needle),
    );
  });
}
