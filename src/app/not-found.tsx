import Link from "next/link";
import { Shell } from "@/components/shell";
import { t } from "@/lib/dictionary";

// Birden fazla kök layout olduğu için bu sayfa kendi kabuğunu render eder.
export default function NotFound() {
  const copy = t("tr").notFound;

  return (
    <Shell locale="tr">
      <section className="shell opening">
        <h1>{copy.heading}</h1>
        <p>{copy.body}</p>
        <Link className="action" href="/markalar">
          {copy.cta}
        </Link>
      </section>
    </Shell>
  );
}
