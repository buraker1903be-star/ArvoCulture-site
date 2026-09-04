import type { Metadata } from "next";
import { HomeView } from "@/components/views/home";
import { alternatesFor } from "@/lib/site";
import { dict } from "@/lib/dictionary";

const locale = "en" as const;
const copy = dict[locale].home;

export const metadata: Metadata = {
  title: { absolute: copy.title },
  description: copy.description,
  alternates: alternatesFor("home", locale),
  openGraph: {
    url: alternatesFor("home", locale).canonical,
    description: copy.description,
    locale: "en_US",
  },
};

export default function Page() {
  return <HomeView locale={locale} />;
}
