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
  rail,
}: {
  title: string;
  note?: string;
  href: string;
  hrefLabel: string;
  products: Product[];
  alt?: boolean;
  /**
   * Izgara yerine yatay kaydırmalı raf. Sekiz özdeş ızgaranın
   * ardı ardına gelmesi sayfayı düzleştiriyordu; bir bölümü
   * rafa çevirmek göze ritim veriyor.
   */
  rail?: boolean;
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
      <div className={rail ? "rail" : "grid"}>
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
  Kategori ikonları — eskiz (sketch) tarzı.

  El çizimi hissi iki şeyden gelir:
  1. Çizgiler tam düz değil; her kenar hafif bir eğri (C) taşır,
     tıpkı elle çekilmiş bir çizgi gibi.
  2. Ana çizginin altında hafifçe kaymış soluk bir kopya var —
     kalemin ikinci geçişi gibi. Bileşende `sketch-ghost` katmanı
     bunu yapar.

  Siluetler bilinçli olarak birbirinden farklı: askı, damlalıklı
  şişe, ruj, flakon, kapsül.
*/
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Giyim: (
    <>
      <path d="M12 4.3c1 0 1.8.7 1.7 1.7-.1 1-.9 1.5-1.7 1.6-.1.5 0 .9 0 1.3" />
      <path d="M12 8.9C9.5 10.6 6.8 12.5 4.4 14.3c-1.1.8-.6 2.4.8 2.4 4.6.1 9.2.1 13.8 0 1.3 0 1.8-1.6.7-2.4C17.2 12.5 14.5 10.6 12 8.9Z" />
    </>
  ),

  "Kişisel Bakım": (
    <>
      <path d="M11 2.9c.7-.1 1.4-.1 2 0 .1 1.5.1 3 0 4.4-.7.1-1.3.1-2 0-.1-1.4-.1-2.9 0-4.4Z" />
      <path d="M10.1 7.3c1.3-.2 2.6-.2 3.8 0" />
      <path d="M8.6 10.5c0-1 .6-1.9 1.6-2.3 1.2-.2 2.4-.2 3.6 0 1 .4 1.6 1.3 1.6 2.3.1 2.8.1 5.6 0 8.4-.1 1.3-1.1 2.4-2.4 2.4-.7.1-1.4.1-2.1 0-1.3-.1-2.3-1.1-2.3-2.4-.1-2.8-.1-5.6 0-8.4Z" />
      <path d="M9.5 14.2c1.7-.2 3.4-.2 5 0" />
    </>
  ),

  Kozmetik: (
    <>
      <path d="M9.4 12.7c1.7-.2 3.5-.2 5.2 0 .1 2.8.1 5.7 0 8.5-1.7.2-3.5.2-5.2 0-.1-2.8-.1-5.7 0-8.5Z" />
      <path d="M9.4 12.7c-.1-1.4-.1-2.8 0-4.2 1.7-1 3.5-1.9 5.2-2.7.1 2.3.1 4.6 0 6.9" />
      <path d="M9.5 16.3c1.7-.2 3.4-.2 5 0" />
    </>
  ),

  Parfüm: (
    <>
      <path d="M10.4 3.1c1.1-.1 2.2-.1 3.2 0 .1.8.1 1.6 0 2.4-1.1.1-2.2.1-3.2 0-.1-.8-.1-1.6 0-2.4Z" />
      <path d="M16.4 5.5c.6-.1 1.2-.1 1.8 0 .1.7.1 1.5 0 2.2" />
      <path d="M8.3 9.7c.1-1.5.9-2.9 2.1-3.7 1.1-.2 2.2-.2 3.3 0 1.2.8 2 2.2 2.1 3.7.1 2.9.1 5.8 0 8.6-.1 1.4-1.2 2.6-2.6 2.6-.9.1-1.7.1-2.5 0-1.4 0-2.5-1.2-2.5-2.6-.1-2.8-.1-5.7.1-8.6Z" />
    </>
  ),

  Takviyeler: (
    <>
      <path d="M6.6 13.2c1.9-2 3.9-4 5.9-5.9 1.5-1.4 3.9-1.3 5.2.2 1.3 1.5 1.1 3.8-.4 5.1-2 2-4 4-6 5.9-1.5 1.3-3.8 1.1-5.1-.4-1.2-1.5-1.1-3.6.4-4.9Z" />
      <path d="M9.6 14.7c1.7-1.7 3.4-3.4 5.1-5.1" />
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
                {/* Kalemin ikinci geçişi: hafif kaymış soluk kopya. */}
                <g className="sketch-ghost">{CATEGORY_ICONS[item.label]}</g>
                <g>{CATEGORY_ICONS[item.label]}</g>
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
