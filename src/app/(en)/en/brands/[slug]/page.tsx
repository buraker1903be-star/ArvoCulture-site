import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandDetailView } from "@/components/views/brand-detail";
import { brands, getBrand, brandAlternates } from "@/lib/site";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { dict } from "@/lib/dictionary";

const locale = "en" as const;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return brands.map((brand) => ({ slug: brand.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) return {};

  return {
    title: brand.name,
    description: brand.intro[locale],
    alternates: brandAlternates(brand.slug, locale),
    openGraph: {
      title: `${brand.name} | ArvoCulture Group`,
      description: brand.intro[locale],
      url: brandAlternates(brand.slug, locale).canonical,
      locale: "en_US",
    },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const brand = getBrand(slug);
  if (!brand) notFound();

  return (
    <>
      <BrandDetailView brand={brand} locale={locale} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: "Home", path: "/en" },
            { name: dict[locale].brands.title, path: "/en/brands" },
            { name: brand.name, path: `/en/brands/${brand.slug}` },
          ],
        )}
      />
    </>
  );
}
