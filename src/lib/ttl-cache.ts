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

/*
  ANAHTAR ZORUNLU: ÖNBELLEK MAĞAZA BAŞINA.

  İlk sürüm tek bir değer saklıyordu ve bu, vitrin tek mağazalıyken
  doğruydu. Çok mağazalı kipte aynı süreç birden çok mağazaya hizmet
  ediyor: anahtarsız bir önbellek, A mağazasının koleksiyonlarını ve
  SATIŞ KURALLARINI (kargo ücreti, havale indirimi) B mağazasının
  müşterisine gösterirdi. Hata vermeyen, yanlış fiyat gösteren bir
  sızıntı.

  Anahtar çağıranın verdiği metin; vitrinde mağazanın adresi.
*/
const AZAMI_ANAHTAR = 50;

export function ttlCache<T>(
  yukle: (anahtar: string) => Promise<T>,
  ttlMs: number,
  /**
   * Sonucu saklamaya değer mi? Boş liste genelde geçici bir
   * hatanın sonucudur; onu önbelleğe almak, bir saniyelik arızayı
   * dakikalarca sürdürmek olur.
   */
  saklanir: (deger: T) => boolean = (deger) =>
    !Array.isArray(deger) || deger.length > 0,
): (anahtar: string) => Promise<T> {
  const kayitlar = new Map<string, Kayit<T>>();
  /* Aynı anda gelen isteklerin hepsi ayrı ayrı veritabanına gitmesin. */
  const ucustakiler = new Map<string, Promise<T>>();

  return async (anahtar: string) => {
    const kayit = kayitlar.get(anahtar);
    if (kayit && Date.now() - kayit.at < ttlMs) return kayit.deger;

    const ucusta = ucustakiler.get(anahtar);
    if (ucusta) return ucusta;

    const istek = yukle(anahtar)
      .then((deger) => {
        if (saklanir(deger)) {
          /*
            Süresi geçmiş kayıtlar temizleniyor ve tavan var: adresi
            bize yönlenen her konak (yanlış yapılandırılmış bir DNS
            de olabilir) bellekte kalıcı bir satır açmasın.
          */
          if (kayitlar.size >= AZAMI_ANAHTAR) {
            const simdi = Date.now();
            for (const [k, v] of kayitlar) if (simdi - v.at >= ttlMs) kayitlar.delete(k);
            if (kayitlar.size >= AZAMI_ANAHTAR) kayitlar.clear();
          }
          kayitlar.set(anahtar, { at: Date.now(), deger });
        }
        return deger;
      })
      .finally(() => {
        ucustakiler.delete(anahtar);
      });

    ucustakiler.set(anahtar, istek);
    return istek;
  };
}
