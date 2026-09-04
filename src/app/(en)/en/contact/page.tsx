import type { Metadata } from "next";
import { ContactView } from "@/components/views/contact";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "en" as const;
const copy = dict[locale].contact;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("contact", locale),
  openGraph: {
    url: alternatesFor("contact", locale).canonical,
    description: copy.description,
    locale: "en_US",
  },
};

export default function Page() {
  return <ContactView locale={locale} />;
}
