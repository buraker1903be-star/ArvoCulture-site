import type { Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";
import { BrandRegister } from "@/components/brand-register";

export function BrandsView({ locale }: { locale: Locale }) {
  const copy = t(locale).brands;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.title}</h1>
        <p>{copy.lede}</p>
      </section>
      <section className="shell">
        <BrandRegister locale={locale} headingLevel="h2" />
      </section>
    </>
  );
}
