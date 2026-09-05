import Image from "next/image";
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

/** Yuvarlak kategori kısayolları — mobilde tanıdık bir kalıp. */
export function CategoryStrip({
  items,
}: {
  items: Array<{ label: string; href: string; image?: string }>;
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
              {item.image && (
                <Image src={item.image} alt="" fill sizes="140px" />
              )}
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
