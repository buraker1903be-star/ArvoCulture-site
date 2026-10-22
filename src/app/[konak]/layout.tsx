import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";
import "../components.css";
import "../layout.css";
import { CartProvider } from "@/components/cart";
import { FavouritesProvider } from "@/components/favourites";
import { Header } from "@/components/header";
import { Altbilgi } from "@/components/altbilgi";
import { getPopularSearches } from "@/lib/popular-searches";
import { BottomNav } from "@/components/bottom-nav";
import { AppShell } from "@/components/app-shell";
import { ZiyaretKaydi } from "@/components/ziyaret-kaydi";
import { ParaBirimiSaglayici } from "@/components/para-birimi";
import { getBlockedProducts } from "@/lib/engelli-urunler";
import { paraBirimiOnYukleyici, yurtdisiGizlemeCss } from "@/lib/yurtdisi-gizleme";
import { PageTransition } from "@/components/page-transition";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { getStoreStage } from "@/lib/store-stage";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { getSalesRules } from "@/lib/store-settings";
import { getStorefrontCollections } from "@/lib/collections";
import { JsonLd } from "@/components/json-ld";
import { storeSchema, websiteSchema } from "@/lib/seo";
import { getStoreIdentity } from "@/lib/seller-source";
import { env } from "@/lib/env";
import { konagiAyarla, vitrinAdresi } from "@/lib/konak";

/**
 * İki font, iki iş.
 *
 * Poppins tek başına her yeri taşıyordu. Geometrik ve yuvarlak bir
 * yazı karakteri; samimi görünüyor ama başlıkta da fiyatta da aynı
 * sesle konuştuğu için sayfada hiyerarşi bırakmıyordu.
 *
 * Şimdi başlıklar Cormorant Garamond ile yazılıyor: ince/kalın
 * geçişleri belirgin, klasik bir serif. Lüks hissi buradan gelir.
 * Gövde ve arayüz Inter’e geçti: karaktersiz olması bilinçli, küçük
 * puntoda okunaklı ve serifin önüne geçmiyor.
 *
 * İkisinde de `latin-ext` şart: ı, İ, ğ, ş, ç Türkçe metinde bu
 * altkümeden gelir.
 */
/*
  Başlık yazısı: yalnızca kullanılan ağırlıklar (400, 500). 600/700
  hiçbir yerde kullanılmıyordu.
*/
const display = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-display",
  display: "swap",
});

/*
  Gerçek italik, ayrı ve önceden yüklenmeyen bir tanımda. İtalik yokken
  hero'daki "senin hikâyen." ve arama alanları tarayıcının eğdiği sahte
  italikle çiziliyordu. Aynı tanıma eklenince next/font iki italik
  dosyasını (73 KB) italiğin hiç görünmediği sayfalarda da önceden
  yüklüyor ve ürün görseliyle bant genişliği için yarışıyordu. Burada
  yalnızca italik metin çizilen sayfada iniyor (bkz. --font-display-italic).
*/
const displayItalic = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  style: ["italic"],
  variable: "--font-display-italic",
  display: "swap",
  preload: false,
});

const sans = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
  // Yedek font metrikleriyle eşleştirilir; Inter yüklenirken
  // sayfanın zıplamasını (layout shift) engeller.
  adjustFontFallback: true,
});
/**
 * Görüntü alanı ve tarayıcı rengi.
 *
 * `themeColor` telefonda durum çubuğunu markanın rengine boyar;
 * uygulama olarak kurulduğunda fark belirgindir.
 *
 * `viewportFit: "cover"` çentikli ekranlarda tam alanı kullanır;
 * güvenli alan boşlukları CSS’te `env(safe-area-inset-*)` ile
 * verilir.
 */
