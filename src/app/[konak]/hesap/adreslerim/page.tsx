import type { Metadata } from "next";
import { AdreslerimBolumu } from "@/components/hesap-bolumleri";

export const metadata: Metadata = {
  title: "Adreslerim",
  description: "Teslimat ve fatura adresleriniz.",
  alternates: { canonical: "/hesap/adreslerim" },
  robots: { index: false, follow: true },
};

/* Kabuk (düzen) oturuma bakıyor; rota saklanmamalı. */
export const dynamic = "force-dynamic";

/* Konağı düzen bırakıyor; bölüm yalnızca kendi gövdesi. */
export default function Sayfa() {
  return <AdreslerimBolumu />;
}
