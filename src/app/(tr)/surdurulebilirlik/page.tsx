import type { Metadata } from "next";
import { SustainabilityView } from "@/components/views/sustainability";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "tr" as const;
const copy = dict[locale].sustainability;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("sustainability", locale),
  openGraph: {
    url: alternatesFor("sustainability", locale).canonical,
    description: copy.description,
    locale: "tr_TR",
  },
};

export default function Page() {
  return <SustainabilityView locale={locale} />;
}
