import type { Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function SustainabilityView({ locale }: { locale: Locale }) {
  const copy = t(locale).sustainability;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
      </section>

      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.methodPull}</p>
          <div className="prose">
            {/*
              TODO — yayina almadan once doldurulmasi zorunlu:
              1. Sunucu bolgesi ve saglayicinin yenilenebilir enerji orani
              2. Hesaplama metodolojisi (or. SCI — Software Carbon Intensity)
              3. Olcum donemi ve dogrulayan taraf
              Sayisal dayanak olmadan "dusuk karbon" ifadesi kullanilmamalidir.
            */}
            <p>{copy.methodA}</p>
            <p>{copy.methodB}</p>
          </div>
        </div>
      </section>

      <section className="band band-deep">
        <div className="shell pair">
          <p className="pull">{copy.gapsPull}</p>
          <div className="prose">
            <p>{copy.gapsA}</p>
          </div>
        </div>
      </section>
    </>
  );
}
