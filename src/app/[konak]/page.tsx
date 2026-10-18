import { konagiAyarla } from "@/lib/konak";
import Image from "next/image";
import Link from "next/link";
import { CouponCopy } from "@/components/coupon-strip";
import { getPopularSearches } from "@/lib/popular-searches";
import { canOptimizeImage } from "@/lib/image-hosts";
import { SearchOverlay } from "@/components/search-overlay";
import {
  ProductBlock,
  Perks,
  CategoryStrip,
  HelpStrip,
} from "@/components/home-blocks";
import { ThemePreviewBridge } from "@/components/theme-preview-bridge";
import { formatPrice } from "@/lib/product-types";
import {
  getStorefrontProducts,
  getStorefrontCollectionProducts,
  getStorefrontDeals,
  getStorefrontFacets,
} from "@/lib/products";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { getSalesRules } from "@/lib/store-settings";
import { shippingTerms } from "@/lib/order-quote";
import { Reveal } from "@/components/reveal";
import { ForYou } from "@/components/for-you";
import { CATEGORIES } from "@/lib/categories";
import { getKategoriVitrinleri } from "@/lib/kategori-vitrini";
import { vitrinAdresi } from "@/lib/konak";
import {
  getStorefrontTheme,
  type StorefrontTheme,
} from "@/lib/storefront-theme";

/**
 * Ana sayfa. Sıralama, Türkiye’de alışveriş yapan kullanıcının
 * öncelik sırasına göre kurulmuştur: önce fiyat/indirim, sonra ürün
 * görseli, sonra bulunabilirlik, sonra güven.
 *
 *   Hero → Arama + kupon + güvence (tek panel) → İNDİRİMDEKİLER → Kategoriler
 *   → Çok satanlar → Kampanya → Yeni gelenler → Yardım
 *
 * `data-arvo-section` / `data-arvo-field` nitelikleri ArvoARC panelinin
 * canlı düzenleme bağlantılarıdır; kaldırılırsa panel bölümü seçemez.
 */

