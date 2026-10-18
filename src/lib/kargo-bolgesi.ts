/**
 * Yurtdışı kargo bölgesi — ArvoARC'takinin İKİZİ.
 *
 * Kural ArvoARC'ta `src/lib/kargo-bolgesi.ts` içinde ve sipariş
 * fonksiyonunda (SQL) aynı sıra ile yazılı. Üçü de aynı olmak
 * ZORUNDA: vitrin ücreti gösterirken, ArvoARC siparişi hesaplarken
 * aynı bölgeyi bulmalı. Ayrılırlarsa müşteri ödemede başka tutar
 * görür — bu depoda o sapma bir kez yaşandı (17 Eylül 2026, kargo ve
 * havale kuralı). Biri değişirse öbürleri aynı gün değişir.
 *
 * Tarife listesi dışarıdan geliyor (`arc_storefront_shipping_zones`),
 * tutarlar DOLAR SENTİ: yurtdışı fiyatları dolar üzerinden konuyor.
 */

export type Bolge = {
  label: string;
  /** ISO ülke kodları. Boş dizi = "öteki her yer". */
  countries: string[];
  /** Kargo ücreti (USD sent). */
  fee_cents: number;
  /** Bu tutarın üstünde ücretsiz (sent). 0 = eşik yok. */
  free_over_cents: number;
  sira: number;
};

/**
 * Ülkenin bölgesi.
 *
 * SIRA ÖNEMLİ: önce ülkeyi AÇIKÇA sayan bölgeler aranıyor,
 * bulunamazsa "öteki her yer" (boş ülke listesi) bölgesine
 * düşülüyor. Ters sırada olsaydı genel bölge, kendi ülkesi için
 * ayrı tarifesi olan bir yeri de yutardı.
 */
export function bolgeBul(
  bolgeler: Bolge[],
  ulkeKodu: string | null | undefined,
): Bolge | null {
  const kod = (ulkeKodu ?? "").trim().toUpperCase();
  const sirali = [...bolgeler].sort((a, b) => a.sira - b.sira);

  if (kod) {
    const tam = sirali.find((b) =>
      b.countries.some((c) => c.trim().toUpperCase() === kod),
    );
    if (tam) return tam;
  }

  return sirali.find((b) => b.countries.length === 0) ?? null;
}

/**
 * Kargo ücreti (sent).
 *
 * BÖLGE BULUNAMAZSA `null` — sıfır DEĞİL. Sıfır "kargo ücretsiz"
 * demek olurdu; tarifesi tanımlanmamış bir ülkeye bedava kargo
 * sözü vermek, o siparişin maliyetini üstlenmek demek. Çağıran
 * taraf null görünce o ülkeye satış yapmıyor.
 */
export function kargoSenti(
  bolgeler: Bolge[],
  ulkeKodu: string | null | undefined,
  sepetSenti: number,
): number | null {
  const bolge = bolgeBul(bolgeler, ulkeKodu);
  if (!bolge) return null;

  if (bolge.free_over_cents > 0 && sepetSenti >= bolge.free_over_cents) {
    return 0;
  }
  return bolge.fee_cents;
}

/** `arc_storefront_shipping_zones` satırı (sent alanları metin gelebilir). */
export type BolgeSatiri = {
  label: string | null;
  countries: string[] | null;
  fee_cents: number | string | null;
  free_over_cents: number | string | null;
  sira: number | string | null;
};

/** Satırları bölgeye çevirir; okunamayan sayı 0 sayılır. */
export function toBolgeler(satirlar: BolgeSatiri[]): Bolge[] {
  const sayi = (deger: number | string | null) => {
    const n = Number(deger);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  return satirlar.map((satir) => ({
    label: satir.label ?? "",
    countries: Array.isArray(satir.countries) ? satir.countries : [],
    fee_cents: sayi(satir.fee_cents),
    free_over_cents: sayi(satir.free_over_cents),
    sira: sayi(satir.sira),
  }));
}
