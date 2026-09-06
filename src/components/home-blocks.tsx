import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/product-types";

/** Ürün ızgarası. Ana sayfada birden çok yerde kullanılır. */
export function ProductBlock({
  title,
  note,
  href,
  hrefLabel,
  products,
  alt,
}: {
  title: string;
  note?: string;
  href: string;
  hrefLabel: string;
  products: Product[];
  alt?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className={`panel${alt ? " panel-soft" : ""}`}>
      <div className="head">
        <div>
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
        <Link href={href}>{hrefLabel}</Link>
      </div>
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}

/** Alışveriş güvencesi. Türkiye'de ilk kez alışveriş yapılan sitede
 *  en sık sorulan sorular: kargo, iade, ödeme güvenliği. */
const PERKS = [
  {
    title: "2.000 TL üzeri ücretsiz kargo",
    note: "Türkiye geneli",
    href: "/teslimat",
  },
  { title: "14 gün içinde iade", note: "Kullanılmamış ürünlerde", href: "/iptal-iade" },
  { title: "3D Secure ile ödeme", note: "Kart bilgisi saklanmaz", href: "/gizlilik" },
  { title: "Orijinal ürün", note: "Yetkili tedarik", href: "/sss" },
];

export function Perks() {
  return (
    <section className="panel perks" aria-label="Alışveriş güvencesi">
      {PERKS.map((perk) => (
        <Link key={perk.title} href={perk.href}>
          <strong>{perk.title}</strong>
          <small>{perk.note}</small>
        </Link>
      ))}
    </section>
  );
}

/*
  Kategori ikonları. Ürün fotoğrafı yerine çizim kullanılıyor:
  fotoğraf tek bir ürünü temsil ediyordu ve kategoriyi yanlış
  daraltıyordu (örneğin "Kişisel Bakım" bir tüp aloe kremi gibi
  görünüyordu). Çizgi ikon kategoriyi bütün olarak anlatır ve
  katalog değişince eskimez.
*/
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Giyim: (
    <>
      <path d="M9 6 5.5 8 4 13l3 1v9h10v-9l3-1-1.5-5L15 6" />
      <path d="M9 6a3 3 0 0 0 6 0" />
    </>
  ),
  "Kişisel Bakım": (
    <>
      <path d="M10 3h4v3h-4z" />
      <path d="M8.5 6h7l1 4v10a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V10z" />
      <path d="M9 13h6" />
    </>
  ),
  Kozmetik: (
    <>
      <path d="M9 21V11h6v10z" />
      <path d="M10 11V4.5a2 2 0 0 1 4 0V11" />
      <path d="M9 15h6" />
    </>
  ),
  Parfüm: (
    <>
      <path d="M10 3h4v3h-4z" />
      <path d="M7.5 9a3 3 0 0 1 3-3h3a3 3 0 0 1 3 3v10a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2z" />
      <path d="M11 12h2" />
    </>
  ),
  Takviyeler: (
    <>
      <path d="M8.5 4.5a4 4 0 0 1 5.7 5.7l-4 4a4 4 0 0 1-5.7-5.7z" transform="translate(2 2)" />
      <path d="m9 15 6-6" />
      <circle cx="17" cy="17" r="4" />
    </>
  ),
};

/** Yuvarlak kategori kısayolları — mobilde tanıdık bir kalıp. */
export function CategoryStrip({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="panel">
      <div className="head">
        <h2>Kategoriler</h2>
        <Link href="/koleksiyon/tumu">Tüm katalog</Link>
      </div>
      <div className="cats">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {CATEGORY_ICONS[item.label]}
              </svg>
            </span>
            <strong>{item.label}</strong>
          </Link>
        ))}
      </div>
    </section>
  );
}

const HELP = [
  { label: "Kargom ne zaman çıkar?", href: "/teslimat" },
  { label: "Nasıl iade ederim?", href: "/iptal-iade" },
  { label: "Sıkça sorulanlar", href: "/sss" },
  { label: "Bize ulaşın", href: "/iletisim" },
];

export function HelpStrip() {
  return (
    <section className="panel panel-tight help" aria-label="Yardım">
      <strong>Aklınıza takılan bir şey mi var?</strong>
      <ul>
        {HELP.map((item) => (
          <li key={item.href}>
            <Link href={item.href}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
