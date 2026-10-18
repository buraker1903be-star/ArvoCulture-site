/**
 * Bölüm yüklenirken içerik sütununun iskeleti.
 *
 * Kabuk (karşılama ve yan menü) düzende olduğu için yerinde
 * duruyor; değişen yalnızca burası. Önceden bölüm değiştirmek
 * sayfanın TAMAMINI söküyordu: tıklama ile yeni içerik arasında
 * ekran boşalıyor, sonra her şey birden yerine oturuyordu.
 *
 * İSKELET BEKLEMEYİ KISALTMIYOR, OKUNUR KILIYOR. Dönen bir
 * çember yerine içeriğin KABA ŞEKLİ duruyor; müşteri neyin
 * geleceğini görüyor ve sayfa yerine oturduğunda hiçbir şey
 * zıplamıyor.
 */
export default function Yukleniyor() {
  return (
    <section className="panel hesap-iskelet" aria-hidden="true">
      <span className="hesap-iskelet-satir hesap-iskelet-baslik" />
      <span className="hesap-iskelet-satir hesap-iskelet-alt" />
      <span className="hesap-iskelet-kutu" />
    </section>
  );
}
