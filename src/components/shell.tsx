import { Newsreader, Archivo } from "next/font/google";
import "@/app/globals.css";
import { Masthead } from "@/components/masthead";
import { Colophon } from "@/components/colophon";
import { JsonLd } from "@/components/json-ld";
import { organizationSchema } from "@/lib/schema";
import { t } from "@/lib/dictionary";
import type { Locale } from "@/lib/site";

const newsreader = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-newsreader",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  variable: "--font-archivo",
  display: "swap",
});

export function Shell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={locale} className={`${newsreader.variable} ${archivo.variable}`}>
      <body>
        <a className="skip" href="#main">
          {t(locale).skip}
        </a>
        <Masthead locale={locale} />
        <main id="main">{children}</main>
        <Colophon locale={locale} />
        <JsonLd data={organizationSchema()} />
      </body>
    </html>
  );
}
