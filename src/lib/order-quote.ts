import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "./shipping";
import { SELLER } from "./seller";
import { kargoSenti, type Bolge } from "./kargo-bolgesi";

/*
  Sepet ve ödeme ekranındaki tutar hesapları — ArvoARC'ın aynası.

  Gerçek tutarı ArvoARC hesaplar ve PayTR'a giden odur; burada yalnızca
  müşteriye gösterilen rakamlar var. Ama gösterilen rakam ödenen
  rakamla aynı olmalı. Önceden bu kurallar üç bileşende ayrı ayrı
  yazılıydı ve ArvoARC 17 Eylül 2026'da iki kuralı değiştirdiğinde vitrine
  taşınmadı (ArvoARC commit d05a033 ve f74cb99; ikisi de "vitrin ayrıca
  güncellenmeli" diye not düşmüştü):

   - Ücretsiz kargo eşiği indirim ÖNCESİ ara toplamla karşılaştırılır.
     Çekmece indirim SONRASI tutara bakıyordu: 2.000 TL'lik sepette %10
     kupon giren müşteri 120 TL kargo görüyordu, ArvoARC kargo almıyordu.
   - "Ücretsiz Kargo" kuponu kargoyu sıfırlar. Sepet sayfası ve ödeme
     formu bunu görmüyor, kargoyu yine gösteriyordu.
   - Havale indirimi yalnızca mal bedeline uygulanır, kargoya değil; ve
     kuruşta yuvarlanır. Ödeme formu kargo dahil toplamın %3'ünü alıp
     tam liraya yuvarlıyordu.

  Hesaplar ArvoARC gibi kuruş tamsayısıyla yapılır; bileşenler TL ile
  konuştuğu için giriş ve çıkış TL. Kaynaklar:
   - kargo ve kupon: ArvoARC supabase/migrations/20260917150000_free_shipping_coupon.sql
   - havale:        ArvoARC src/app/api/storefront/odeme/route.ts
*/

/** TL → kuruş (tamsayı). */
export const toKurus = (lira: number) => Math.round(lira * 100);

/**
 * Mağazanın satış ayarları (TL). ArvoARC'ta mağaza panelinden değişir;
 * vitrin get_arvoculture_storefront_settings ile okur
 * (lib/store-settings.ts). Okunamazsa varsayılan: bugünkü sabitler.
 */
export type SalesRules = {
  shippingFee: number;
  freeShippingOver: number;
  transferEnabled: boolean;
  transferDiscountPercent: number;
  /*
    YURTDIŞI SATIŞI. Kur ve kâr payı ArvoARC'tan geliyor; dolar
    fiyatını VİTRİN hesaplıyor (lib/dolar). Mod kapalıyken kur da
    gelmiyor: kapalı mod "dolar yok" demek ve o yokluk burada da
    `null` olarak duruyor — sıfır olsaydı "kur 0" ile "kur yok"
    aynı şeye inerdi.
  */
  internationalEnabled: boolean;
  usdRate: number | null;
  usdMarginPercent: number;
};

export const DEFAULT_SALES_RULES: SalesRules = {
  shippingFee: SHIPPING_FEE,
  freeShippingOver: FREE_SHIPPING_OVER,
  transferEnabled: true,
  transferDiscountPercent: SELLER.transferDiscountPercent,
  /* Varsayılan KAPALI: ayar okunamadığında yurtdışı vitrini
     açılmamalı — fiyatı bilinmeyen bir satış açmaktansa yalnızca
     TL satmak doğru. */
  internationalEnabled: false,
  usdRate: null,
  usdMarginPercent: 0,
};

/** get_arvoculture_storefront_settings satırı (tutarlar kuruş). */
export type SalesRulesRow = {
  shipping_fee: number | string | null;
  free_shipping_threshold: number | string | null;
  bank_transfer_enabled: boolean | null;
  bank_transfer_discount_percent: number | string | null;
  international_enabled?: boolean | null;
  usd_rate?: number | string | null;
  usd_margin_percent?: number | string | null;
};

export function toSalesRules(row: SalesRulesRow | undefined): SalesRules {
  if (!row) return DEFAULT_SALES_RULES;
  const kurus = (value: SalesRulesRow["shipping_fee"], fallback: number) => {
    const n = Number(value);
    return value === null || !Number.isFinite(n) || n < 0 ? fallback : n / 100;
  };
  const percent = Number(row.bank_transfer_discount_percent);
  return {
    shippingFee: kurus(row.shipping_fee, DEFAULT_SALES_RULES.shippingFee),
    freeShippingOver: kurus(row.free_shipping_threshold, DEFAULT_SALES_RULES.freeShippingOver),
    // ArvoARC ile aynı: yalnızca açık bir "false" havaleyi kapatır.
    transferEnabled: row.bank_transfer_enabled !== false,
    // numeric sütun metin olarak gelebilir ("2.5").
    transferDiscountPercent:
      row.bank_transfer_discount_percent === null || !Number.isFinite(percent) || percent < 0 || percent > 100
        ? DEFAULT_SALES_RULES.transferDiscountPercent
        : percent,
    /*
      Alanlar ESKİ FONKSİYONDA YOK: migration uygulanana kadar
      `undefined` geliyor ve mod kapalı sayılıyor. Varsayılanı
      açık yapsaydık, alanı olmayan bir mağazada yurtdışı vitrini
      kendiliğinden açılırdı.
    */
    internationalEnabled: row.international_enabled === true,
    usdRate: pozitifSayi(row.usd_rate),
    usdMarginPercent: pozitifSayi(row.usd_margin_percent) ?? 0,
  };
}

