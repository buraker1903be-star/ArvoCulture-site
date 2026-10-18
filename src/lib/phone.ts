/**
 * Türkiye telefon biçimlendirmesi: +90 (5XX) XXX XX XX
 *
 * Müşteriler numarayı çok farklı yazıyor (0532…, +90532…,
 * 90 532…). Serbest bırakılınca kargo firmasına giden veri
 * tutarsız oluyor. Giriş anında biçimlendirip tek bir şablona
 * oturtuyoruz.
 */
export function formatPhone(input: string) {
  // Yalnızca rakamlar; baştaki 90 ve 0 temizlenir.
  let digits = input.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  if (digits.length === 0) return "";

  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 8),
    digits.slice(8, 10),
  ].filter(Boolean);

  let out = "+90";
  if (parts[0]) out += ` (${parts[0]}`;
  if (parts[0] && parts[0].length === 3) out += ")";
  if (parts[1]) out += ` ${parts[1]}`;
  if (parts[2]) out += ` ${parts[2]}`;
  if (parts[3]) out += ` ${parts[3]}`;
  return out;
}

/** Biçimlendirilmiş numaradan 10 haneli sayıyı çıkarır. */
export function phoneDigits(value: string) {
  let digits = value.replace(/\D/g, "");
  if (digits.startsWith("90")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = digits.slice(1);
  return digits.slice(0, 10);
}

export function isValidPhone(value: string) {
  const digits = phoneDigits(value);
  // Türkiye cep numaraları 5 ile başlar.
  return digits.length === 10 && digits.startsWith("5");
}

/*
  YURTDIŞI NUMARASI AYRI YOL.

  Yukarıdaki biçimlendirme Türkiye'ye göre: baştaki 90 ve 0
  atılıyor, numara on haneye kesiliyor ve +90 ekleniyor. Yurtdışı
  müşterisi numarasını bu alana yazınca sessizce bozuluyordu —
  Almanya'dan +49 171 … yazan müşterinin numarası "+90 (171) …"
  oluyor ve kargo firması o numaraya ulaşamıyordu.

  Ülke kodu MÜŞTERİNİN YAZDIĞI gibi kalıyor: dünyadaki numara
  biçimlerini tek bir şablona oturtmaya çalışmak, oturtamadığı her
  numarayı bozmak demek. Yapılan tek şey rakam ve "+" dışını atmak.
*/

/** Yurtdışı numarası: baştaki "+" korunur, gerisi rakam. */
export function formatInternationalPhone(input: string) {
  const arti = input.trim().startsWith("+");
  const digits = input.replace(/\D/g, "").slice(0, 15);
  if (digits.length === 0) return arti ? "+" : "";
  return `+${digits}`;
}

/**
 * Yurtdışı numarası geçerli mi?
 *
 * E.164 en fazla 15 hane; alt sınır 7, çünkü daha kısası hiçbir
 * ülkede ülke kodu + abone numarası etmiyor. Daha sıkı bir kural
 * (ülke kodu listesi) geçerli numaraları reddetme riski taşıyor ve
 * numarayı asıl doğrulayan kargo firması.
 */
export function isValidInternationalPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
}
