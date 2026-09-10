import "server-only";

/**
 * Süreç belleğinde süreli önbellek.
 *
 * NEDEN GEREKİYOR
 *
 * `arc.ts` isteklerini `POST` ile atıyor — PostgREST'te fonksiyon
 * çağrısının yolu bu. Next'in veri önbelleği ise yalnızca `GET`
 * isteklerini saklıyor. Yani `rpc()` çağrılarına verilen
 * `revalidate: 60` gibi değerler hiçbir işe yaramıyor: her dinamik
 * sayfa render'ı aynı veriyi yeniden çekiyor.
 *
 * Bu, sitenin tamamı için geçerli değil. Tema `GET` ile çekiliyor
 * ve gerçekten önbelleğe giriyor; ana sayfa gibi statik üretilen
 * sayfalar da uçta saklanıyor. Sorun, her istekte yeniden
 * çizilen sayfalarda (koleksiyon, arama) katman verisinin
 * defalarca çekilmesi.
 *
 * NEREYE UYGULANIR, NEREYE UYGULANMAZ
 *
 * Yalnızca müşteriden bağımsız, yavaş değişen veriye: koleksiyon
 * listesi, indirim tanımları. Ürün fiyatı, stok, sepet, sipariş ve
 * hesap verisi buraya girmez — orada eski veri göstermek, hız
 * kazancının karşılayamayacağı bir bedeldir.
 *
 * Önbellek örnek başına. Vercel birden çok sunucu örneği
 * çalıştırabilir; her biri kendi kopyasını tutar. Bu bir eksiklik
 * değil, kabul: amaç tek bir doğruluk kaynağı kurmak değil, aynı
 * saniye içinde aynı sorguyu on kez atmamak.
 */

type Kayit<T> = { at: number; deger: T };

export function ttlCache<T>(
  yukle: () => Promise<T>,
  ttlMs: number,
  /**
   * Sonucu saklamaya değer mi? Boş liste genelde geçici bir
   * hatanın sonucudur; onu önbelleğe almak, bir saniyelik arızayı
   * dakikalarca sürdürmek olur.
   */
  saklanir: (deger: T) => boolean = (deger) =>
    !Array.isArray(deger) || deger.length > 0,
): () => Promise<T> {
  let kayit: Kayit<T> | null = null;
  /* Aynı anda gelen isteklerin hepsi ayrı ayrı veritabanına gitmesin. */
  let ucusta: Promise<T> | null = null;

  return async () => {
    if (kayit && Date.now() - kayit.at < ttlMs) return kayit.deger;
    if (ucusta) return ucusta;

    ucusta = yukle()
      .then((deger) => {
        if (saklanir(deger)) kayit = { at: Date.now(), deger };
        return deger;
      })
      .finally(() => {
        ucusta = null;
      });

    return ucusta;
  };
}
