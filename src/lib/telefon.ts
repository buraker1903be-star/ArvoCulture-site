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

/*
  MÜŞTERİNİN KENDİ NUMARASI — TEK BİÇİMDE SAKLANIR.

  Yukarıdaki `telefonBicimi` MAĞAZANIN numarasını GÖSTERMEK için;
  tanımadığı biçimi bilerek değiştirmiyor. Aşağıdakiler ise profil
  formundan gelen müşteri numarasını KAYDETMEDEN önce tek biçime
  indiriyor — iki iş benzer görünüyor ama kuralları zıt, o yüzden
  ayrı fonksiyonlar.

  Profil formu numarayı OLDUĞU GİBİ kaydediyordu: "0532 123 45 67",
  "+90 532 123 4567", "532-123-45-67" ve "05321234567" aynı
  müşterinin numarası olmasına rağmen veritabanında dört ayrı dizge
  olarak duruyordu. Kargo ekranında numara kopyalanıp aranıyor;
  biçim bozuksa arama kurulmuyor ve paket geri dönüyor.

  Burada tek biçim var: `05XX XXX XX XX`.
*/

/** Yalnızca rakamlar; ülke kodu ve ayraçlar atılır. */
export function telefonRakamlari(ham: string): string {
  const rakam = ham.replace(/\D/g, "");
  /* +90 ve 0090 ile yazılanlar: baştaki ülke kodu düşer. */
  if (rakam.startsWith("90") && rakam.length === 12) return `0${rakam.slice(2)}`;
  if (rakam.startsWith("0090")) return `0${rakam.slice(4)}`;
  /* Başında sıfır olmadan yazılan "5321234567". */
  if (rakam.length === 10 && rakam.startsWith("5")) return `0${rakam}`;
  return rakam;
}

/**
 * Geçerli bir Türkiye cep numarası mı?
 *
 * BOŞ DEĞER GEÇERLİ sayılıyor: telefon zorunlu alan değil ve
 * boş bırakanı hata mesajıyla durdurmak, adını güncellemeye gelen
 * müşteriyi formda kilitlerdi.
 */
export function telefonGecerli(ham: string): boolean {
  const rakam = telefonRakamlari(ham);
  if (!rakam) return true;
  return /^05\d{9}$/.test(rakam);
}

/** Ekranda ve veritabanında duracak biçim: `05XX XXX XX XX`. */
export function telefonBicimle(ham: string): string {
  const r = telefonRakamlari(ham);
  /* Tanınmayan bir şey yazılıyorsa (sabit hat, yabancı numara)
     dokunulmuyor — yukarıdaki fonksiyonla aynı gerekçe. */
  if (!/^0\d{1,10}$/.test(r)) return ham;
  const p = [r.slice(0, 4), r.slice(4, 7), r.slice(7, 9), r.slice(9, 11)];
  return p.filter(Boolean).join(" ");
}
