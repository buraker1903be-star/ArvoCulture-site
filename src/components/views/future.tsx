import type { Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

export function FutureView({ locale }: { locale: Locale }) {
  const copy = t(locale).future;

  return (
    <>
      <section className="shell opening">
        <h1>{copy.title}</h1>
        <p className="lede">{copy.lede}</p>
      </section>
      <section className="band">
        <div className="shell pair">
          <p className="pull">{copy.pull}</p>
          {/* TODO: Gercek proje basliklariyla degistirin. */}
          <ul className="list-rules">
            {copy.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
