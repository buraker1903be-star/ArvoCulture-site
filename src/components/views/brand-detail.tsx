import type { Brand, Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function BrandDetailView({
  brand,
  locale,
}: {
  brand: Brand;
  locale: Locale;
}) {
  const copy = t(locale);
  const b = copy.brands;

  return (
    <>
      <section className="shell opening">
        <p className="register-meta">{brand.discipline[locale]}</p>
        <h1>{brand.name}</h1>
        <p>{brand.intro[locale]}</p>
        {brand.url && (
          <a className="action" href={brand.url} rel="noopener">
            {b.visit(brand.name)}
          </a>
        )}
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{b.distinction}</p>
          <div className="prose">
            <p>{brand.distinction[locale]}</p>
          </div>
        </div>
      </section>

      <section className="band band-deep">
        <div className="shell pair">
          <p className="pull">{b.scope}</p>
          <ul className="list-rules">
            {brand.offerings[locale].map((item) => (
              <li key={item}>{item}</li>
            ))}
            <li>
              {b.statusLine}: {copy.status[brand.status]}
              {brand.founded ? ` · ${b.foundedLine} ${brand.founded}` : ""}
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
