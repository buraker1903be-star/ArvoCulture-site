import type { Metadata } from "next";
import { SiparislerimBolumu } from "@/components/hesap-bolumleri";

export const metadata: Metadata = {
  title: "Siparişlerim",
  description: "Geçmiş siparişleriniz.",
  alternates: { canonical: "/hesap/siparislerim" },
  robots: { index: false, follow: true },
};

/* Kabuk (düzen) oturuma bakıyor; rota saklanmamalı. */
export const dynamic = "force-dynamic";

/* Konağı düzen bırakıyor; bölüm yalnızca kendi gövdesi. */
export default function Sayfa() {
  return <SiparislerimBolumu />;
}
