import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import "./components.css";
import "./layout.css";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { getStorefrontCollections } from "@/lib/collections";
import { JsonLd } from "@/components/json-ld";
import { storeSchema } from "@/lib/seo";
import { env } from "@/lib/env";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  // Yedek font metrikleriyle eşleştirilir; Poppins yüklenirken
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
 * güvenli alan boşlukları CSS'te `env(safe-area-inset-*)` ile
 * verilir.
 */
export const viewport: Viewport = {
  themeColor: "#10120f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const theme = await getStorefrontTheme();
  const name = theme.store_name ?? "ArvoCulture";
  return {
    // metadataBase olmadan canonical ve OG adresleri göreli kalır;
    // sosyal paylaşımlarda önizleme kırık gelir.
    metadataBase: new URL(env.siteUrl),
    title: {
      default: `${name} — Seçtiğin Şey Sensin`,
      template: `%s | ${name}`,
    },
    description: theme.hero_description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: name,
      url: env.siteUrl,
      title: `${name} — Seçtiğin Şey Sensin`,
      description: theme.hero_description,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    icons: theme.favicon_url ? { icon: theme.favicon_url } : undefined,
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, discounts, collections] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontDiscounts(),
    getStorefrontCollections(),
  ]);
  const style = {
    "--ink": theme.primary_color,
    "--acid": theme.accent_color,
    "--paper": theme.background_color,
    "--products-per-row": theme.products_per_row,
  } as CSSProperties;
  return (
    <html lang="tr">
      <body
        style={style}
        className={`${poppins.variable} theme-${theme.typography} hero-${theme.hero_style} header-${theme.header_layout} ${theme.sticky_header ? "header-sticky" : "header-static"} cards-${theme.product_card_style} ratio-${theme.product_image_ratio}`}
      >
        <CartProvider discounts={discounts}>
          <Header theme={theme} collections={collections} />
          {children}
          <footer>
            <div className="footer-top">
              <div className="footer-brand">
                <Image
                  className="footer-logo"
                  src="/arvoculture-logo-transparent.png"
                  alt={theme.store_name ?? "ArvoCulture"}
                  width={320}
                  height={39}
                />
                <p>{theme.footer_tagline}</p>

                {/*
                  Güven rozetleri. Logo dosyaları public/ altına
                  eklenmelidir; yoksa yalnızca metin görünür ve
                  sayfa bozulmaz.
                */}
                <div className="footer-badges">
                  <span className="badge-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/rozet/etbis.png" alt="" width={34} height={34} />
                    <small>
                      ETBİS&apos;e kayıtlıdır
                      <br />
                      Elektronik Ticaret Bilgi Sistemi
                    </small>
                  </span>
                  <span className="badge-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/rozet/lr.png" alt="" width={34} height={34} />
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
                  <strong>ArvoCulture</strong>
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
                  <Link href="/kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</Link>
                  <Link href="/gizlilik">Gizlilik ve Çerez Politikası</Link>
                  <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
                  <Link href="/yasal-bildirim">Yasal Bildirim</Link>
                  <Link href="/ticari-elektronik-ileti">
                    Ticari Elektronik İleti
                  </Link>
                </div>
              </div>
            </div>

            {/*
              Ödeme altyapısı PayTR. Kart markalarının logoları
              tescilli olduğu için elle çizilmiyor; PayTR panelinden
              indirilen resmi logo bandı kullanılıyor.
              Dosya yoksa yalnızca metin görünür, sayfa bozulmaz.
            */}
            <div className="footer-pay">
              <div className="pay-provider">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/rozet/paytr.png"
                  alt="PayTR"
                  width={84}
                  height={26}
                />
                <small>
                  Ödemeler PayTR altyapısı üzerinden 3D Secure ile
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
                    <img src={`/rozet/${card.file}.png`} alt={card.label} />
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-legal">
              <small>
                © 2026 {theme.store_name ?? "ArvoCulture"}. Tüm hakları
                saklıdır.
              </small>
              <small>Bir ArvoCulture Group markasıdır.</small>
            </div>
          </footer>
          {/* Mobil alt gezinme; masaüstünde CSS ile gizlenir. */}
          <BottomNav />

          <JsonLd data={storeSchema()} />
        </CartProvider>
      </body>
    </html>
  );
}
