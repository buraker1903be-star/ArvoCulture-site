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
/*
  Kategori ikonları. Tasarım kuralı: her siluet uzaktan bakıldığında
  diğerlerinden ayırt edilebilmeli. İlk denemede bakım, kozmetik ve
  parfüm hepsi dikdörtgen şişeye benziyordu; ayırt edilemiyorlardı.

  Çözüm farklı temel biçimler: askı (üçgen), damlalıklı şişe (ince
  boyun), açılı ruj (eğik uç), geniş omuzlu flakon, eğik kapsül.
*/
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  // Askı — tişörtten daha zarif ve giyimi bütün olarak anlatır.
  Giyim: (
    <>
      <path d="M12 4.4a1.7 1.7 0 1 1 1.7 1.7c-.9 0-1.7.8-1.7 1.7v.9" />
      <path d="M12 8.9 4.2 14.4c-1 .7-.5 2.2.7 2.2h14.2c1.2 0 1.7-1.5.7-2.2L12 8.9Z" />
    </>
  ),

  // Damlalıklı serum şişesi — ince boyun ve uzun pipet.
  "Kişisel Bakım": (
    <>
      <path d="M11 2.8h2v4.4h-2z" />
      <path d="M10.2 7.2h3.6" />
      <path d="M8.6 10.4a2.4 2.4 0 0 1 1.6-2.3h3.6a2.4 2.4 0 0 1 1.6 2.3v8.4a2.4 2.4 0 0 1-2.4 2.4h-2A2.4 2.4 0 0 1 8.6 18.8Z" />
      <path d="M9.4 14.2h5.2" />
    </>
  ),

  // Ruj — eğik uç, kesinlikle şişeye benzemez.
  Kozmetik: (
    <>
      <path d="M9.4 12.6h5.2v8.6H9.4z" />
      <path d="M9.4 12.6V8.4l5.2-2.6v6.8" />
      <path d="M9.4 16.2h5.2" />
    </>
  ),

  // Parfüm flakonu — geniş omuz, kapak ve sprey başlığı.
  Parfüm: (
    <>
      <path d="M10.4 3h3.2v2.4h-3.2z" />
      <path d="M16.4 5.4h1.8v2.2" />
      <path d="M8.2 9.6a4 4 0 0 1 2.2-3.6h3.2a4 4 0 0 1 2.2 3.6v8.6a2.6 2.6 0 0 1-2.6 2.6h-2.4a2.6 2.6 0 0 1-2.6-2.6Z" />
    </>
  ),

  // Tek kapsül, eğik. Üst üste binen iki kapsül karışık görünüyordu.
  Takviyeler: (
    <>
      <rect
        x="4.6"
        y="9"
        width="14.8"
        height="6.4"
        rx="3.2"
        transform="rotate(-45 12 12.2)"
      />
      <path d="M9.6 14.6 14.6 9.6" />
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
