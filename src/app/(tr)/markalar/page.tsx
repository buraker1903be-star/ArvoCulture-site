import type { Metadata } from "next";
import { BrandsView } from "@/components/views/brands";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "tr" as const;
const copy = dict[locale].brands;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("brands", locale),
  openGraph: {
    url: alternatesFor("brands", locale).canonical,
    description: copy.description,
    locale: "tr_TR",
  },
};

export default function Page() {
  return <BrandsView locale={locale} />;
}
