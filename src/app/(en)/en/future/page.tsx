import type { Metadata } from "next";
import { FutureView } from "@/components/views/future";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "en" as const;
const copy = dict[locale].future;

export const metadata: Metadata = {
  title: copy.title,
  description: copy.description,
  alternates: alternatesFor("future", locale),
  openGraph: {
    url: alternatesFor("future", locale).canonical,
    description: copy.description,
    locale: "en_US",
  },
};

export default function Page() {
  return <FutureView locale={locale} />;
}
