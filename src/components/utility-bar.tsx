import Link from "next/link";
import { CouponCopy } from "@/components/coupon-strip";

/**
 * Hero'nun hemen altındaki tek satırlık işlev şeridi: solda arama,
 * sağda kupon. İkisi ayrı bölümken toplam 200px dikey alan kaplıyor
 * ve ürünü ekranın dışına itiyorlardı.
 */
const SUGGESTIONS = [
  { label: "Serum", href: "/koleksiyon/cilt-bakim-serumlari" },
  { label: "Oversize tişört", href: "/koleksiyon/oversize-tisortler" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
  { label: "Güneş koruma", href: "/koleksiyon/gunes-koruyuculari" },
];

export function UtilityBar({
  coupon,
}: {
  coupon?: { code: string; label: string };
}) {
  return (
    <section className="utility-bar" aria-label="Arama ve kampanya">
      <div className="utility-search">
        <Link href="/arama" className="utility-field">
          <span>Ürün, marka veya kategori ara</span>
          <em>Ara</em>
        </Link>
        <ul className="utility-tags">
          {SUGGESTIONS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </div>

      {coupon && (
        <div className="utility-coupon">
          <div>
            <strong>İlk alışverişinde {coupon.label}</strong>
            <small>Kodu sepette uygula</small>
          </div>
          <CouponCopy code={coupon.code} />
        </div>
      )}
    </section>
  );
}
