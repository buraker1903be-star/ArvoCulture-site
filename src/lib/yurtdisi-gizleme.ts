/**
 * Yurtdışı modunda gönderilemeyen ürünleri gizleme.
 *
 * KURAL SUNUCUDA BASILIYOR, SEÇİM TARAYICIDA YAPILIYOR. Hangi
 * ürünlerin gönderilemediği para biriminden BAĞIMSIZ bir bilgi; o
 * yüzden CSS sayfanın içinde, rota önbelleğinin içinde basılabiliyor.
 * Tarayıcının yaptığı tek şey `data-para` niteliğini çevirmek.
 *
 * Alternatifi, listeyi istemcide okuyup kartları React ile süzmekti:
 * ürün listeleri sunucu bileşeni, yani bütün ağacı istemciye taşımak
 * ya da DOM'u elle dolaşmak gerekirdi. Üçüncü seçenek on dört ürün
 * listesi fonksiyonuna birer sütun eklemekti (artı ikizleri) —
 * kopyalama hatası riski kazanımdan büyük.
 */

/** `data-para` niteliğini ilk boyamadan ÖNCE koyan satır içi betik. */
export function paraBirimiOnYukleyici(): string {
  /*
    Tek satır ve küçük: `<head>` içinde çalışıyor ve sayfanın
    boyanmasını bekletiyor. try/catch zorunlu — gizli sekmede ve
    depolama kapalıyken localStorage okuması FIRLATIYOR ve burada
    yakalanmayan bir hata sayfanın tamamını çizilmez yapardı.
  */
  return (
    "try{if(localStorage.getItem('arvo-para-birimi')==='USD')" +
    "document.documentElement.dataset.para='usd'}catch(e){}"
  );
}

/**
 * Gizleme kuralı. Liste boşsa `null` — boş bir `<style>` basmamak
 * için.
 *
 * `!important` YOK: kart `display:none` dışında bir kural almıyor ve
 * seçici nitelik üzerinden geldiği için zaten yeterince belirgin.
 */
export function yurtdisiGizlemeCss(sluglar: string[]): string | null {
  /* Slug biçimi burada BİR KEZ DAHA süzülüyor. Çağıran taraf da
     süzüyor (lib/engelli-urunler) ama bu metin doğrudan sayfaya
     giriyor: beklenmeyen bir karakter seçiciyi kapatıp sayfanın
     bütün stilini bozabilir. İki süzgeç, bir sayfadan iyi. */
  const temiz = sluglar.filter((slug) => /^[a-z0-9-]+$/i.test(slug));
  if (temiz.length === 0) return null;

  const secici = temiz.map((slug) => `html[data-para="usd"] [data-urun="${slug}"]`).join(",");
  return `${secici}{display:none}`;
}
