import "server-only";
import { getSearchIndex, type SearchItem } from "@/lib/search-index";

/**
 * Arama dizininin süreç belleğindeki kopyası.
 *
 * Dizin iki yerde gerekiyor: arama ucu (her tuş vuruşunda) ve ana
 * sayfa (önerilen arama terimlerinden sonuç vermeyenleri elemek
 * için). İkisi de her seferinde veritabanından 3.100 satır çekseydi
 * ne arama akıcı olurdu ne de ana sayfa hızlı.
 *
 * Önemli olan şu: dizin sunucuda kalıyor. Ana sayfa onu yalnızca
 * kontrol için okuyor, istemciye göndermiyor — 1,8 MB'lık sayfa
 * ağırlığının sebebi dizinin istemci bileşenine prop olarak
 * verilmesiydi.
 *
 * Süre katalogun değişim hızına göre seçildi: fiyat ve stok arama
 * sonucunda gösteriliyor, çok eski veri gösterilmemeli.
 */
const TTL_MS = 5 * 60 * 1000;

let cache: { at: number; items: SearchItem[] } | null = null;
/* Aynı anda gelen isteklerin hepsi ayrı ayrı veritabanına gitmesin. */
let inflight: Promise<SearchItem[]> | null = null;

export async function getCachedSearchIndex(): Promise<SearchItem[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.items;
  if (inflight) return inflight;

  inflight = getSearchIndex()
    .then((items) => {
      /*
        Boş dizin önbelleğe alınmıyor: geçici bir hata beş dakika
        boyunca "hiçbir şey bulunamadı" demeye dönüşmemeli.
      */
      if (items.length > 0) cache = { at: Date.now(), items };
      return items;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
}
