import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { ProductCard } from "@/components/product-card";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { getStorefrontProducts, type Product } from "@/lib/products";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

export default async function Home() {
  const [theme, products] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontProducts(48),
  ]);
  const apparel = products.find((product) => product.category === "Giyim");
  const beauty =
    products.find((product) => product.category === "Kişisel Bakım") ??
    products.find((product) => product.category !== "Giyim");
  const scent = products.find((product) => product.category === "Parfüm");
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
            className="apparel"
          />
          <World
            number="02"
            label="BEAUTY & CARE"
            title={theme.beauty_title}
            description={theme.beauty_description}
            href="/koleksiyon/bakim"
            product={beauty}
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
            <h2 data-arvo-field="campaign_title">{theme.campaign_title}</h2>
            <p data-arvo-field="campaign_description">
              {theme.campaign_description}
            </p>
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
  className,
}: {
  number: string;
  label: string;
  title: string;
  description: string;
  href: string;
  product?: Product;
  className: string;
}) {
  return (
    <Link href={href} className={`world ${className}`}>
      {product?.image && <Image src={product.image} alt="" fill sizes="50vw" />}
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
