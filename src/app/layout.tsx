import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import "./dynamic.css";
import { CartProvider } from "@/components/cart";
import { Header } from "@/components/header";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { getStorefrontDiscounts } from "@/lib/discounts";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});
export async function generateMetadata(): Promise<Metadata> {
  const theme = await getStorefrontTheme();
  return {
    title: {
      default: `${theme.store_name ?? "ArvoCulture"} — Seçtiğin Şey Sensin`,
      template: `%s | ${theme.store_name ?? "ArvoCulture"}`,
    },
    description: theme.hero_description,
    icons: theme.favicon_url ? { icon: theme.favicon_url } : undefined,
  };
}
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, discounts] = await Promise.all([
    getStorefrontTheme(),
    getStorefrontDiscounts(),
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
          <Header theme={theme} />
          {children}
          <footer>
            <div className="logo light">
              {theme.logo_url ? (
                <Image
                  src={theme.logo_url}
                  alt={theme.store_name ?? "ArvoCulture"}
                  width={220}
                  height={60}
                />
              ) : (
                <>
                  <b>ARVO</b>
                  <i>CULTURE</i>
                </>
              )}
            </div>
            <p>{theme.footer_tagline}</p>
            <div className="footer-links">
              <Link href="/hakkimizda">Hakkımızda</Link>
              <Link href="/iletisim">İletişim</Link>
              <Link href="/sss">SSS</Link>
              <Link href="/teslimat-iade">Teslimat & İade</Link>
              <Link href="/gizlilik">Gizlilik</Link>
              <Link href="/kullanim-kosullari">Kullanım Koşulları</Link>
              {theme.instagram_url && (
                <a href={theme.instagram_url}>Instagram</a>
              )}
              {theme.facebook_url && <a href={theme.facebook_url}>Facebook</a>}
            </div>
            <small>
              © 2026 {theme.store_name ?? "ArvoCulture"}. Tüm hakları saklıdır.
            </small>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
