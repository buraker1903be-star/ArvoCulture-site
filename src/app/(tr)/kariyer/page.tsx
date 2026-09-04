import type { Metadata } from "next";
import { CareersView } from "@/components/views/careers";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "tr" as const;
const copy = dict[locale].careers;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("careers", locale),
  openGraph: {
    url: alternatesFor("careers", locale).canonical,
    description: copy.description,
    locale: "tr_TR",
  },
};

export default function Page() {
  return <CareersView locale={locale} />;
}
