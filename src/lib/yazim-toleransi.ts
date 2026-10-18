/*
  YAZIM HATASI = BOŞ KATALOG.

  18.10.2026'da canlı uçta ölçüldü:

    prafüm       → 0   (doğrusu parfüm: 43 ürün)
    nemlendirci  → 0   (nemlendirici: 10)
    sampaun      → 0   (şampuan: 7)
    tshirt       → 0   (t-shirt: 1.549, tişört: 1.102)

  Müşteri bir harf şaşırınca mağazayı boş sanıyor. "tshirt" özellikle
  sık: tireyi atlayan herkes 1.549 ürünün üstünde boş sayfa görüyordu.

  BU KATMAN YALNIZCA SONUÇ SIFIRKEN ÇALIŞIR. Tam eşleşme varken
  hiç çağrılmıyor; yani iyi çalışan bir aramayı bulanıklaştırma
  riski yok ve olağan sorguda maliyeti de yok.

  Saf dosya: sözlük dışarıdan veriliyor, böylece testten çağrılabiliyor
  ve dizinin nasıl kurulduğundan bağımsız kalıyor.
*/

/*
  Sınırlı uzaklık; tavan aşılınca erken çıkıyor. Tam matris
  hesaplamak sözlüğün tamamı için gereksiz: aradığımız şey "yakın
  mı", "ne kadar uzak" değil.

  BİTİŞİK HARF YER DEĞİŞTİRMESİ TEK HATA SAYILIYOR
  (Damerau-Levenshtein). Düz Levenshtein bunu İKİ hata sayıyor ve
  en sık yazım hatası türü tam olarak bu: "prafüm"/"parfüm",
  "sampaun"/"şampuan" — ikisi de ölçülen gerçek sorgular ve ikisi
  de harf yer değiştirmesi. Düz sürümle tolerans 1'de hiçbiri
  düzelmiyordu (testler yakaladı); toleransı 2'ye çıkarmak ise
  alakasız kelimeleri birbirine bağlardı.
*/
export function uzaklik(a: string, b: string, tavan: number): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > tavan) return tavan + 1;

  /* Üç satır tutuluyor: yer değiştirme iki satır geriye bakıyor. */
  let oncekiOnceki: number[] = [];
  let onceki = Array.from({ length: b.length + 1 }, (_, i) => i);

  for (let i = 1; i <= a.length; i += 1) {
    const simdi = [i];
    let satirEnAz = i;
    for (let j = 1; j <= b.length; j += 1) {
      const bedel = a[i - 1] === b[j - 1] ? 0 : 1;
      let deger = Math.min(
        onceki[j] + 1,
        simdi[j - 1] + 1,
        onceki[j - 1] + bedel,
      );
      if (
        i > 1 &&
        j > 1 &&
        a[i - 1] === b[j - 2] &&
        a[i - 2] === b[j - 1]
      ) {
        deger = Math.min(deger, oncekiOnceki[j - 2] + 1);
      }
      simdi.push(deger);
      if (deger < satirEnAz) satirEnAz = deger;
    }
    /* Satırın tamamı tavanın üstündeyse geri kalanı hesaplamak
       sonucu değiştiremez. */
    if (satirEnAz > tavan) return tavan + 1;
    oncekiOnceki = onceki;
    onceki = simdi;
  }
  return onceki[b.length];
}

/*
  Kelime uzunluğuna göre tolerans.

  Üç harf ve altı HİÇ düzeltilmiyor: "ruj" ile "rum", "nem" ile
  "yem" arasında bir harf var ve bu uzunlukta düzeltmek, aranan
  şeyden bambaşka bir ürün getirmek demek.

  Sekiz harften uzun kelimelerde iki harf serbest: uzun kelimede
  iki hata yapmak kolay ("nemlendirici" on iki harf) ve o uzunlukta
  iki harf uzaklıktaki başka bir kelime bulmak zor.
*/
export function tolerans(kelime: string): number {
  if (kelime.length <= 3) return 0;
  if (kelime.length <= 7) return 1;
  return 2;
}

/**
 * Sözlükteki en yakın karşılık; yoksa null.
 *
 * Eşitlik durumunda KISA olan kazanıyor: "tshirt" için hem "shirt"
 * hem "t-shirt"in parçaları yakın çıkıyor ve kısa olan daha genel
 * bir kelime, yani daha çok ürüne uyuyor.
 */
export function enYakin(kelime: string, sozluk: Iterable<string>): string | null {
  const tavan = tolerans(kelime);
  if (tavan === 0) return null;

  let kazanan: string | null = null;
  let enIyi = tavan + 1;

  for (const aday of sozluk) {
    if (aday === kelime) return kelime;
    const d = uzaklik(kelime, aday, tavan);
    if (d > tavan) continue;
    if (d < enIyi || (d === enIyi && kazanan !== null && aday.length < kazanan.length)) {
      enIyi = d;
      kazanan = aday;
    }
  }
  return kazanan;
}

/**
 * Sorgunun düzeltilmiş hâli; hiçbir kelime düzeltilemezse null.
 *
 * Kelimelerin HEPSİ düzeltilmek zorunda değil: "erkek tshirt"te
 * "erkek" zaten sözlükte, yalnızca "tshirt" düzeltiliyor.
 */
export function duzeltilmisSorgu(
  kelimeler: string[],
  sozluk: Set<string>,
): { kelimeler: string[]; degisti: boolean } {
  let degisti = false;
  const sonuc = kelimeler.map((kelime) => {
    if (sozluk.has(kelime)) return kelime;
    const yakin = enYakin(kelime, sozluk);
    if (!yakin || yakin === kelime) return kelime;
    degisti = true;
    return yakin;
  });
  return { kelimeler: sonuc, degisti };
}
