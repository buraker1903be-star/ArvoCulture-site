import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
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
      {rail ? (
        <Rail>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </Rail>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Alışveriş güvencesi. Türkiye’de ilk kez alışveriş yapılan sitede
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
  Kategori kartları.

  Önceden küçük çizim ikonlar vardı; kategori adını söylüyorlardı
  ama tarzı anlatmıyorlardı. Fotoğraf, müşterinin "burada ne var"
  sorusuna tek bakışta yanıt veriyor ve tıklanma oranını artıran
  en somut değişiklik.

  Görseller `public/kategori/` altında, kategori anahtarıyla aynı
  adı taşıyor: yeni kategori eklendiğinde aynı adla bir dosya
  koymak yeterli.
*/
export function CategoryStrip({
  items,
}: {
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>Kategoriler</h2>
          <p>Seçkinin tamamına buradan girin.</p>
        </div>
        <Link href="/koleksiyon/tumu">Tüm katalog</Link>
      </div>

      <div className="cat-cards">
        {items.map((item) => {
          // "/koleksiyon/bakim" → "bakim"
          const key = item.href.split("/").pop() ?? "";
          return (
            <Link key={item.href} href={item.href} className="cat-card">
              <span className="cat-card-art">
                <Image
                  src={`/kategori/${key}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 980px) 30vw, 19vw"
                />
              </span>
              <span className="cat-card-body">
                <strong>{item.label}</strong>
                <em>Keşfet</em>
              </span>
            </Link>
          );
        })}
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
