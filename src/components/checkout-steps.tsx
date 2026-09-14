import Link from "next/link";

/*
  Sipariş adımları: sepet, teslimat, ödeme.

  Sepet ve ödeme sayfaları iki ayrı ekran gibi duruyordu; müşteri
  nerede olduğunu ve kaç adım kaldığını göremiyordu. Künye dilinde
  tek satır — geçilmiş adım geri dönüş bağlantısı oluyor.
*/
const STEPS = [
  { key: "sepet", label: "Sepet", href: "/sepet" },
  { key: "teslimat", label: "Teslimat", href: null },
  { key: "odeme", label: "Ödeme", href: null },
] as const;

export function CheckoutSteps({
  current,
}: {
  current: (typeof STEPS)[number]["key"];
}) {
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <ol className="steps" aria-label="Sipariş adımları">
      {STEPS.map((step, index) => (
        <li
          key={step.key}
          aria-current={index === currentIndex ? "step" : undefined}
        >
          {index < currentIndex && step.href ? (
            <Link href={step.href}>{step.label}</Link>
          ) : (
            step.label
          )}
        </li>
      ))}
    </ol>
  );
}
