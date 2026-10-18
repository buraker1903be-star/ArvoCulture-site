import type { Metadata } from "next";
import { BilgilerimBolumu } from "@/components/hesap-bolumleri";

export const metadata: Metadata = {
  title: "Hesap bilgilerim",
  description: "Ad, telefon ve şifre.",
  alternates: { canonical: "/hesap/bilgilerim" },
  robots: { index: false, follow: true },
};

/* Kabuk (düzen) oturuma bakıyor; rota saklanmamalı. */
export const dynamic = "force-dynamic";

/* Konağı düzen bırakıyor; bölüm yalnızca kendi gövdesi. */
export default function Sayfa() {
  return <BilgilerimBolumu />;
}
