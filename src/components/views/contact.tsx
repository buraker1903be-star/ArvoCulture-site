import { brands, organization, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";
import { ContactForm } from "@/components/contact-form";

export function ContactView({ locale }: { locale: Locale }) {
  const copy = t(locale).contact;
  const { address } = organization;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.hqPull}</p>
          <ul className="list-rules">
            <li>
              <a href={`mailto:${organization.email}`}>{organization.email}</a>
            </li>
            <li>
              {address.street}, {address.postalCode} {address.district} /{" "}
              {address.city}
            </li>
          </ul>
        </div>
      </section>

      <section className="band band-deep">
        <div className="shell pair">
          <p className="pull">{copy.brandsPull}</p>
          <ul className="list-rules">
            {brands
              .filter((brand) => brand.url)
              .map((brand) => (
                <li key={brand.slug}>
                  <a href={brand.url} rel="noopener">
                    {brand.name}
                  </a>{" "}
                  — {brand.discipline[locale]}
                </li>
              ))}
          </ul>
        </div>
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.formPull}</p>
          <ContactForm locale={locale} />
        </div>
      </section>
    </>
  );
}
