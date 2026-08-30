import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { getStorefrontProducts, type Product } from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

export default async function Home() {
  const [theme, products, discounts] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontProducts(120),
    getStorefrontDiscounts(),
  ]);
  const coupon = discounts.find((discount) => discount.code);
  const automaticOffer = discounts.find((discount) => !discount.code);
  const apparel = products.find((product) => product.category === "Giyim");
  const beauty =
    products.find((product) => product.category === "Kişisel Bakım") ??
    products.find((product) => product.category !== "Giyim");
  const scent = products.find((product) => product.category === "Parfüm");
  const categoryTiles = [
    {
      label: "Giyim",
      note: "Tarzını yansıtan parçalar",
      href: "/koleksiyon/giyim",
    },
    {
      label: "Kişisel Bakım",
      note: "Günlük bakım ritüelleri",
      href: "/koleksiyon/bakim",
    },
    {
      label: "Kozmetik",
      note: "Kendini ifade eden dokunuşlar",
      href: "/koleksiyon/kozmetik",
    },
    { label: "Parfüm", note: "Görünmeyen imzan", href: "/koleksiyon/parfum" },
    {
      label: "Takviyeler",
      note: "Günlük yaşam desteği",
      href: "/koleksiyon/takviyeler",
    },
  ].map((tile) => ({
    ...tile,
    product: products.find((product) => product.category === tile.label),
  }));
  const sections: Array<{ order: number; node: ReactNode } | false> = [
    theme.show_manifest && {
      order: theme.order_manifest,
      node: (
        <section
          data-arvo-section="manifest"
          className="manifest"
          id="hikaye"
          key="manifest"
        >
          <p className="eyebrow">ARVOCULTURE DÜNYASI</p>
          <h2 data-arvo-field="manifest_title">{theme.manifest_title}</h2>
          <p data-arvo-field="manifest_description">
            {theme.manifest_description}
          </p>
        </section>
      ),
    },
    theme.show_worlds && {
      order: theme.order_worlds,
      node: (
        <section data-arvo-section="worlds" className="worlds" key="worlds">
          <World
            number="01"
            label="APPAREL"
            title={theme.apparel_title}
            description={theme.apparel_description}
            href="/koleksiyon/giyim"
            product={apparel}
            imageUrl="https://arvoculture.com/cdn/shop/collections/Urun_sahneleme-218cb1dd-ee3f-4309-998f-ba890d2e82be.jpg?v=1783214697&width=1600"
            className="apparel"
          />
          <World
            number="02"
            label="BEAUTY & CARE"
            title={theme.beauty_title}
            description={theme.beauty_description}
            href="/koleksiyon/bakim"
            product={beauty}
            imageUrl="https://arvoculture.com/cdn/shop/collections/zsYrJrOa0d55JIq11-LAI_OsD30aZg_00001_08533ee2-3c57-4092-b28e-d1dccb1d178f.webp?v=1784578872&width=1600"
            className="beauty"
          />
        </section>
      ),
    },
    theme.show_featured && {
      order: theme.order_featured,
      node: (
        <section
          data-arvo-section="featured"
          className="featured"
          key="featured"
        >
          <div className="section-head">
            <div>
              <p data-arvo-field="featured_eyebrow" className="eyebrow">
                {theme.featured_eyebrow}
              </p>
              <h2 data-arvo-field="featured_title">{theme.featured_title}</h2>
            </div>
            <Link href="/koleksiyon/tumu">Tüm ürünler →</Link>
          </div>
          <div className="product-grid">
            {products
              .slice(0, Math.max(theme.products_per_row, 4))
              .map((product, index) => (
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
          data-arvo-section="campaign"
          className="campaign"
          key="campaign"
          style={
            theme.campaign_image_url
              ? {
                  backgroundImage: `linear-gradient(90deg,rgba(17,18,16,.94),rgba(17,18,16,.45)),url(${theme.campaign_image_url})`,
                }
              : undefined
          }
        >
          <span>%10</span>
          <div>
            <p className="eyebrow">ARVOCULTURE’A HOŞ GELDİN</p>
            <h2 data-arvo-field="campaign_title">
              {coupon?.badge ?? theme.campaign_title}
            </h2>
            <p data-arvo-field="campaign_description">
              {coupon
                ? `${coupon.code} kodunu kullan; ${coupon.name.toLocaleLowerCase("tr-TR")} avantajından yararlan.`
                : theme.campaign_description}
            </p>
            {coupon?.code && (
              <strong className="campaign-code">{coupon.code}</strong>
            )}
          </div>
          <Link className="button button-light" href="/koleksiyon/tumu">
            Alışverişe başla
          </Link>
        </section>
      ),
    },
    theme.show_values && {
      order: theme.order_values,
      node: (
        <section data-arvo-section="values" className="values" key="values">
          {[
            theme.trust_one,
            theme.trust_two,
            theme.trust_three,
            theme.trust_four,
          ].map((value, index) => (
            <div key={`${value}-${index}`}>
              <span>0{index + 1}</span>
              <h3>{value}</h3>
            </div>
          ))}
        </section>
      ),
    },
  ];
  return (
    <main>
      <ThemePreviewBridge />
      <Hero theme={theme} />
      <div className="culture-ticker" aria-label="ArvoCulture özellikleri">
        <div>
          <span>YENİ NESİL YAŞAM KÜLTÜRÜ</span>
          <i>✦</i>
          <span>PREMIUM GİYİM</span>
          <i>✦</i>
          <span>SEÇİLMİŞ BAKIM</span>
          <i>✦</i>
          <span>KARAKTERİNE ÖZEL KOKULAR</span>
          <i>✦</i>
          {automaticOffer && (
            <>
              <span>{automaticOffer.badge}</span>
              <i>✦</i>
            </>
          )}
          <span>YENİ NESİL YAŞAM KÜLTÜRÜ</span>
          <i>✦</i>
        </div>
      </div>
      {sections
        .filter((section): section is { order: number; node: ReactNode } =>
          Boolean(section),
        )
        .sort((a, b) => a.order - b.order)
        .map((section) => section.node)}
      <section className="category-showcase">
        <div className="section-head">
          <div>
            <p className="eyebrow">TÜM ARVOCULTURE DÜNYASI</p>
            <h2>Ritmini seç.</h2>
          </div>
          <p>Stilden bakıma, her gününe eşlik eden seçilmiş koleksiyonlar.</p>
        </div>
        <div className="category-rail">
          {categoryTiles.map((tile, index) => (
            <Link href={tile.href} className="category-tile" key={tile.href}>
              <span>0{index + 1}</span>
              <div className="category-image">
                {tile.product?.image ? (
                  <Image
                    src={tile.product.image}
                    alt={tile.product.name}
                    fill
                    sizes="(max-width:700px) 76vw, 25vw"
                  />
                ) : (
                  <b>AC</b>
                )}
              </div>
              <h3>{tile.label}</h3>
              <p>{tile.note}</p>
              <b>Keşfet ↗</b>
            </Link>
          ))}
        </div>
      </section>
      {scent?.image && (
        <Link href="/koleksiyon/parfum" className="editorial-strip">
          <Image src={scent.image} alt="Parfüm seçkisi" fill sizes="100vw" />
          <div>
            <p className="eyebrow">SIGNATURE SCENTS</p>
            <h2>Kokun, görünmeyen imzan.</h2>
            <span>Parfüm seçkisini keşfet →</span>
          </div>
        </Link>
      )}
    </main>
  );
}

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
        <h1>
          <span data-arvo-field="hero_title">{theme.hero_title}</span>
          <br />
          <em data-arvo-field="hero_emphasis">{theme.hero_emphasis}</em>
        </h1>
        <p data-arvo-field="hero_description">{theme.hero_description}</p>
        <div className="hero-actions">
          <Link
            data-arvo-field="primary_cta_label"
            className="button button-light"
            href={theme.primary_cta_href}
          >
            {theme.primary_cta_label} <span>↗</span>
          </Link>
          <Link
            data-arvo-field="secondary_cta_label"
            className="button button-glass"
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
      <span className="hero-index">01 / 05</span>
      <span className="hero-scroll">KEŞFETMEK İÇİN KAYDIR ↓</span>
    </section>
  );
}

function World({
  number,
  label,
  title,
  description,
  href,
  product,
  imageUrl,
  className,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  href: string;
  product?: Product;
  imageUrl?: string;
  className: string;
}) {
  return (
    <Link href={href} className={`world ${className}`}>
      {(imageUrl ?? product?.image) && (
        <div
          className="world-media"
          role="img"
          aria-label={`${title} koleksiyonu`}
          style={{ backgroundImage: `url("${imageUrl ?? product?.image}")` }}
        />
      )}
      <div className="world-shade" />
      <div className="world-copy">
        <span>
          {number} / {label}
        </span>
        <h2>{title}</h2>
        <p>{description}</p>
        <b>Koleksiyonu keşfet ↗</b>
      </div>
    </Link>
  );
}
