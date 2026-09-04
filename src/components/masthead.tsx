import Link from "next/link";
import { path, routes, type Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

const items = [
  "brands",
  "sustainability",
  "future",
  "about",
  "contact",
] as const;

export function Masthead({ locale }: { locale: Locale }) {
  const copy = t(locale);
  const other: Locale = locale === "tr" ? "en" : "tr";

  return (
    <header className="masthead">
      <div className="shell masthead-inner">
        <Link href={path("home", locale)} className="wordmark">
          ArvoCulture <span>Group</span>
        </Link>
        <nav aria-label={locale === "tr" ? "Ana menü" : "Main menu"}>
          <ul>
            {items.map((key) => (
              <li key={key}>
                <Link href={routes[key][locale]}>{copy.nav[key]}</Link>
              </li>
            ))}
            <li>
              <Link href={path("home", other)} hrefLang={other} className="lang">
                {copy.langSwitch}
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
