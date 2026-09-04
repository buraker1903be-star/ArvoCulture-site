import Link from "next/link";
import { brands, brandPath, routes, organization, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

const year = 2026;

export function Colophon({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const f = copy.footer;
  const { address } = organization;

  return (
    <footer className="colophon">
      <div className="shell">
        <div className="colophon-grid">
          <section>
            <h2>{f.brands}</h2>
            <ul>
              {brands.map((brand) => (
                <li key={brand.slug}>
                  <Link href={brandPath(brand.slug, locale)}>{brand.name}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>{f.corporate}</h2>
            <ul>
              <li><Link href={routes.about[locale]}>{copy.nav.about}</Link></li>
              <li>
                <Link href={routes.sustainability[locale]}>
                  {copy.nav.sustainability}
                </Link>
              </li>
              <li><Link href={routes.future[locale]}>{copy.nav.future}</Link></li>
              <li><Link href={routes.careers[locale]}>{copy.nav.careers}</Link></li>
            </ul>
          </section>
          <section>
            <h2>{f.legal}</h2>
            <ul>
              <li>
                <Link href="/kvkk-aydinlatma-metni" hrefLang="tr">{f.kvkk}</Link>
              </li>
              <li>
                <Link href="/gizlilik-ve-cerez-politikasi" hrefLang="tr">
                  {f.privacy}
                </Link>
              </li>
            </ul>
          </section>
          <section>
            <h2>{f.contact}</h2>
            <address>
              <a href={`mailto:${organization.email}`}>{organization.email}</a>
              <br />
              {address.street}
              <br />
              {address.postalCode} {address.district} / {address.city}
            </address>
          </section>
        </div>
        <div className="colophon-legal">
          <p>© {year} {organization.legalName}. {f.rights}</p>
          <p>{f.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
