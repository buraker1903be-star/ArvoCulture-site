import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "../globals.css";
import "../components.css";
import "../layout.css";
import { CartProvider } from "@/components/cart";
import { FavouritesProvider } from "@/components/favourites";
import { Header } from "@/components/header";
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
import { StoreLogo } from "@/components/store-logo";

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
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: paraBirimiOnYukleyici() }}
          />
        )}
        {gizlemeCss && (
          <style
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: gizlemeCss }}
          />
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
            <footer className="site-footer">
              <div className="footer-top">
                <div className="footer-brand">
                  <StoreLogo
                    className="footer-logo"
                    logoUrl={theme.logo_url}
                    storeName={theme.store_name ?? "Mağaza"}
                  />
                  <p>{theme.footer_tagline}</p>

                  {/*
                    İLETİŞİM ALTBİLGİDE.

                    Altbilgide mağazaya ulaşmanın hiçbir yolu yoktu;
                    "İletişim" bağlantısı vardı ama bir tık daha
                    uzaktaydı. Numara ve e-posta SATICI KAYDINDAN
                    geliyor (getStoreIdentity) — sayfaya yazılmıyor,
                    yoksa ikinci bir kiracının altbilgisinde
                    ArvoCulture'ın hattı görünürdü. Alan boşsa satır
                    hiç çizilmiyor.
                  */}
                  {(kimlik.phone || kimlik.email) && (
                    <p className="footer-contact">
                      {/*
                        Numara WHATSAPP'a bağlı (kimlik.phoneLink).
                        `tel:` masaüstünde çoğu tarayıcıda hiçbir
                        şey yapmıyordu; mağazanın hattı zaten
                        WhatsApp hattı ve sohbet, müşterinin sipariş
                        numarasını yazabildiği, yanıtın kayda
                        geçtiği tek kanal. WhatsApp numarası
                        tanımlı değilse bağlantı yine `tel:`.
                      */}
                      {kimlik.phone && kimlik.phoneLink && (
                        <a
                          href={kimlik.phoneLink}
                          {...(kimlik.phoneLink.startsWith("http")
                            ? { target: "_blank", rel: "noopener noreferrer" }
                            : {})}
                        >
                          {kimlik.phone}
                        </a>
                      )}
                      {kimlik.email && (
                        <a href={`mailto:${kimlik.email}`}>{kimlik.email}</a>
                      )}
                    </p>
                  )}

                  {/*
                  Güven rozetleri. Logo dosyaları public/ altına
                  eklenmelidir; yoksa yalnızca metin görünür ve
                  sayfa bozulmaz.
                */}
                  <div className="footer-badges">
                    <span className="badge-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/rozet/etbis.png"
                        loading="lazy"
                        decoding="async"
                        alt=""
                        width={34}
                        height={34}
                      />
                      <small>
                        ETBİS’e kayıtlıdır
                        <br />
                        Elektronik Ticaret Bilgi Sistemi
                      </small>
                    </span>
                    <span className="badge-card">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/rozet/lr.png"
                        loading="lazy"
                        decoding="async"
                        alt=""
                        width={34}
                        height={34}
                      />
                      <small>
                        LR Health &amp; Beauty
                        <br />
                        bağımsız iş ortağıdır
                      </small>
                    </span>
                  </div>
                </div>

                <div className="footer-links">
                  <div className="footer-link-group">
                    {/* Mağazanın kendi adı: sabit marka, çok mağazalı
                        vitrinde başka bir mağazanın altbilgisine
                        ArvoCulture yazıyordu. */}
                    <strong>{theme.store_name ?? "Mağaza"}</strong>
                    <Link href="/hakkimizda">Hakkımızda</Link>
                    <Link href="/iletisim">İletişim</Link>
                    <Link href="/sss">Sık Sorulan Sorular</Link>
                    {theme.instagram_url && (
                      <a href={theme.instagram_url}>Instagram</a>
                    )}
                  </div>
                  <div className="footer-link-group">
                    <strong>Müşteri Hizmetleri</strong>
                    <Link href="/teslimat">Teslimat Politikası</Link>
                    <Link href="/iptal-iade">İptal ve İade</Link>
                    <Link href="/on-bilgilendirme-formu">
                      Ön Bilgilendirme Formu
                    </Link>
                    <Link href="/mesafeli-satis-sozlesmesi">
                      Mesafeli Satış Sözleşmesi
                    </Link>
                  </div>
                  <div className="footer-link-group">
                    <strong>Yasal</strong>
                    <Link href="/kvkk-aydinlatma-metni">
                      KVKK Aydınlatma Metni
                    </Link>
                    <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link>
                    <Link href="/uyelik-sozlesmesi">Üyelik Sözleşmesi</Link>
                    <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
                    <Link href="/yasal-bildirim">Yasal Bildirim</Link>
                    <Link href="/ticari-elektronik-ileti">
                      Ticari Elektronik İleti
                    </Link>
                    {/* Silme talebinin yolu altbilgiden de görünür:
                        KVKK metninde hak yazıyordu ama başvurunun
                        nasıl yapılacağı hiçbir yerde yoktu. Sosyal
                        giriş sağlayıcıları da bu adresi denetliyor. */}
                    <Link href="/veri-silme">Hesap ve Veri Silme</Link>
                  </div>
                </div>
              </div>

              {/*
              Sağlayıcı logosu YOK. Önceden PayTR'ın resmi logo bandı
              duruyordu; ödeme sağlayıcısı artık siparişe göre
              seçiliyor (checkout-form.tsx), yani alt bilgide tek bir
              sağlayıcının markasını göstermek yanıltıcı. Kart markası
              logoları tescilli olduğu için hâlâ elle çizilmiyor,
              resmi dosyalardan geliyor; dosya yoksa sayfa bozulmaz.
            */}
              {/* Alt bilgi görselleri ekranın dışında: sayfa açılırken
                  CSS ve ürün görseliyle bant genişliği paylaşmasınlar. */}
              <div className="footer-pay">
                <div className="pay-provider">
                  <small>
                    Ödemeler 3D Secure korumalı ödeme altyapısı üzerinden
                    alınır. Kart bilgileriniz mağazamıza iletilmez.
                  </small>
                </div>

                <ul className="pay-cards" aria-label="Kabul edilen kartlar">
                  {[
                    { file: "visa", label: "Visa" },
                    { file: "mastercard", label: "Mastercard" },
                    { file: "troy", label: "Troy" },
                    { file: "maestro", label: "Maestro" },
                    { file: "americanexpress", label: "American Express" },
                  ].map((card) => (
                    <li key={card.file}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/rozet/${card.file}.png`}
                        alt={card.label}
                        loading="lazy"
                        decoding="async"
                      />
                    </li>
                  ))}
                </ul>
              </div>

              {/*
                KAPANIŞ İMZASI.

                Altbilginin en altında, mağazanın adı çok büyük ve
                çok soluk. Hiçbir bilgi taşımıyor — süs değil,
                NOKTA: sayfanın bittiğini söyleyen şey. Altbilgi
                bunsuz bir bağlantı listesi gibi bitiyordu.

                Ekran okuyucudan gizli; ad zaten logoda ve telif
                satırında var, üçüncü kez okunması gerekmiyor.
              */}
              <span className="footer-mark" aria-hidden="true">
                {/*
                  İmza MAĞAZANIN LOGOSU, adı değil: düz sansla
                  yazılmış bir ad, markanın kendi harf biçimini
                  taşımıyordu — ArvoCulture'ın wordmark'ında "ARVO"
                  kalın, "CULTURE" ince ve italik, ve imzanın
                  tamamı o ayrımdan doğuyor.

                  StoreLogo logosu olmayan kiracıda mağaza ADINA
                  düşüyor; yani ikinci bir mağaza logosuz da olsa
                  imza çiziliyor ve kimsenin logosu başkasının
                  altbilgisinde görünmüyor.
                */}
                <StoreLogo
                  logoUrl={theme.logo_url}
                  storeName={theme.store_name ?? "Mağaza"}
                />
              </span>

              <div className="footer-legal">
                <small>
                  © 2026 {theme.store_name ?? "Mağaza"}. Tüm hakları
                  saklıdır.
                </small>
                {/* Grup künyesi yalnızca ArvoCulture'ın kendi
                    mağazasında: başka bir kiracının altbilgisinde
                    yabancı bir grup adı görünmemeli. */}
                {theme.store_name === "ArvoCulture" && (
                  <small>Bir ArvoCulture Group markasıdır.</small>
                )}

                {/*
                  Tasarım künyesi. Logo dosyası kaynağındaki
                  1920×1080’lik tuvalden içerik sınırına kırpıldı;
                  olduğu gibi kullanılsaydı altında ve üstünde
                  312’şer piksel boşlukla gelirdi.

                  Dış siteye açıldığı için rel="noreferrer" var;
                  künye bağlantısının referrer taşımasına gerek yok.
                */}
                <a
                  className="footer-credit"
                  href="https://arvo-os.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Design by</span>
                  <Image
                    src="/arvoos-logo.png"
                    alt="ARVOOS"
                    width={232}
                    height={44}
                  />
                </a>
              </div>
            </footer>
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
