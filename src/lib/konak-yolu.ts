/*
  PROXY'NİN KARARI: BU ADRES YENİDEN YAZILACAK MI, NASIL?

  `src/proxy.ts` her isteği `/<konak>/...` olarak yeniden yazıyor
  (gerekçe orada). Karar burada ve SAF: eleme listesi sessizce
  bozulabilecek türden — yanlışlıkla elenen bir rota 404 verir,
  elenmeyen bir dosya ise yeniden yazılıp kaybolur. İkisi de
  derlemede görünmez, o yüzden testle sabitleniyor.
*/

/* public/ altındaki gerçek dosyaların uzantıları. Liste dar
   tutuluyor: tanımadığımız bir uzantı rota olabilir ve yeniden
   yazılmazsa 404 verirdi. */
const DOSYA_UZANTILARI = /\.(png|jpe?g|gif|svg|webp|avif|ico|js|css|woff2?|ttf|map)$/i;

/*
  Next'in KÖK DİZİNE ÖZGÜ sözleşmeleri. `[konak]` altına
  taşındıklarında rota listesinden tamamen düştüler: robots ve
  manifest hiç üretilmedi, site haritası tuhaf bir adres aldı
  (18.10.2026'da ölçüldü). Bu yüzden kökte duruyorlar, konağı
  kendileri okuyor ve yeniden yazılmıyorlar.

  `/llms.txt` uzantılı AMA sıradan bir rota klasörü; o yeniden
  yazılıyor.
*/
const KOK_SOZLESMELERI = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.webmanifest",
]);

/** İstek başlığından konak: şema, port ve büyük harf düşürülür. */
export function konagiTemizle(ham: string | null | undefined): string {
  return (ham ?? "")
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .replace(/:\d+$/, "")
    .replace(/[/?#].*$/, "");
}

/**
 * Yeni yol; yeniden yazılmayacaksa `null`.
 *
 * Konak boşsa da `null`: boş bir segment bütün adresleri bozardı.
 */
export function yolaYaz(pathname: string, konak: string): string | null {
  if (!konak) return null;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    KOK_SOZLESMELERI.has(pathname) ||
    DOSYA_UZANTILARI.test(pathname)
  ) {
    return null;
  }

  /* Zaten yazılmışsa tekrar yazma (iç yönlendirmeler). */
  if (pathname === `/${konak}` || pathname.startsWith(`/${konak}/`)) return null;

  return `/${konak}${pathname === "/" ? "" : pathname}`;
}
