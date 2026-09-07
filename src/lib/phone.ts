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
