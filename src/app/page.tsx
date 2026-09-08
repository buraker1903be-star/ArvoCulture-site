import Image from "next/image";
import Link from "next/link";
import { CouponCopy } from "@/components/coupon-strip";
import { SearchOverlay } from "@/components/search-overlay";
import {
  ProductBlock,
  Perks,
  CategoryStrip,
  HelpStrip,
} from "@/components/home-blocks";
import { discountOf } from "@/components/product-card";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { formatPrice } from "@/lib/product-types";
import {
  getStorefrontProducts,
  getStorefrontCollectionProducts,
  getStorefrontDeals,
} from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { getSearchIndex } from "@/lib/search-index";
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

/* Arama katmanındaki popüler aramalar. Görselleri katalogdan
   eşleşen ilk üründen alınır; sabit görsel dosyası tutulmaz. */
const SEARCH_TILES = [
  { label: "Serum", href: "/koleksiyon/cilt-bakim-serumlari", match: "serum" },
  { label: "Parfüm", href: "/koleksiyon/parfum", match: "parfüm" },
  { label: "Oversize tişört", href: "/koleksiyon/oversize-tisortler", match: "tişört" },
  { label: "Güneş koruma", href: "/koleksiyon/gunes-koruyuculari", match: "güneş" },
  { label: "Nemlendirici", href: "/koleksiyon/nemlendiriciler", match: "nemlendir" },
  { label: "Vitamin", href: "/koleksiyon/vitamin-takviyeleri", match: "vitamin" },
];

export default async function Home() {
  const [theme, products, discounts, searchItems, curatedBest, dealItems] =
    await Promise.all([
    getStorefrontTheme(),
    getStorefrontProducts(200),
    getStorefrontDiscounts(),
    getSearchIndex(),
    /*
      Çok satanlar ARC'taki "Çok Satanlar" koleksiyonundan gelir.
      Slug eski adından kalma; başlık panelden değiştirilmiş.
      Böylece hangi ürünlerin öne çıkacağına panelden siz karar
      verirsiniz. Öncesinde katalog sırasına düşüyordu ve
      tedarikçiden yeni gelen, hiç satılmamış ürünler "çok satan"
      olarak gösteriliyordu.
    */
    getStorefrontCollectionProducts({
      collectionSlug: "cok-satan-cilt-bakim-urunleri",
    }),
    /*
      İndirimliler ayrı uç noktadan gelir. Katalogdan süzmek,
      katalog 3.000 ürünü aştıktan sonra işe yaramıyordu:
      ana sayfa ilk 200 ürünü çekiyor ve indirimliler o listeye
      hiç giremiyordu.
    */
    getStorefrontDeals(10),
  ]);

  const coupon = discounts.find((discount) => discount.code);

  // Tükenmiş ürün ana sayfada gösterilmez: müşteriyi satın
  // alamayacağı bir sayfaya götürmek en pahalı terk noktasıdır.
  const inStock = products.filter((product) => product.available !== false);

  const deals = dealItems.filter((product) => product.available !== false);

  /*
    Koleksiyon boşsa ARC'ta işaretlenmiş ürünlere düşülür.
    Katalog sırasına asla düşülmez.
  */
  const curated = curatedBest.filter((product) => product.available !== false);
  const flagged = inStock.filter((product) => product.bestSeller);
  const best = (curated.length > 0 ? curated : flagged).slice(0, 10);

  const fresh = inStock.slice(0, 5);

  const searchTiles = SEARCH_TILES.map((tile) => ({
    label: tile.label,
    href: tile.href,
    image: inStock.find((product) =>
      `${product.name} ${product.category}`
        .toLocaleLowerCase("tr-TR")
        .includes(tile.match),
    )?.image,
  }));

  const categories = CATEGORIES;

  return (
    <main className="shell">
      <ThemePreviewBridge />

      <Hero theme={theme} />

      <Perks />

      <section className="panel panel-tight utility" aria-label="Arama ve kampanya">
        <div className="utility-search">
          <SearchOverlay tiles={searchTiles} items={searchItems} />
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

      {/* Satış verisi yoksa bölüm hiç görünmez. Hiç satılmamış
          ürünü "çok satan" diye göstermek güveni zedeler. */}
      <ProductBlock
        title="Çok satanlar"
        note="Müşterilerimizin en sık tercih ettiği ürünler."
        href="/koleksiyon/cok-satan-cilt-bakim-urunleri"
        hrefLabel="Tümünü gör"
        products={best}
        alt
      />

      {theme.show_campaign && (
        <section data-arvo-section="campaign" className="panel promo">
          {theme.campaign_image_url && (
            <Image
              unoptimized
              src={theme.campaign_image_url}
              alt=""
              width={1600}
              height={600}
            />
          )}
          {/* Filigran: indirim oranı, panelin sağ tarafındaki boşluğu
              dolduran dev bir kontur rakam. Dekoratif olduğu için
              ekran okuyuculardan gizli. */}
          {coupon?.discount_type === "percentage" && (
            <span className="promo-watermark" aria-hidden="true">
              %{coupon.value}
            </span>
          )}

          <div className="promo-body">
            <p className="promo-eyebrow">Yeni müşterilere özel</p>
            <h2 data-arvo-field="campaign_title">{theme.campaign_title}</h2>
            <p data-arvo-field="campaign_description">
              {theme.campaign_description}
            </p>

            {/* Kupon kodu, açıklama metninin içinde kaybolmasın diye
                ayrı bir kart olarak gösteriliyor. */}
            {coupon?.code && (
              <div className="promo-code">
                <div>
                  <small>İndirim kodu</small>
                  <strong>{coupon.code}</strong>
                </div>
                <CouponCopy code={coupon.code} />
              </div>
            )}

            <Link className="btn btn-light" href="/koleksiyon/tumu">
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
    <section data-arvo-section="hero" className="panel hero">
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
