import type { Metadata } from "next";
import { organization, siteUrl, type Locale } from "@/lib/site";
import { dict } from "@/lib/dictionary";

export function rootMetadata(locale: Locale): Metadata {
  const copy = dict[locale].home;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: copy.title,
      template: `%s | ${organization.name}`,
    },
    description: copy.description,
    openGraph: {
      type: "website",
      siteName: organization.name,
      locale: locale === "tr" ? "tr_TR" : "en_US",
      title: copy.title,
      description: copy.description,
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
  };
}
