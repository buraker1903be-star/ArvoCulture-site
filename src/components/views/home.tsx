import Link from "next/link";
import { path, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";
import { BrandRegister } from "@/components/brand-register";

export function HomeView({ locale }: { locale: Locale }) {
  const copy = t(locale).home;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.heading}</h1>
        <p>{copy.lede}</p>
      </section>

      <section className="shell" aria-labelledby="portfolio">
        <h2 id="portfolio" className="pull section-lead">
          {copy.portfolio}
        </h2>
        <BrandRegister locale={locale} />
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.sustainPull}</p>
          <div className="prose">
            <p>{copy.sustainA}</p>
            <p>{copy.sustainB}</p>
            <Link className="action" href={path("sustainability", locale)}>
              {copy.sustainCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="band band-deep">
        <div className="shell pair">
          <p className="pull">{copy.futurePull}</p>
          <div className="prose">
            <p>{copy.futureA}</p>
            <p>{copy.futureB}</p>
            <Link className="action" href={path("future", locale)}>
              {copy.futureCta}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
