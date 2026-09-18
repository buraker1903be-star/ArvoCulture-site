import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import type { Product } from "@/lib/product-types";

/** Ürün ızgarası. Ana sayfada birden çok yerde kullanılır. */
export function ProductBlock({
  title,
  eyebrow,
  note,
  href,
  hrefLabel,
  products,
  alt,
  rail,
}: {
  title: string;
  /**
   * Başlığın üstündeki künye etiketi. ARC panelindeki
   * `featured_eyebrow` buraya geliyor; önceden açıklama satırına
   * basılıyordu ve büyük harfli etiket, cümle boyunda duruyordu.
   */
  eyebrow?: string;
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
          {eyebrow && <p className="about-eyebrow">{eyebrow}</p>}
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
  { title: "14 gün içinde iade", note: "Kullanılmamış ürünlerde", href: "/iptal-iade" },
  { title: "3D Secure ile ödeme", note: "Kart bilgisi saklanmaz", href: "/gizlilik" },
  { title: "Orijinal ürün", note: "Yetkili tedarik", href: "/sss" },
];

export function Perks({ shippingBadge }: { shippingBadge: string }) {
  /* Kargo maddesi mağazanın tarifesinden gelir (shippingTerms); önceden
     "2.000 TL" sabitti ve panelden eşik değişince yanlış kalıyordu. */
  const perks = [
    { title: shippingBadge, note: "Türkiye geneli", href: "/teslimat" },
    ...PERKS,
  ];
  return (
    /*
      Kendi paneli yok: ana sayfada arama ve kupon panelinin alt katı
      (bkz. page.tsx). Ayrı bir bant olarak duyuru çubuğunu tekrar
      ediyor, mobilde tek başına 224px yer kaplıyordu.
    */
    <nav className="perks" aria-label="Alışveriş güvencesi">
      {perks.map((perk) => (
        <Link key={perk.title} href={perk.href}>
          <strong>{perk.title}</strong>
          <small>{perk.note}</small>
        </Link>
      ))}
    </nav>
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
        {items.map((item, index) => {
          // "/koleksiyon/bakim" → "bakim"
          const key = item.href.split("/").pop() ?? "";
          return (
            <Link key={item.href} href={item.href} className="cat-card">
              <span className="cat-card-art">
                <Image
                  src={`/kategori/${key}.jpg`}
                  alt=""
                  fill
                  /*
                    Telefonda ilk kart tam genişlik (bkz. .cat-cards
                    > :first-child), diğerleri ikişerli. Tek bir "45vw"
                    ilk kartı yarı çözünürlükte, bulanık çiziyordu.
                  */
                  sizes={
                    index === 0
                      ? "(max-width: 640px) 90vw, (max-width: 980px) 30vw, 19vw"
                      : "(max-width: 640px) 42vw, (max-width: 980px) 30vw, 19vw"
                  }
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