export default async function Home({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const [theme, products, discounts, curatedBest, dealItems, facets] =
    await Promise.all([
      getStorefrontTheme(),
      getStorefrontProducts(200),
      getStorefrontDiscounts(),
      /*
      Çok satanlar ArvoARC’taki "Çok Satanlar" koleksiyonundan gelir.
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
      /* Kapaktaki kanıt satırının ürün sayısı buradan: katalog
         listesi ilk 200 ile sınırlı ve onu saymak kataloğu
         olduğundan küçük gösteriyordu ("200+" yazarken 3.407 ürün
         vardı). */
      getStorefrontFacets(),
    ]);

  const coupon = discounts.find((discount) => discount.code);

  // Tükenmiş ürün ana sayfada gösterilmez: müşteriyi satın
  // alamayacağı bir sayfaya götürmek en pahalı terk noktasıdır.
  const inStock = products.filter((product) => product.available !== false);

  const deals = dealItems.filter((product) => product.available !== false);

  /*
    Koleksiyon boşsa ArvoARC’ta işaretlenmiş ürünlere düşülür.
    Katalog sırasına asla düşülmez.
  */
  const curated = curatedBest.filter((product) => product.available !== false);
  const flagged = inStock.filter((product) => product.bestSeller);
  const best = (curated.length > 0 ? curated : flagged).slice(0, 10);

  /* Beş değil on: bölüm artık yatay raf ve beş kart rafın
     kaydırılacak bir devamı olduğunu söylemiyor — şerit ekranda
     bitiyor, ok çıkmıyor, müşteri kaydırmayı denemiyor. */
  const fresh = inStock.slice(0, 10);

  /*
    Sonuç vermeyen terimler gösterilmiyor: müşteri tıklayıp boş
    sayfayla karşılaşmasın.
  */
  const searchTerms = await getPopularSearches();
  // Düzen (layout) zaten okuyor; cache ile aynı istekte tekrar sorgu yok.
  const shippingBadge = shippingTerms(await getSalesRules()).badge;

  /*
    Kategori kartları artık kendi verisini taşıyor: ürün sayısı ve
    içeriden üç gerçek ürün (lib/kategori-vitrini). Dört çağrı
    paralel ve rota önbellekli; kategori sayfasının kullandığı
    sorgunun aynısı, yani karttaki sayı ile sayfadaki sayı
    birbirini tutuyor.

    `siteUrl` kategori şemasının tam adresleri için; ana sayfanın
    `ItemList`i yoktu (bkz. lib/seo → kategoriListesiSchema).
  */
  const [categories, siteUrl] = await Promise.all([
    getKategoriVitrinleri(),
    vitrinAdresi(),
  ]);

  return (
    <main className="shell">
      <ThemePreviewBridge />

      <Hero theme={theme} />

      {/*
        Arama, kupon ve güvence tek panelde. Önceden iki ayrı bant
        (güvence şeridi + arama/kupon) masaüstünde ~230px, mobilde
        ~460px — ekranın yarısından fazlası — ürünlerden önce yer
        kaplıyordu. Hiçbir bilgi silinmedi; güvence hâlâ hero'dan
        hemen sonra.
      */}
      <section
        className="panel panel-tight utility"
        aria-label="Arama, kampanya ve alışveriş güvencesi"
      >
        <div className="utility-row">
          <div className="utility-search">
            <SearchOverlay terms={searchTerms} />
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
                {/*
                  KOŞUL BURADA DA YAZIYOR.

                  Kod iki yerde duyuruluyor (bu şerit ve kampanya
                  bandı) ve koşul yalnızca birinde yazsaydı,
                  müşterinin gördüğü yere bağlı olarak farklı bir
                  söz vermiş olurduk. Metin panelden geliyor:
                  "Diğer indirimlerle birleştirilebilir" kutusu
                  işaretlenirse cümle kendiliğinden kalkıyor.
                */}
                <small>
                  {coupon.combinable
                    ? "Kodu sepette uygulayın"
                    : "Kodu sepette uygulayın · indirimdeki ürünlerde geçerli değildir"}
                </small>
              </div>
              <CouponCopy code={coupon.code} />
            </div>
          )}
        </div>

        <Perks shippingBadge={shippingBadge} urunSayisi={facets.total} />
      </section>

      {/* Fiyat birinci öncelik: indirimler en üstte. */}
      <Reveal>
        <ProductBlock
          title="İndirimdeki ürünler"
          note="Sınırlı stokla sunulan güncel fırsatlar."
          href="/koleksiyon/firsatlar"
          hrefLabel="Tüm fırsatlar"
          products={deals}
          /*
            TEK SATIR, YATAY KAYDIRMALI (18.10.2026).

            Izgarada on fırsat iki satıra yayılıyor ve ana sayfanın
            dikey uzunluğunu şişiriyordu; müşteri "indirimdekiler"i
            görmek için kaydırıyor, sonra kategorileri görmek için
            yine kaydırıyordu. Rafta on ürün tek satırda duruyor ve
            yanal kaydırma, listenin DEVAMI olduğunu kendiliğinden
            söylüyor — telefonda alıştığımız hareket bu.
          */
          rail
        />
      </Reveal>

      <Reveal>
        <CategoryStrip items={categories} siteUrl={siteUrl} />
      </Reveal>

      {/* Satış verisi yoksa bölüm hiç görünmez. Hiç satılmamış
          ürünü "çok satan" diye göstermek güveni zedeler. */}
      {/* Ana sayfadaki bütün ürün bölümleri yatay raf: aynı kartlar
          iki ayrı düzende durunca sayfa kendi içinde çelişiyordu.
          Izgara koleksiyon ve arama sayfalarında kalıyor — orada
          müşteri TARIYOR, burada göz geziniyor. */}
      <Reveal>
        <ProductBlock
          title="Çok satanlar"
          note="Müşterilerimizin en sık tercih ettiği ürünler."
          href="/koleksiyon/cok-satan-cilt-bakim-urunleri"
          hrefLabel="Tümünü gör"
          products={best}
          /*
            GRİ ZEMİN KALKTI (18.10.2026).

            Bölüm `panel-soft` ile gri zemindeydi; gerekçe sayfaya
            ritim vermekti ve ızgaraların ardı ardına geldiği eski
            düzende işe yarıyordu. Artık ritmi RAFLAR veriyor
            (indirimler ve bu bölüm yatay kaydırmalı) ve beyaz bir
            sayfanın ortasında tek bir gri kutu, ritim değil kesinti
            oluyordu: aynı kartlar iki bölümde iki ayrı zemin
            üzerinde duruyordu.
          */
          rail
        />
      </Reveal>

      {/* Başlıksız kampanya bloğu çizilmiyor: varsayılan metin
          ArvoCulture'ın ARVO10 kuponuydu, artık boş. Boş bir
          kampanya paneli müşteriye anlamsız bir kutu gösterirdi. */}
      {theme.show_campaign && theme.campaign_title && (
        <Reveal>
          <section data-arvo-section="campaign" className="panel promo">
            {theme.campaign_image_url && (
              <Image
                unoptimized={!canOptimizeImage(theme.campaign_image_url)}
                src={theme.campaign_image_url}
                alt=""
                width={1600}
                height={600}
                sizes="(max-width: 1600px) 100vw, 1600px"
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

              {/*
                Kampanya koşulu. Kural ArvoARC'ta indirim kaydının
                `combinable` alanında duruyor ve panelde bir kutusu
                var; buraya elle yazılsaydı kutu değiştiğinde sayfa
                yalan söylerdi.
              */}
              {coupon && !coupon.combinable && (
                <p className="promo-kosul">
                  İndirimdeki ürünlerde geçerli değildir.
                </p>
              )}

              {/*
                KUPON VE DÜĞME AYNI SATIRDA.

                İkisi alt alta duruyordu: solda iki küçük blok, sağda
                dev bir filigran ve ortada boşluk — bant dengesizdi ve
                asıl eylem ("Alışverişe başla") üçüncü sırada,
                köşede kalıyordu. Yan yana gelince satır bandın
                tabanını kuruyor; dar ekranda alt alta iniyorlar.

                Sıra kupon → düğme: müşteri önce kodu alıyor, sonra
                alışverişe başlıyor. Ters sırada kodu kopyalamadan
                tıklayıp çıkanlar olurdu.
              */}
              <div className="promo-actions">
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
            </div>
          </section>
        </Reveal>
      )}

      {theme.show_featured && (
        <Reveal>
          <div data-arvo-section="featured">
            <ProductBlock
              title={theme.featured_title}
              eyebrow={theme.featured_eyebrow}
              href="/koleksiyon/tumu"
              hrefLabel="Tüm ürünler"
              products={fresh}
              /*
                RAF OLDU (18.10.2026).

                Ana sayfadaki beş ürün bölümünün dördü rafa geçtikten
                sonra TEK IZGARA bu kaldı ve gerekçe tersine döndü:
                raf eskiden "ızgara tekrarını kırmak" içindi, şimdi
                ızgara şeridin ritmini kırıyor. Aynı kartlar iki ayrı
                düzende duruyordu.
              */
              rail
            />
          </div>
        </Reveal>
      )}

      {/*
        "SON GEZDİKLERİNİZ" ANA SAYFADAN KALDIRILDI (18.10.2026).

        Raf ürün sayfasında DURUYOR (urun/[slug]) ve asıl işini
        orada yapıyor: müşteri bir ürüne bakarken az önce baktığı
        ürünlere dönebiliyor. Ana sayfada ise dört rafın altında,
        sayfanın sonunda duruyordu ve oraya kadar inen müşteri
        zaten gezinmeyi seçmiş oluyordu.

        Sayfada kişiselleştirme bitmiyor: "Senin için" rafı aynı
        sinyalden (gezilen ürünler + favoriler) besleniyor ve
        gezilenlerin KENDİSİNİ değil benzerlerini gösteriyor —
        yani ana sayfada müşteriye yeni bir şey açıyor, aynı
        kartları tekrar etmiyor.
      */}

      {/*
        Vitrinin müşteriye göre değişen parçası. Yeni ziyaretçide
        hiç görünmüyor; gösterecek bir şey olmadan "senin için"
        demek süs olurdu.
      */}
      <Reveal>
        <ForYou />
      </Reveal>

      <Reveal>
        <HelpStrip />
      </Reveal>
    </main>
  );
}

function Hero({ theme }: { theme: StorefrontTheme }) {
  return (
    <section data-arvo-section="hero" className="panel hero">
      {theme.hero_image_url && (
        <Image
          /*
            İzinli adreste görsel optimize ediliyor: telefona 1920px'lik
            dosya yerine ekran genişliğinde WebP gidiyor (bkz.
            lib/image-hosts.ts). Sayfanın en büyük öğesi bu görsel;
            yavaş bağlantıda açılış süresini o belirliyor.
          */
          unoptimized={!canOptimizeImage(theme.hero_image_url)}
          src={theme.hero_image_url}
          alt=""
          width={2000}
          height={1000}
          sizes="(max-width: 1600px) 100vw, 1600px"
          preload
          fetchPriority="high"
        />
      )}
      {/*
        Karartma katmanı. Metnin okunabilirliği görsele bağlı
        kalmasın; panelden farklı bir fotoğraf yüklendiğinde de
        başlık okunur olsun.
      */}
      <span className="hero-veil" aria-hidden="true" />

      <div className="hero-body">
        {/* Sınıf şart: `.hero-eyebrow` üst etiketin harf aralığını ve
            yanındaki altın çizgiyi taşıyor. */}
        <p className="hero-eyebrow" data-arvo-field="hero_eyebrow">
          {theme.hero_eyebrow}
        </p>
        <h1 data-arvo-field="hero_title">
          {theme.hero_title}{" "}
          <span data-arvo-field="hero_emphasis">{theme.hero_emphasis}</span>
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
          {/* İkinci düğme ancak etiketi VE adresi varsa çiziliyor.
              Varsayılanları "Bakımı keşfet" → /koleksiyon/bakim idi;
              o koleksiyon başka mağazada yok, yani düğme 404'e
              çıkıyordu. */}
          {theme.secondary_cta_label && theme.secondary_cta_href && (
            <Link
              data-arvo-field="secondary_cta_label"
              href={theme.secondary_cta_href}
            >
              {theme.secondary_cta_label}
            </Link>
          )}
        </div>

        {/*
          KANIT SATIRI BURADAN KALDIRILDI (18.10.2026).

          Kapağa üç rakam konmuştu ama hemen altındaki panelde
          aynı şeyler zaten yazıyordu: "14 gün iade" ve "3D
          Secure" iki kez, aralarında yüz piksel. Bir ekranda aynı
          şeyi iki kez söylemek güven vermiyor, dikkat dağıtıyor.

          Rakamlar aşağıdaki panele taşındı (components/home-blocks
          → Perks): oradaki maddeler BAĞLANTILI, yani müşteri
          "14 gün iade" yazısına dokunup koşulları okuyabiliyor.
          Kapakta yalnızca fotoğraf, başlık ve tek bir eylem
          kalıyor.
        */}

        {/*
          Kategori kısayolları. Hero’nun altında, kaydırmadan
          erişilebilir. Müşteri "nereden başlayacağım" sorusuna
          ilk ekranda yanıt buluyor.
        */}
        {/* Hero ayrı bir bileşen; sabit listeyi doğrudan okur. */}
        <nav className="hero-jump" aria-label="Kategoriler">
          {CATEGORIES.map((category) => (
            <Link key={category.href} href={category.href}>
              {category.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
