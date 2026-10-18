/*
  TELEFON BİÇİMİ: ÜLKE KODU ŞART.

  Kayıtta numara ham duruyor ("5074370507") ve önceden
  `lib/seller.ts` sabitinden okunduğu için ekranda hep
  "+90 507 437 05 07" görünüyordu. Kayıttan okumaya geçince ham hâli
  basıldı: iletişim sayfasında ve yapısal veride ülke kodu olmayan
  bir numara — müşteri yurt dışından arayamaz, schema.org'da da
  belirsiz bir değer.

  Türkiye numarası üç biçimde girilebiliyor (5xx…, 05xx…, 90 5xx…);
  üçü de aynı numara.

  TANIMADIĞIMIZ BİÇİM DEĞİŞTİRİLMİYOR. Sabit hat, kısa hat ya da
  yabancı bir numaraya "+90" eklemek, yanlış numara basmak olurdu.
  Girilen değer olduğu gibi gösteriliyor.

  Dosya saf: `seller-source` Next'e bağlı ve oradan çağrılan bir
  fonksiyon test edilemiyordu.
*/
export function telefonBicimi(ham: string | null | undefined): string {
  const girdi = (ham ?? "").trim();
  if (!girdi) return "";

  let hane = girdi.replace(/\D/g, "");
  if (hane.length === 11 && hane.startsWith("0")) hane = hane.slice(1);
  else if (hane.length === 12 && hane.startsWith("90")) hane = hane.slice(2);

  /* 5xx xxx xx xx dışındaki her şey olduğu gibi kalıyor. */
  if (hane.length !== 10 || !hane.startsWith("5")) return girdi;

  return `+90 ${hane.slice(0, 3)} ${hane.slice(3, 6)} ${hane.slice(6, 8)} ${hane.slice(8)}`;
}
