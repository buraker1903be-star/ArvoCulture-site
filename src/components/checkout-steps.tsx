"use client";

import Link from "next/link";
import { useParaBirimi } from "@/components/para-birimi";
import { dilOneki } from "@/lib/dil-onek";

/*
  Sipariş adımları: sepet, teslimat, ödeme.

  Sepet ve ödeme sayfaları iki ayrı ekran gibi duruyordu; müşteri
  nerede olduğunu ve kaç adım kaldığını göremiyordu. Künye dilinde
  tek satır — geçilmiş adım geri dönüş bağlantısı oluyor.
*/
/*
  "use client" EKLENDİ: adım adları da çevriliyor ve çeviri seçimi
  tarayıcıda. Bileşen zaten yalnızca istemci bileşenlerinin içinde
  (sepet ve ödeme sayfaları) çiziliyordu, yani paket boyutu
  değişmiyor — eklenen tek şey açıklık.
*/
const STEPS = [
  { key: "sepet", etiket: "adimSepet", href: "/sepet" },
  { key: "teslimat", etiket: "adimTeslimat", href: null },
  { key: "odeme", etiket: "adimOdeme", href: null },
] as const;

export function CheckoutSteps({
  current,
}: {
  current: (typeof STEPS)[number]["key"];
}) {
  const { t, dil } = useParaBirimi();
  /* Adım bağlantısı da dile bağlı: İngilizce ödeme sayfasından
     "Basket" adımına tıklayan müşteri Türkçe sepete düşüyordu. */
  const onek = dilOneki(dil);
  const currentIndex = STEPS.findIndex((step) => step.key === current);

  return (
    <ol className="steps" aria-label={t("siparisAdimlari")}>
      {STEPS.map((step, index) => (
        <li
          key={step.key}
          aria-current={index === currentIndex ? "step" : undefined}
        >
          {index < currentIndex && step.href ? (
            <Link href={`${onek}${step.href}`}>{t(step.etiket)}</Link>
          ) : (
            t(step.etiket)
          )}
        </li>
      ))}
    </ol>
  );
}
