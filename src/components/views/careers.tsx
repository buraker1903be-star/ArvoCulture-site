import { organization, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function CareersView({ locale }: { locale: Locale }) {
  const copy = t(locale).careers;

  return (
    <section className="shell opening">
      <h1>{copy.title}</h1>
      <p className="lede">{copy.lede}</p>
      <a className="action" href={`mailto:${organization.email}`}>
        {copy.cta}
      </a>
    </section>
  );
}
