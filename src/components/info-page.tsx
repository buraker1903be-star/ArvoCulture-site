import { Children, isValidElement, type ReactNode } from "react";

/*
  Bölüm başlığından bağlantı kimliği: "3. Sözleşme Konusu" →
  "3-sozlesme-konusu". Türkçe harfler sadeleştiriliyor; adres
  çubuğunda ve paylaşılan bağlantıda okunur kalsın.
*/
const TR: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

function sectionId(title: string) {
  return title
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (letter) => TR[letter] ?? letter)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Sözleşme ve politika sayfaları.
 *
 * Başlık kendi panelinde, sepet ve hesap sayfalarıyla aynı boyda.
 * Metnin yanında içindekiler: 17 maddelik bir sözleşmede aranan
 * maddeye atlamak kaydırmaktan hızlı. Liste, doğrudan verilen
 * `InfoSection` başlıklarından üretiliyor; sayfaların ayrıca bir
 * şey yazması gerekmiyor.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}) {
  const sections = Children.toArray(children).flatMap((child) =>
    isValidElement<{ title?: string }>(child) &&
    child.type === InfoSection &&
    child.props.title
      ? [child.props.title]
      : [],
  );
  const withToc = sections.length >= 4;

  return (
    <main className="shell">
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="about-lede">{intro}</p>
      </section>

      <div className="panel info-page" data-toc={withToc || undefined}>
        {withToc && (
          <nav className="info-toc" aria-label="İçindekiler">
            <p className="about-eyebrow">İçindekiler</p>
            <ol>
              {sections.map((section) => (
                <li key={section}>
                  <a href={`#${sectionId(section)}`}>{section}</a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className="info-content">{children}</div>
      </div>
    </main>
  );
}

export function InfoSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={sectionId(title)}>
      <h2>{title}</h2>
      <div>{children}</div>
    </section>
  );
}