/** Sayıya çevrilemeyen ya da sıfır/eksi değer `null`. */
function pozitifSayi(deger: number | string | null | undefined): number | null {
  if (deger === null || deger === undefined) return null;
  const n = Number(deger);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Kargo ücreti (TL). Eşik indirim öncesi ara toplamla karşılaştırılır. */
export function shippingFor(
  subtotal: number,
  freeShippingCoupon = false,
  rules: SalesRules = DEFAULT_SALES_RULES,
): number {
  if (freeShippingCoupon) return 0;
  return toKurus(subtotal) >= toKurus(rules.freeShippingOver) ? 0 : rules.shippingFee;
}

/**
 * Teslimat ülkesi Türkiye mi?
 *
 * Adres alanı serbest metin: "TR", "tr", "Türkiye", "Turkey" hepsi
 * gelebiliyor ve hepsi Türkiye. ArvoARC'ın sipariş fonksiyonu da aynı
 * listeyi normalleştiriyor; biri "Türkiye"yi yurtdışı sayarsa müşteri
 * sepette yurt içi kargosu görüp siparişte yurtdışı tarifesiyle
 * karşılaşırdı.
 */
const TURKIYE = new Set([
  "TR",
  "TURKIYE",
  "TÜRKIYE",
  "TÜRKİYE",
  "TURKEY",
  "TURKIYE CUMHURIYETI",
]);

export function yurtIci(ulke: string | null | undefined): boolean {
  const kod = (ulke ?? "").trim().toUpperCase();
  /* BOŞ ÜLKE TÜRKİYE SAYILIYOR, ArvoARC gibi: sipariş fonksiyonu
     adresteki boş ülkeyi `coalesce(nullif(trim(…),''), 'TR')` ile
     Türkiye'ye çeviriyor. Burada boşu yurtdışı saysaydık, ülke
     alanı olmayan eski bir sepet sepette yurtdışı tarifesi görür
     ama siparişte yurt içi kargosu ödenirdi. */
  if (!kod) return true;
  return TURKIYE.has(kod);
}

/**
 * Yurtdışı mal bedeli (TL) — kâr payı dahil.
 *
 * ARVOARC BUNU TAHSİL EDİYOR (migration 20261022190527): yurtdışı
 * teslimatında kalemin birim fiyatı kâr payını içeriyor. Önceden kâr
 * payı yalnızca GÖSTERİME uygulanıyordu; ekranda 1.000 TL'lik ürün
 * 27,71 $ yazıyor, karttan 1.000 TL (20,53 $) çekiliyordu — kâr payı
 * hiçbir şey kazandırmıyor, ekranla tahsilat %35 ayrışıyordu.
 *
 * Kural tek cümle: **gösterilen dolar = tahsil edilen TL ÷ kur.**
 * Çevrimde kâr payı yok; kâr payı yurtdışı FİYATININ içinde. Ürün
 * kartındaki dolar fiyatı (lib/dolar → `dolara`) kâr payını
 * uyguluyor ve o rakam, buradaki TL'nin kura bölümüyle aynı.
 *
 * Yuvarlama ArvoARC'takiyle aynı yerde: KALEM bazında değil, burada
 * sepet toplamında — vitrin kalem fiyatlarını zaten `dolara` ile
 * kalem bazında gösteriyor ve ödeme özetindeki tek rakam toplam.
 */
export function malBedeli(
  subtotal: number,
  ulke: string,
  rules: SalesRules = DEFAULT_SALES_RULES,
): number {
  if (yurtIci(ulke)) return subtotal;
  const carpan = 1 + (rules.usdMarginPercent || 0) / 100;
  return Math.round(toKurus(subtotal) * carpan) / 100;
}

/**
 * TL tutarın dolar karşılığı — KÂR PAYI UYGULAMADAN.
 *
 * Ödeme özetindeki "≈ $X" satırı bunu kullanıyor: oradaki TL tutar
 * yurtdışı siparişinde kâr payını ZATEN içeriyor ve `dolara` ile
 * çevirmek onu iki kez uygulamak olurdu.
 */
export function dolarKarsiligi(lira: number, rules: SalesRules = DEFAULT_SALES_RULES): number | null {
  const kur = rules.usdRate;
  if (!kur || kur <= 0 || !Number.isFinite(lira)) return null;
  return Math.ceil((lira / kur) * 100) / 100;
}

/**
 * Yurtdışı kargosu (TL) — ArvoARC'ın sipariş fonksiyonunun aynası.
 *
 * TL EŞİĞİ VE ÜCRETSİZ KARGO KUPONU BURADA HİÇ GEÇMİYOR: ikisi de
 * yurt içi maliyetine göre konmuş sözler ve yurtdışı tarifesi onun
 * on katı. ArvoARC da aynı kuralı uyguluyor
 * (migration 20261018223636).
 *
 * ENGEL SEBEBİYLE DÖNÜYOR, boş tutarla değil: müşteriye "kargo
 * hesaplanamadı" demek yetmiyor — bu ülkeye hiç gönderilmiyorsa
 * başka bir ülke seçmesi, mod kapalıysa Türkçe vitrine dönmesi
 * gerekiyor. Sıfır dönmek ise "bedava kargo" sözü vermek olurdu.
 */
export type YurtdisiKargo =
  | { tl: number; usdSent: number }
  | { engel: "mod" | "kur" | "bolge" };

export function yurtdisiKargo(
  subtotal: number,
  ulke: string,
  bolgeler: Bolge[],
  rules: SalesRules = DEFAULT_SALES_RULES,
): YurtdisiKargo {
  if (!rules.internationalEnabled) return { engel: "mod" };

  const kur = rules.usdRate;
  if (!kur || kur <= 0) return { engel: "kur" };

  /*
    EŞİK MÜŞTERİNİN GÖRDÜĞÜ dolar tutarıyla karşılaştırılıyor.

    GELEN `subtotal` KÂR PAYINI ZATEN İÇERİYOR (çağıran `malBedeli`
    ile veriyor), bu yüzden çevrimde kâr payı uygulanmıyor —
    uygulansaydı iki kez işler ve eşik müşterinin gördüğünden ÖNCE
    aşılırdı. ArvoARC'ta aynı düzeltme 20261022190527'de yapıldı.
  */
  const dolarSepet = dolarKarsiligi(subtotal, rules);
  if (dolarSepet === null) return { engel: "kur" };

  const sent = kargoSenti(bolgeler, ulke, Math.round(dolarSepet * 100));
  if (sent === null) return { engel: "bolge" };

  /* Sent × kur = kuruş: (USD×100) × (TL/USD) = TL×100. */
  return { tl: Math.round(sent * kur) / 100, usdSent: sent };
}

/** Ücretsiz kargoya kalan tutar (TL). Kargo zaten ücretsizse 0. */
export function amountToFreeShipping(
  subtotal: number,
  freeShippingCoupon = false,
  rules: SalesRules = DEFAULT_SALES_RULES,
): number {
  if (freeShippingCoupon) return 0;
  return Math.max(toKurus(rules.freeShippingOver) - toKurus(subtotal), 0) / 100;
}

/**
 * Havale indirimi (TL). Taban yalnızca mal bedeli — kupon düşülmüş ara
 * toplam; kargo girmez. ArvoARC'taki gibi kuruşta yuvarlanır.
 */
export function transferDiscountFor(goods: number, percent: number): number {
  return Math.round((Math.max(toKurus(goods), 0) * percent) / 100) / 100;
}

/** "2.000 TL", "120,50 TL": tam lirada kuruş yazılmaz. */
export function formatTl(amount: number): string {
  const kurus = toKurus(amount);
  const digits = kurus % 100 === 0 ? 0 : 2;
  return (
    new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(kurus / 100) + " TL"
  );
}

/**
 * Kargo koşullarının metinleri — SSS, teslimat, ürün sayfası, yasal
 * metinler ve llms.txt aynı cümleyi buradan alır.
 *
 * Önceden bu metinler "120 TL" / "2.000 TL" olarak sayfalara
 * yazılıydı; mağaza panelinden tarife değişince sepet yeni tutarı,
 * sayfalar ve mesafeli satış sözleşmesi eskisini gösterecekti.
 * Ücret ya da eşik sıfırsa kargo her zaman ücretsizdir; "0 TL
 * üzeri ücretsiz kargo" gibi anlamsız bir cümle kurulmaz.
 */
export function shippingTerms(rules: SalesRules = DEFAULT_SALES_RULES) {
  const alwaysFree = toKurus(rules.shippingFee) === 0 || toKurus(rules.freeShippingOver) === 0;
  const fee = formatTl(rules.shippingFee);
  const freeOver = formatTl(rules.freeShippingOver);
  return {
    fee,
    freeOver,
    alwaysFree,
    /** Güvence şeridi ve duyuru: "2.000 TL üzeri ücretsiz kargo". */
    badge: alwaysFree ? "Ücretsiz kargo" : `${freeOver} üzeri ücretsiz kargo`,
    /** Tam cümle: "Kargo ücreti 120 TL’dir. 2.000 TL ve üzeri …" */
    sentence: alwaysFree
      ? "Kargo ücretsizdir."
      : `Kargo ücreti ${fee}’dir. ${freeOver} ve üzeri siparişlerde kargo ücretsizdir.`,
  };
}
