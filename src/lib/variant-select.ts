import type { Variant } from "@/lib/variants";

/*
  VARYANT SEÇİMİ. Saf mantık; testi tests/variant-select.test.ts.

  Vitrin tekstil için yazılmıştı: satın alma kutusu yalnızca BEDEN
  biliyordu. Kozmetikte beden yok, RENK var — LR'ın dudak kalemi ve
  rujunun altı tonu ürün sayfasında hiç görünmüyordu (30.09.2026'da
  canlıda ölçüldü), müşteri hangi tonu aldığını seçemiyordu.

  Burada üç hâl birden karşılanıyor: yalnızca renk (kozmetik),
  yalnızca beden (tekstil) ve ikisi birden. Sepete SKU gidiyor;
  yanlış varyant seçmek yanlış ürün göndermek demek.
*/

const doluMu = (deger: string | null | undefined): deger is string =>
  typeof deger === "string" && deger.trim().length > 0;

/** Sırası korunan, yinelenmeyen renk listesi. */
export function renkSecenekleri(varyantlar: Variant[]): string[] {
  const gorulen: string[] = [];
  for (const varyant of varyantlar) {
    if (doluMu(varyant.color) && !gorulen.includes(varyant.color)) gorulen.push(varyant.color);
  }
  return gorulen;
}

/**
 * Seçilen renge ait beden taşıyan varyantlar.
 *
 * Renk seçilmemişse bütün bedenler dönüyor: ürünün yalnızca bedeni
 * varsa (tekstil) renk zaten yok.
 */
export function bedenSecenekleri(varyantlar: Variant[], renk: string | null): Variant[] {
  return varyantlar.filter(
    (varyant) => doluMu(varyant.size) && (!renk || varyant.color === renk),
  );
}

/**
 * Seçime uyan varyant.
 *
 * Tek varyantlı üründe seçim istenmiyor; kozmetikte beden yok,
 * tekstilde renk yok. Uymayan bir bileşim istendiğinde null dönüyor:
 * "en yakınına" düşmek, müşterinin seçmediği tonu sepete koymak olurdu.
 */
export function varyantBul(
  varyantlar: Variant[],
  renk: string | null,
  beden: string | null,
): Variant | null {
  if (varyantlar.length === 1 && !renk && !beden) return varyantlar[0]!;
  const eslesen = varyantlar.filter(
    (varyant) =>
      (!renk || varyant.color === renk) && (!beden || varyant.size === beden),
  );
  if (!eslesen.length) return null;
  /* Birden çok kalıyorsa seçim tamamlanmamıştır (ör. renk seçildi,
     beden seçilmedi): kendiliğinden birini seçmiyoruz. */
  return eslesen.length === 1 ? eslesen[0]! : null;
}
