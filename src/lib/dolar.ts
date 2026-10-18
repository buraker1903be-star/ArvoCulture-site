/**
 * TL fiyatından dolar fiyatı — ArvoARC'takinin İKİZİ.
 *
 * Kural ArvoARC'ta `src/lib/dolar-fiyati.ts` içinde ve aynı
 * olmak ZORUNDA: vitrin fiyatı gösterirken, ArvoARC siparişi
 * hesaplarken aynı hesabı yapıyor. İkisi ayrılırsa müşteri
 * ödemede başka tutar görür; bu depoda o sapma bir kez yaşandı
 * (17 Eylül 2026, kargo ve havale kuralı). Biri değişirse öbürü
 * aynı gün değişir.
 *
 * VİTRİN TARAFINDA GİRDİ TL (lira), ArvoARC'ta kuruş: vitrin
 * içinde tutarlar her yerde lira (bkz. AGENTS.md "Birimler").
 */

/**
 * Lira → dolar.
 *
 * YUKARI YUVARLANIYOR (sente). Aşağı yuvarlamak her üründe bir
 * sentlik zarar demek ve binlerce üründe birikir; müşteri
 * açısından fark bir sent.
 *
 * Kur yoksa `null`: uydurma bir kurla fiyat göstermek, ödenenden
 * farklı bir rakam göstermektir. Çağıran taraf null görünce
 * dolar fiyatını hiç göstermiyor.
 */
export function dolara(
  lira: number,
  kur: number | null | undefined,
  karPayi = 0,
): number | null {
  if (!kur || !Number.isFinite(kur) || kur <= 0) return null;
  if (!Number.isFinite(lira)) return null;

  const carpan = 1 + (Number.isFinite(karPayi) ? karPayi : 0) / 100;
  if (carpan <= 0) return null;

  const dolar = (lira / kur) * carpan;
  return Math.ceil(dolar * 100) / 100;
}

/** "$1,234.56" — yurtdışı vitrini İngilizce yazımla. */
export const dolarYazisi = (dolar: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(dolar);
