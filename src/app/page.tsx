import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { formatPrice, type Product } from "@/lib/product-types";
import { ProductCard } from "@/components/product-card";
import { ProductRail } from "@/components/product-rail";
import { AssuranceBar } from "@/components/assurance-bar";
import { HomeSearch } from "@/components/home-search";
import { CouponStrip } from "@/components/coupon-strip";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { getStorefrontProducts } from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

/**
 * Ana sayfa bir satın alma hunisi olarak sıralanmıştır:
 *
 *   1. Hero            — ne satıyoruz, tek net eylem
 *   2. Güven şeridi    — "bu siteye güvenebilir miyim"
 *   3. Kupon           — ilk alışveriş engelini düşür
 *   4. Çok satanlar    — sosyal kanıt, doğrudan ürüne geçiş
 *   5. Kategoriler     — niyeti belli ziyaretçiye kısayol
 *   6. İndirimdekiler  — aciliyet
 *   7. ARC bölümleri   — panelden yönetilen öne çıkanlar/kampanya/değerler
 *   8. Dünyalar        — marka anlatısı
 *   9. Yardım şeridi   — ayrılmadan önce kalan soruları kapat
 *
 * `data-arvo-section` ve `data-arvo-field` nitelikleri ARC panelinin
 * canlı düzenleme modunun bağlantı noktalarıdır. Kaldırılırsa paneldeki
 * tema editörü o bölümü seçemez — dokunmayın.
 */

const CATEGORIES = [
  { label: "Giyim", note: "Zamansız kesimler", href: "/koleksiyon/giyim" },
  {
    label: "Kişisel Bakım",
    note: "Günlük ritüeller",
    href: "/koleksiyon/bakim",
  },
  {
    label: "Kozmetik",
    note: "İfade dokunuşları",
    href: "/koleksiyon/kozmetik",
  },
  { label: "Parfüm", note: "Görünmeyen imzan", href: "/koleksiyon/parfum" },
  {
    label: "Takviyeler",
    note: "Günlük destek",
    href: "/koleksiyon/takviyeler",
  },
];

const HELP_LINKS = [
  { label: "Kargo ne zaman çıkar?", href: "/teslimat" },
  { label: "İade nasıl yapılır?", href: "/iptal-iade" },
  { label: "Sık sorulan sorular", href: "/sss" },
  { label: "Bize ulaşın", href: "/iletisim" },
];

function discountOf(product: Product) {
  if (product.discountPercent) return product.discountPercent;
  if (product.oldPrice && product.oldPrice > product.price) {
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }
  return 0;
}

