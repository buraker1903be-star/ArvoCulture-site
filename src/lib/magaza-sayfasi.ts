/*
  TANITIM SAYFALARININ METNİ: AYRIŞTIRMA.

  Hakkımızda, SSS ve iletişim sayfalarının metni mağaza panelinden
  yazılıyor (ArvoARC → Ayarlar → Sayfalar) ve düz metin olarak
  geliyor. Serbest HTML bilinçli olarak YOK: bir yazım hatası
  sayfayı bozardı ve müşteriye giden bir yüzeye kod enjekte etme
  kapısı açardı. Yani biçim, metnin kendisinden çıkarılıyor.

  Bu dosya saf: sunucu, ağ, önbellek yok. Okuma
  `magaza-sayfasi-oku.ts`'de.

  İKİZİ ARVOARC'TA (`src/lib/magaza-sayfasi.ts`). Panelin önizlemesi
  ile müşterinin gördüğü sayfa aynı kurallarla bölünmek zorunda;
  biri değişirse diğeri aynı gün değişir. Ortak pakete taşımak
  mümkündü ama iki depo için bir paket altyapısı kurmak, bu kadar
  küçük bir kural kümesi için ağır.
*/

export type SayfaMetni = { baslik: string; govde: string };

/** Boş satırla ayrılmış bloklar; blok içindeki satırlar tek paragrafa iner. */
export function bloklar(govde: string): string[][] {
  return govde
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((blok) => blok.split("\n").map((satir) => satir.trim()).filter(Boolean))
    .filter((satirlar) => satirlar.length > 0);
}

/**
 * Düz metni paragraflara böler.
 *
 * Tek satır sonu paragraf AÇMAZ: panelde dar bir alana yazan kiracı
 * cümlesini elle bölebilir, her satırı ayrı paragraf saymak metni
 * kesik gösterirdi.
 */
export function paragraflar(govde: string): string[] {
  return bloklar(govde).map((satirlar) => satirlar.join(" "));
}

/**
 * SSS blokları: ilk satır soru, kalanı cevap.
 *
 * Cevabı olmayan blok ATILIYOR. Tek satırlık bir blok ya eksik
 * yazılmış bir soru ya da başlık denemesidir; müşteriye yanıtsız
 * bir soru göstermek, o soruyu hiç göstermemekten kötü.
 */
export function sssBloklari(govde: string): Array<{ soru: string; cevap: string }> {
  return bloklar(govde)
    .filter((satirlar) => satirlar.length >= 2)
    .map((satirlar) => ({ soru: satirlar[0], cevap: satirlar.slice(1).join(" ") }));
}

/**
 * Satır var mı sayılır mı?
 *
 * Başlığı ve gövdesi boş bir satır "varsayılana dön" demektir:
 * panelde alanları boşaltan kiracı satırı siliyor ama elle girilmiş
 * boş bir satır da aynı anlama gelmeli. Fonksiyon tarafında da
 * süzülüyor; iki yerde kontrol etmek ucuz, yanlış metin göstermek
 * değil.
 */
export function metinVar(sayfa: SayfaMetni | null | undefined): sayfa is SayfaMetni {
  if (!sayfa) return false;
  return (sayfa.baslik ?? "").trim().length > 0 || (sayfa.govde ?? "").trim().length > 0;
}
