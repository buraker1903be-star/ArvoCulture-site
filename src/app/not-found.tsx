import Link from "next/link";

/*
  404. Diğer sayfalarla aynı panel dilinde: künye satırı, serif
  başlık, bir düğme ve bir yazı bağlantısı. Önceden paneli yoktu;
  başlık ekranın kenarına yapışıyor, düğme boydan boya uzanıyordu.
*/
export default function NotFound() {
  return (
    <main className="shell">
      <section className="panel about-hero order-result">
        <p className="about-eyebrow">404</p>
        <h1>Bu sayfa koleksiyonda yok.</h1>
        <p className="about-lede">
          Aradığınız ürün kaldırılmış ya da bağlantısı değişmiş olabilir.
          Seçkinin tamamı bir tık uzağınızda.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Tüm ürünler
          </Link>
          <Link href="/">Ana sayfaya dön</Link>
        </div>
      </section>
    </main>
  );
}
