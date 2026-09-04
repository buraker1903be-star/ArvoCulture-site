import Link from "next/link";

/**
 * Satın alma kaygısını azaltan güven şeridi. Hero'nun hemen altında
 * duruyor çünkü ziyaretçinin ilk sorusu "bu siteye güvenebilir miyim".
 * Her madde tıklanabilir — iddianın arkasındaki sayfaya gidiyor.
 *
 * TODO: Ücretsiz kargo eşiği ve teslimat süresi ARC'tan gelmeli;
 * şu an sabit yazılı. Değiştiğinde iki yerde güncellemek gerekir.
 */
const items = [
  {
    title: "2.000 TL üzeri ücretsiz kargo",
    note: "Türkiye geneli",
    href: "/teslimat",
  },
  {
    title: "14 gün içinde iade",
    note: "Kullanılmamış ürünlerde koşulsuz",
    href: "/iptal-iade",
  },
  {
    title: "Güvenli ödeme",
    note: "3D Secure ile korumalı işlem",
    href: "/mesafeli-satis-sozlesmesi",
  },
  {
    title: "Orijinal ürün garantisi",
    note: "Yetkili tedarik zinciri",
    href: "/sss",
  },
];

export function AssuranceBar() {
  return (
    <section className="assurance-bar" aria-label="Alışveriş güvencesi">
      {items.map((item) => (
        <Link key={item.title} href={item.href} className="assurance-item">
          <strong>{item.title}</strong>
          <small>{item.note}</small>
        </Link>
      ))}
    </section>
  );
}
