/**
 * Teslimat ülkeleri.
 *
 * LİSTE TARİFEDEN ÇIKIYOR, dünyanın tamamından değil. Önce bütün ISO
 * kodlarını (280 kadar) basmayı denedim: içlerinde artık var olmayan
 * ülkeler (Sovyetler Birliği, Doğu Almanya, Zaire), ülke olmayan
 * kodlar (EU, UN, XK) ve kargo şirketinin hiç gitmediği yerler
 * (Antarktika, Bouvet Adası) vardı. Müşteriye gönderemeyeceğimiz bir
 * ülkeyi seçtirmek, onu ödeme adımının sonunda reddetmek demek.
 *
 * Bu yüzden iki kaynak birleşiyor:
 *  - mağazanın tarifesinde AÇIKÇA sayılan ülkeler (panelden yönetiliyor);
 *  - "öteki her yer" bölgesi tanımlıysa aşağıdaki yaygın hedefler.
 *
 * ADLAR `Intl.DisplayNames` İLE: 250 ülke adını iki dilde elle
 * yazmak, bir harf hatasının müşteriye yanlış ülke göstermesi demek.
 * Tarayıcı adı veremezse kod basılıyor — boş bir seçenekten iyi.
 */

/**
 * Yaygın hedefler: Avrupa, Kuzey Amerika, Körfez ve Türk nüfusunun
 * yoğun olduğu ülkeler. Mağaza bunun dışına gönderiyorsa panelde
 * bölgeye ülkeyi ekliyor; liste o ülkeyi kendiliğinden gösteriyor.
 */
export const YAYGIN_HEDEFLER = [
  "DE", "AT", "NL", "BE", "FR", "GB", "CH", "SE", "NO", "DK", "FI",
  "IT", "ES", "PT", "IE", "PL", "CZ", "SK", "HU", "RO", "BG", "GR",
  "HR", "SI", "EE", "LV", "LT", "LU", "CY", "MT",
  "US", "CA", "MX",
  "AE", "SA", "QA", "KW", "BH", "OM",
  "AU", "NZ", "JP", "KR", "SG", "IL", "AZ", "GE", "KZ", "UA", "RU",
] as const;

/**
 * Seçilebilir ülke kodları.
 *
 * Türkiye HER ZAMAN ilk sırada: vitrin önce Türkiye'ye satıyor ve
 * varsayılan onun seçili olması.
 */
export function teslimatUlkeleri(bolgeler: {
  countries: string[];
}[]): string[] {
  const sayilan = bolgeler.flatMap((b) => b.countries);
  /* Boş ülke listesi olan bir bölge "öteki her yer" demek: yaygın
     hedefler de açılıyor. */
  const genelVar = bolgeler.some((b) => b.countries.length === 0);

  const kodlar = new Set<string>();
  for (const kod of [...sayilan, ...(genelVar ? YAYGIN_HEDEFLER : [])]) {
    const temiz = kod.trim().toUpperCase();
    if (temiz && temiz !== "TR") kodlar.add(temiz);
  }
  return ["TR", ...[...kodlar].sort()];
}

/**
 * Ülke adı. `dil` vitrinin dili; tarayıcı tanımazsa kod dönüyor.
 *
 * Intl bulunmayan bir ortamda (çok eski tarayıcı) da kod dönüyor:
 * seçeneğin boş görünmesi, adının görünmemesinden kötü.
 */
export function ulkeAdi(kod: string, dil = "tr"): string {
  try {
    const ad = new Intl.DisplayNames([dil], {
      type: "region",
      fallback: "none",
    }).of(kod);
    return ad ?? kod;
  } catch {
    return kod;
  }
}
