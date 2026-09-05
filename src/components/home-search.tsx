import Link from "next/link";

/**
 * Ana sayfadaki arama girişi. Katalogda 200'den fazla ürün ve 40'tan
 * fazla alt koleksiyon var; aradığını bilen ziyaretçi için en kısa yol
 * arama. Eskiden yalnızca başlıktaki küçük bir bağlantıydı.
 *
 * Form yerine bağlantı kullanılıyor: arama sayfası zaten kendi giriş
 * alanını taşıyor, burada ikinci bir durum yönetimi tutmaya gerek yok.
 */
const SUGGESTIONS = [
  { label: "Serum", href: "/koleksiyon/cilt-bakim-serumlari" },
  { label: "Oversize tişört", href: "/koleksiyon/oversize-tisortler" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
  { label: "Güneş koruma", href: "/koleksiyon/gunes-koruyuculari" },
  { label: "Vitamin", href: "/koleksiyon/vitamin-takviyeleri" },
];

export function HomeSearch() {
  return (
    <section className="home-search" aria-label="Ürün arama">
      <Link href="/arama" className="home-search-field">
        <span>Ürün, marka veya kategori ara</span>
        <em>Ara</em>
      </Link>
      <ul className="home-search-tags">
        {SUGGESTIONS.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
