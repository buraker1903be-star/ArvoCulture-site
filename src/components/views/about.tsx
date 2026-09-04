import { organization, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function AboutView({ locale }: { locale: Locale }) {
  const copy = t(locale).about;
  const { address, registry } = organization;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.originPull}</p>
          <div className="prose">
            {/* TODO: Kuruluş sıralamasını ve tarihleri doğrulayın. */}
            <p>{copy.originA}</p>
            <p>{copy.originB}</p>
          </div>
        </div>
      </section>

      <section className="band band-deep">
        <div className="shell pair">
          <p className="pull">{copy.registryPull}</p>
          <ul className="list-rules">
            <li>{copy.legalName}: {organization.legalName}</li>
            <li>
              {copy.addressLabel}: {address.street}, {address.postalCode}{" "}
              {address.district} / {address.city}
            </li>
            <li>{copy.emailLabel}: {organization.email}</li>
            <li>MERSİS: {registry.mersis || copy.pending}</li>
            <li>
              Vergi: {registry.taxOffice || copy.pending} {registry.taxId}
            </li>
            <li>
              Ticaret sicil: {registry.tradeRegistryNo || copy.pending}
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
