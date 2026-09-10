import "server-only";
import { getSearchIndex, type SearchItem } from "@/lib/search-index";
import { ttlCache } from "@/lib/ttl-cache";

/**
 * Arama dizininin süreç belleğindeki kopyası.
 *
 * Dizin iki yerde gerekiyor: arama ucu (her tuş vuruşunda) ve
 * öneri ucu. İkisi de her seferinde veritabanından 3.100 satır
 * çekseydi ne arama akıcı olurdu ne de öneri.
 *
 * Önemli olan şu: dizin sunucuda kalıyor, istemciye gönderilmiyor —
 * ana sayfanın 1,8 MB'lık ağırlığının sebebi dizinin bir istemci
 * bileşenine prop olarak verilmesiydi.
 *
 * Süre katalogun değişim hızına göre seçildi: fiyat ve stok arama
 * sonucunda gösteriliyor, çok eski veri gösterilmemeli.
 *
 * Buradaki mekanizma artık `ttlCache` içinde ve koleksiyonlarla,
 * indirimlerle ortak. Boş dizinin saklanmaması da oradan geliyor:
 * geçici bir hata beş dakika boyunca "hiçbir şey bulunamadı"
 * demeye dönüşmemeli.
 */
const TTL_MS = 5 * 60 * 1000;

export const getCachedSearchIndex: () => Promise<SearchItem[]> = ttlCache(
  getSearchIndex,
  TTL_MS,
);
