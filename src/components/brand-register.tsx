import Link from "next/link";
import { brands, brandPath, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function BrandRegister({
  locale,
  headingLevel = "h3",
}: {
  locale: Locale;
  headingLevel?: "h2" | "h3";
}) {
  const copy = t(locale);
  const Heading = headingLevel;

  return (
    <div className="register">
      {brands.map((brand) => (
        <article key={brand.slug} className="register-row">
          <div>
            <Heading style={{ fontSize: "var(--step-2)" }}>
              <Link href={brandPath(brand.slug, locale)}>{brand.name}</Link>
            </Heading>
            <p className="register-meta">{brand.discipline[locale]}</p>
          </div>
          <p>{brand.intro[locale]}</p>
          <span className="status" data-status={brand.status}>
            {copy.status[brand.status]}
          </span>
        </article>
      ))}
    </div>
  );
}