export const viewport: Viewport = {
  themeColor: "#10120f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/*
  KONAK YOLDAN GELİYOR ve veri katmanına BURADA bırakılıyor.

  Middleware her isteği `/<konak>/...` olarak yeniden yazıyor
  (src/middleware.ts). Kök düzen ve üstveri, alt ağaçtaki her
  şeyden önce çalıştığı için adresi bir kez burada bırakmak
  yetiyor; `vitrinKonagi()` artık `headers()` çağırmıyor ve sayfa
  statik üretilebiliyor (lib/konak).

  Kendi `generateMetadata`'sı olan sayfalar da ayrıca bırakıyor:
  üstveri işlevleri düzenle AYNI ANDA çalışabiliyor ve sıraya
  güvenmek, bir mağazanın sayfasına başkasının verisini
  getirebilirdi.
*/
/*
  ADRESLER ÖNCEDEN ÜRETİLMİYOR, AMA ÜRETİLDİKTEN SONRA SAKLANIYOR.

  Boş liste dönmek, Next'e "bu segmentin değerlerini derlemede
  bilmiyorum ama istendiğinde üret ve sakla" demek. Olmadığında
  `[konak]` altındaki HER sayfa tamamen dinamik sayılıyordu:
  hukuki sayfalar, hakkımızda, SSS — hepsi her istekte yeniden
  çiziliyordu. Ürün sayfasındaki `generateStaticParams`'ın gerekçesi
  de aynı (urun/[slug]/page.tsx).

  Kiracı sayısı derlemede bilinmiyor zaten: mağaza panelden
  alan adı bağladığı an açılabilmeli, yeni bir dağıtım
  beklemeden.
*/
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ konak: string }>;
}): Promise<Metadata> {
  konagiAyarla((await params).konak);
  const adres = await vitrinAdresi();
  const theme = await getStorefrontTheme();
  const name = theme.store_name ?? "Mağaza";

  /*
    BAŞLIK YALNIZCA MAĞAZA ADI.

    Burada "Seçtiğin Şey Sensin" sabitti — ArvoCulture'ın sloganı.
    Her kiracının sekme başlığında ve paylaşım önizlemesinde bizim
    cümlemiz görünüyordu.

    Temadaki bir alandan slogan ÜRETİLMİYOR: `hero_eyebrow` bir
    künye satırı, slogan değil ("ArvoCulture — ARVOCULTURE ·
    APPAREL & BEAUTY" çıkıyordu, denendi). Mağazaya özel bir slogan
    alanı yok; olmayan bir alanı zorlamaktansa adı tek başına
    yazmak doğru.
  */
  const baslik = name;

  return {
    // metadataBase olmadan canonical ve OG adresleri göreli kalır;
    // sosyal paylaşımlarda önizleme kırık gelir.
    metadataBase: new URL(adres),
    title: {
      default: baslik,
      template: `%s | ${name}`,
    },
    description: theme.hero_description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: name,
      url: adres,
      title: baslik,
      description: theme.hero_description,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    /*
      iOS, manifest'i kurulum için okumuyor. "Ana Ekrana Ekle"
      sonrası tam ekran açılması, durum çubuğunun koyu renkte
      kalması ve doğru ikonun kullanılması bu üç satıra bağlı.
    */
    appleWebApp: {
      capable: true,
      title: name,
      /*
        "default" seçildi, "black-translucent" değil. Saydam durum
        çubuğu içeriğin altından geçer ve düzeni her cihazda elle
        telafi etmek gerekir; yanlış hesaplanan tek bir boşluk,
        başlığı saatin altında bırakır. Burada durum çubuğu kendi
        alanında kalıyor ve fildişi zeminle uyumlu görünüyor.
      */
      statusBarStyle: "default",
    },
    icons: theme.favicon_url ? { icon: theme.favicon_url } : undefined,
  };
}
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ konak: string }>;
}) {
  /* Adres veri katmanına BURADA bırakılıyor; gerekçe
     generateMetadata'nın üstünde. */
  konagiAyarla((await params).konak);

  const [
    theme,
    discounts,
    collections,
    stage,
    salesRules,
    kimlik,
    adres,
    aramaTerimleri,
    engelliUrunler,
  ] =
    await Promise.all([
      getStorefrontTheme(),
      getStorefrontDiscounts(),
      getStorefrontCollections(),
      getStoreStage(),
      getSalesRules(),
      /* Yapısal verinin kimliği satıcı kaydından; önceden
         lib/seller.ts sabitinden geliyordu ve her kiracının
         sayfası "bu işletme ArvoCulture'dır" diyordu. */
      getStoreIdentity(),
      vitrinAdresi(),
      /* Başlıktaki büyüteç artık arama katmanını açıyor ve katmanın
         boş durumunda sık aranan terimler görünüyor; liste her
         sayfada gerekli. `cache` ile ana sayfada ikinci kez
         sorgulanmıyor. */
      getPopularSearches(),
      /* Yurtdışına gönderilemeyen ürünler: yurtdışı modunda
         gizlenecek kartların listesi (lib/engelli-urunler). */
      getBlockedProducts(),
    ]);

  /*
    YURTDIŞI MODU KAPALIYSA NE BETİK NE DE KURAL BASILIYOR. Kapalı bir
    mağazada `data-para` hiç kurulmasa da sayfa doğru çalışır; gereksiz
    bir satır içi betik her sayfanın boyanmasını bekletir.
  */
  const yurtdisiAcik = salesRules.internationalEnabled && (salesRules.usdRate ?? 0) > 0;
  const gizlemeCss = yurtdisiAcik ? yurtdisiGizlemeCss(engelliUrunler) : null;
  /*
    Abonelik ödenmediğinde mağaza kademe kademe kapanır; son kademede vitrin
    de kapanır (bkz. lib/store-stage.ts). Katalog, sepet ve ödeme hiç
    çizilmiyor: kapalı bir mağazada fiyat göstermek mesafeli satış açısından
    da yanlış olur.
  */
  if (stage === "closed") {
    return (
      <html lang="tr">
        <body className={`${sans.variable} ${display.variable} store-closed-body`}>
          <main className="store-closed">
            <h1>Mağazamız şu anda kapalı</h1>
            <p>Kısa süre içinde tekrar hizmetinizdeyiz. İlginiz için teşekkür ederiz.</p>
          </main>
        </body>
      </html>
    );
  }
  const style = {
    "--ink": theme.primary_color,
    "--acid": theme.accent_color,
    "--paper": theme.background_color,
    "--products-per-row": theme.products_per_row,
  } as CSSProperties;
  return (
    <html lang="tr">
      <head>
        {/*
          PARA BİRİMİ BOYAMADAN ÖNCE OKUNUYOR.

          Seçim localStorage'da ve sağlayıcı onu bir etkide okuyor,
          yani ilk boyamada sayfa TL modunda. Fiyat için bu kabul
          edilmiş bir bedel (bkz. components/para-birimi) ama ÜRÜN
          GİZLEMEK için değil: yurtdışı müşterisi gönderemeyeceğimiz
          ürünlerin bir an görünüp kaybolduğu bir sayfa görürdü.

          Bu yüzden `data-para` niteliği boyamadan önce, satır içi bir
          betikle konuyor; gizleme kuralı da aşağıda SUNUCUDA basılıyor
          (liste para biriminden bağımsız, yani rota önbelleğini
          bozmuyor). Betik okuyamazsa hiçbir şey yapmıyor: TL modunda
          kalmak, yanlış gizlemekten iyi.
        */}
        {yurtdisiAcik && (
          <script dangerouslySetInnerHTML={{ __html: paraBirimiOnYukleyici() }} />
        )}
        {gizlemeCss && (
          <style dangerouslySetInnerHTML={{ __html: gizlemeCss }} />
        )}
      </head>
      <body
        style={style}
        className={`${sans.variable} ${display.variable} ${displayItalic.variable} theme-${theme.typography} hero-${theme.hero_style} header-${theme.header_layout} ${theme.sticky_header ? "header-sticky" : "header-static"} cards-${theme.product_card_style} ratio-${theme.product_image_ratio} ${theme.show_badges ? "badges-on" : "badges-off"} ${theme.show_quick_add ? "quickadd-on" : "quickadd-off"} ${theme.show_vendor ? "vendor-on" : "vendor-off"}`}
      >
        {/*
          Favori listesi sayfanın her yerinden erişilebilir olmalı:
          favori düğmesi tüm ürün kartlarının içinde. Bağlantı
          bilgileri sunucudan aktarılıyor; üye müşteride liste
          hesaptan, misafirde tarayıcıdan beslenir.
        */}
        <FavouritesProvider
          supabaseUrl={env.supabaseUrl}
          supabaseKey={env.supabaseKey}
        >
          {/* Para birimi sepetin DIŞINDA değil İÇİNDE olamaz:
              sepet de fiyat yazıyor ve aynı seçimi kullanıyor. */}
          <ParaBirimiSaglayici salesRules={salesRules}>
          <CartProvider discounts={discounts} salesRules={salesRules}>
            <Header
              theme={theme}
              collections={collections}
              searchTerms={aramaTerimleri}
              /* Hesap çekmecesi için; bağlantı bilgileri sunucudan
                 aktarılıyor, NEXT_PUBLIC_ değişkenine bağımlılık
                 yok — /hesap sayfası da aynısını yapıyor. */
              supabaseUrl={env.supabaseUrl}
              supabaseKey={env.supabaseKey}
            />
            {/*
              Sayfa içeriği geçiş sarmalayıcısının içinde; başlık,
              alt çubuk ve altbilgi dışarıda kalıyor. Gezinirken
              yerinde duran çerçeve, hareket eden içerik — uygulama
              hissini veren ayrım bu.
            */}
            <PageTransition>{children}</PageTransition>
            <Altbilgi
              theme={{
                logo_url: theme.logo_url,
                store_name: theme.store_name,
                footer_tagline: theme.footer_tagline,
                instagram_url: theme.instagram_url,
              }}
              kimlik={{
                phone: kimlik.phone,
                phoneLink: kimlik.phoneLink,
                email: kimlik.email,
              }}
            />
            {/* Mobil alt gezinme; masaüstünde CSS ile gizlenir. */}
            <BottomNav />

            {/*
              Servis çalışanı kaydı, bağlantı durumu ve kurulum
              teklifi. Görsel olarak yalnızca gerektiğinde beliriyor.
            */}
            <AppShell />
            {/* Sayfa açılışı sayaca yazılıyor; konum Vercel'in
                kenar başlıklarından, kişisel veri saklanmıyor. */}
            <ZiyaretKaydi />

            {/*
              Mağaza kimliği ve site şeması her sayfada basılıyor:
              sabit @id sayesinde tekrar değil, aynı varlığa
              yapılan atıf oluyor.
            */}
            <JsonLd
              data={storeSchema({
                kimlik,
                siteUrl: adres,
                logoUrl: theme.logo_url ?? undefined,
                instagramUrl: theme.instagram_url ?? undefined,
              })}
            />
            <JsonLd
              data={websiteSchema({
                /* Marka adı temadan: mağaza adını panelden
                   değiştirdiğinde yapısal veri de onunla gidiyor. */
                brand: kimlik.brand || theme.store_name || "Mağaza",
                siteUrl: adres,
              })}
            />
          </CartProvider>
          </ParaBirimiSaglayici>
        </FavouritesProvider>
      </body>
    </html>
  );
}
