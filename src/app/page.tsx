import Image from "next/image";
import Link from "next/link";
import { CouponCopy } from "@/components/coupon-strip";
import {
  ProductBlock,
  Perks,
  CategoryStrip,
  HelpStrip,
} from "@/components/home-blocks";
import { discountOf } from "@/components/product-card";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { formatPrice } from "@/lib/product-types";
import { getStorefrontProducts } from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

/**
 * Ana sayfa. Sıralama, Türkiye'de alışveriş yapan kullanıcının
 * öncelik sırasına göre kurulmuştur: önce fiyat/indirim, sonra ürün
 * görseli, sonra bulunabilirlik, sonra güven.
 *
 *   Hero → Güvence → Arama + kupon → İNDİRİMDEKİLER → Kategoriler
 *   → Çok satanlar → Kampanya → Yeni gelenler → Yardım
 *
 * `data-arvo-section` / `data-arvo-field` nitelikleri ARC panelinin
 * canlı düzenleme bağlantılarıdır; kaldırılırsa panel bölümü seçemez.
 */

const CATEGORIES = [
  { label: "Giyim", href: "/koleksiyon/giyim" },
  { label: "Kişisel Bakım", href: "/koleksiyon/bakim" },
  { label: "Kozmetik", href: "/koleksiyon/kozmetik" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
  { label: "Takviyeler", href: "/koleksiyon/takviyeler" },
];

const CHIPS = [
  { label: "Serum", href: "/koleksiyon/cilt-bakim-serumlari" },
  { label: "Oversize tişört", href: "/koleksiyon/oversize-tisortler" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
  { label: "Güneş koruma", href: "/koleksiyon/gunes-koruyuculari" },
];

export default async function Home() {
  const [theme, products, discounts] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontProducts(120),
    getStorefrontDiscounts(),
  ]);

  const coupon = discounts.find((discount) => discount.code);

  // Tükenmiş ürün ana sayfada gösterilmez: müşteriyi satın
  // alamayacağı bir sayfaya götürmek en pahalı terk noktasıdır.
  const inStock = products.filter((product) => product.available !== false);

  const deals = inStock
    .filter((product) => discountOf(product) > 0)
    .sort((a, b) => discountOf(b) - discountOf(a))
    .slice(0, 10);

  const flagged = inStock.filter((product) => product.bestSeller);
  const best = (flagged.length >= 5 ? flagged : inStock).slice(0, 10);

  const fresh = inStock.slice(0, 5);

  const categories = CATEGORIES.map((category) => ({
    ...category,
    image: inStock.find((product) => product.category === category.label)?.image,
  }));

  return (
    <main>
      <ThemePreviewBridge />

      <Hero theme={theme} />

      <Perks />

      <section className="utility" aria-label="Arama ve kampanya">
        <div className="utility-search">
          <Link href="/arama" className="search-box">
            <span>Ürün, marka veya kategori ara</span>
            <em>Ara</em>
          </Link>
          <ul className="chips">
            {CHIPS.map((chip) => (
              <li key={chip.href}>
                <Link href={chip.href}>{chip.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {coupon?.code && (
          <div className="coupon">
            <div>
              <strong>
                İlk alışverişte{" "}
                {coupon.discount_type === "percentage"
                  ? `%${coupon.value}`
                  : formatPrice(coupon.value / 100)}{" "}
                indirim
              </strong>
              <small>Kodu sepette uygulayın</small>
            </div>
            <CouponCopy code={coupon.code} />
          </div>
        )}
      </section>

      {/* Fiyat birinci öncelik: indirimler en üstte. */}
      <ProductBlock
        title="İndirimdeki ürünler"
        note="Sınırlı stokla sunulan güncel fırsatlar."
        href="/koleksiyon/firsatlar"
        hrefLabel="Tüm fırsatlar"
        products={deals}
      />

      <CategoryStrip items={categories} />

      <ProductBlock
        title="Çok satanlar"
        note="Müşterilerimizin en sık tercih ettiği ürünler."
        href="/koleksiyon/cok-satan-cilt-bakim-urunleri"
        hrefLabel="Tümünü gör"
        products={best}
        alt
      />

      {theme.show_campaign && (
        <section data-arvo-section="campaign" className="promo">
          {theme.campaign_image_url && (
            <Image
              unoptimized
              src={theme.campaign_image_url}
              alt=""
              width={1600}
              height={600}
            />
          )}
          <div className="promo-body">
            <h2 data-arvo-field="campaign_title">{theme.campaign_title}</h2>
            <p data-arvo-field="campaign_description">
              {theme.campaign_description}
            </p>
            <Link className="btn" href="/koleksiyon/tumu">
              Alışverişe başla
            </Link>
          </div>
        </section>
      )}

      {theme.show_featured && (
        <div data-arvo-section="featured">
          <ProductBlock
            title={theme.featured_title}
            note={theme.featured_eyebrow}
            href="/koleksiyon/tumu"
            hrefLabel="Tüm ürünler"
            products={fresh}
          />
        </div>
      )}

      <HelpStrip />
    </main>
  );
}

function Hero({ theme }: { theme: StorefrontTheme }) {
  return (
    <section data-arvo-section="hero" className="hero">
      {theme.hero_image_url && (
        <Image
          unoptimized
          src={theme.hero_image_url}
          alt=""
          width={2000}
          height={1000}
          priority
        />
      )}
      <div className="hero-body">
        <p data-arvo-field="hero_eyebrow">{theme.hero_eyebrow}</p>
        <h1 data-arvo-field="hero_title">
          {theme.hero_title} <span data-arvo-field="hero_emphasis">{theme.hero_emphasis}</span>
        </h1>
        <p data-arvo-field="hero_description" className="hero-lede">
          {theme.hero_description}
        </p>
        <div className="hero-cta">
          {/* Tek baskın eylem; ikincisi sessiz bağlantı. */}
          <Link
            data-arvo-field="primary_cta_label"
            className="btn"
            href={theme.primary_cta_href}
          >
            {theme.primary_cta_label}
          </Link>
          <Link
            data-arvo-field="secondary_cta_label"
            href={theme.secondary_cta_href}
          >
            {theme.secondary_cta_label}
          </Link>
        </div>
      </div>
    </section>
  );
}