export default async function Home() {
  const [theme, products, discounts] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontProducts(120),
    getStorefrontDiscounts(),
  ]);

  const coupon = discounts.find((discount) => discount.code);

  // Tükenmiş ürünü ana sayfada öne çıkarmak, ziyaretçiyi satın
  // alamayacağı bir sayfaya götürür. Baştan eliyoruz.
  const inStock = products.filter((product) => product.available !== false);

  const flagged = inStock.filter((product) => product.bestSeller);
  const bestSellers = (flagged.length >= 4 ? flagged : inStock).slice(0, 8);

  const discounted = inStock
    .filter((product) => discountOf(product) > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, 8);

  const featured = inStock.slice(0, Math.max(theme.products_per_row, 4));

  const categories = CATEGORIES.map((category) => ({
    ...category,
    product: inStock.find((product) => product.category === category.label),
  }));

  const apparel = inStock
    .filter((product) => product.category === "Giyim")
    .slice(0, 3);
  const beauty = inStock
    .filter((product) => product.category === "Kişisel Bakım")
    .slice(0, 3);

  /* Sırası ve görünürlüğü ARC panelinden yönetilen bölümler. */
  const managed: Array<{ order: number; node: ReactNode } | false> = [
    theme.show_featured && {
      order: theme.order_featured,
      node: (
        <section
          key="featured"
          data-arvo-section="featured"
          className="rail"
          aria-labelledby="featured-title"
        >
          <div className="section-head">
            <div>
              <p data-arvo-field="featured_eyebrow" className="eyebrow">
                {theme.featured_eyebrow}
              </p>
              <h2 data-arvo-field="featured_title" id="featured-title">
                {theme.featured_title}
              </h2>
            </div>
            <Link href="/koleksiyon/tumu">Tüm ürünler</Link>
          </div>
          <div className="rail-track">
            {featured.map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                index={index}
                theme={theme}
              />
            ))}
          </div>
        </section>
      ),
    },

    theme.show_campaign && {
      order: theme.order_campaign,
      node: (
        <section
          key="campaign"
          data-arvo-section="campaign"
          className="campaign-band"
        >
          {theme.campaign_image_url ? (
            <Image
              unoptimized
              src={theme.campaign_image_url}
              alt=""
              fill
              sizes="100vw"
            />
          ) : null}
          <div className="campaign-copy">
            <h2 data-arvo-field="campaign_title">{theme.campaign_title}</h2>
            <p data-arvo-field="campaign_description">
              {theme.campaign_description}
            </p>
            <Link className="button button-light" href="/koleksiyon/tumu">
              Alışverişe başla
            </Link>
          </div>
        </section>
      ),
    },

    theme.show_values && {
      order: theme.order_values,
      node: (
        <section
          key="values"
          data-arvo-section="values"
          className="values"
          aria-label="Çalışma ilkelerimiz"
        >
          {[
            theme.trust_one,
            theme.trust_two,
            theme.trust_three,
            theme.trust_four,
          ]
            .filter(Boolean)
            .map((value) => (
              <div key={value}>
                <h3>{value}</h3>
              </div>
            ))}
        </section>
      ),
    },
  ];

  const managedSections = managed
    .filter((section): section is { order: number; node: ReactNode } =>
      Boolean(section),
    )
    .sort((a, b) => a.order - b.order)
    .map((section) => section.node);

  return (
    <main>
      <ThemePreviewBridge />

      <Hero theme={theme} />

      <AssuranceBar />

      <HomeSearch />

      {coupon?.code && (
        <CouponStrip
          code={coupon.code}
          headline={
            coupon.discount_type === "percentage"
              ? `İlk alışverişinde %${coupon.value} indirim`
              : `İlk alışverişinde ${formatPrice(coupon.value / 100)} indirim`
          }
          note="Kodu sepette uygula"
        />
      )}

      <ProductRail
        eyebrow="EN ÇOK TERCİH EDİLENLER"
        title="Çok satanlar"
        note="Müşterilerimizin en sık seçtiği ürünler."
        href="/koleksiyon/cok-satan-cilt-bakim-urunleri"
        hrefLabel="Tümünü gör"
        products={bestSellers}
        theme={theme}
      />

      <section className="category-grid" aria-labelledby="kategoriler">
        <div className="section-head">
          <div>
            <p className="eyebrow">NEREDEN BAŞLAMAK İSTERSİN</p>
            <h2 id="kategoriler">Kategoriler</h2>
          </div>
          <Link href="/koleksiyon/tumu">Tüm katalog</Link>
        </div>
        <div className="category-track">
          {categories.map((category) => (
            <Link
              key={category.label}
              href={category.href}
              className="category-tile"
            >
              <span className="category-art">
                {category.product?.image && (
                  <Image
                    src={category.product.image}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 45vw, 19vw"
                  />
                )}
              </span>
              <strong>{category.label}</strong>
              <small>{category.note}</small>
            </Link>
          ))}
        </div>
      </section>

      <ProductRail
        eyebrow="FIRSATLAR"
        title="İndirimdeki ürünler"
        note="Sınırlı stokla sunulan güncel indirimler."
        href="/koleksiyon/firsatlar"
        hrefLabel="Tüm fırsatlar"
        products={discounted}
        theme={theme}
      />

      {managedSections}

      <section className="worlds" aria-label="ArvoCulture dünyaları">
        <World
          href="/koleksiyon/giyim"
          eyebrow="ARVOCULTURE APPAREL"
          title="Giydiğin şey, senin hikâyen."
          note="Zamansız kesimler ve özgün grafikler."
          products={apparel}
          tone="apparel"
        />
        <World
          href="/koleksiyon/bakim"
          eyebrow="BEAUTY & CARE"
          title="Bakım, kendine ayırdığın zaman."
          note="Günlük ritüelini tamamlayan seçilmiş ürünler."
          products={beauty}
          tone="beauty"
        />
      </section>

      <section className="help-strip" aria-label="Yardım">
        <p>Aklında bir soru mu var?</p>
        <ul>
          {HELP_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

/* ---------- Alt bileşenler ---------- */

function Hero({ theme }: { theme: StorefrontTheme }) {
  const style = theme.hero_image_url
    ? ({ backgroundImage: `url(${theme.hero_image_url})` } as CSSProperties)
    : undefined;

  return (
    <section data-arvo-section="hero" className="hero signature-hero">
      <div className="hero-copy">
        <p data-arvo-field="hero_eyebrow" className="eyebrow">
          {theme.hero_eyebrow}
        </p>
        <h1 data-arvo-field="hero_title">
          {theme.hero_title}{" "}
          <em data-arvo-field="hero_emphasis">{theme.hero_emphasis}</em>
        </h1>
        <p data-arvo-field="hero_description">{theme.hero_description}</p>
        <div className="hero-actions">
          {/*
            Tek baskın eylem. Eşit ağırlıkta iki buton ziyaretçiyi karar
            vermek zorunda bırakıp ikisine de tıklamamasına yol açıyordu;
            ikincisi artık sessiz bir bağlantı.
          */}
          <Link
            data-arvo-field="primary_cta_label"
            className="button button-light"
            href={theme.primary_cta_href}
          >
            {theme.primary_cta_label}
          </Link>
          <Link
            data-arvo-field="secondary_cta_label"
            className="hero-secondary"
            href={theme.secondary_cta_href}
          >
            {theme.secondary_cta_label}
          </Link>
        </div>
      </div>
      <div
        className={`hero-art ${theme.hero_image_url ? "has-image" : ""}`}
        style={style}
      >
        {!theme.hero_image_url && <div className="hero-monogram">AC</div>}
      </div>
    </section>
  );
}

function World({
  href,
  eyebrow,
  title,
  note,
  products,
  tone,
}: {
  href: string;
  eyebrow: string;
  title: string;
  note: string;
  products: Product[];
  tone: "apparel" | "beauty";
}) {
  return (
    <div className={`world ${tone}`}>
      <div className="world-copy">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <p>{note}</p>
        <Link href={href} className="world-link">
          Keşfet
        </Link>
      </div>
      <div className="world-thumbs">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/urun/${product.slug}`}
            className="world-thumb"
          >
            <span>
              {product.image && (
                <Image src={product.image} alt="" fill sizes="120px" />
              )}
            </span>
            <small>{product.name}</small>
          </Link>
        ))}
      </div>
    </div>
  );
}
