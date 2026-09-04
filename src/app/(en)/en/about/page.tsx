import type { Metadata } from "next";
import { AboutView } from "@/components/views/about";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "en" as const;
const copy = dict[locale].about;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("about", locale),
  openGraph: {
    url: alternatesFor("about", locale).canonical,
    description: copy.description,
    locale: "en_US",
  },
};

export default function Page() {
  return <AboutView locale={locale} />;
}
