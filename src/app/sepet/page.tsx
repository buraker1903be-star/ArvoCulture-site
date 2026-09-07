import type { Metadata } from "next";
import { CartPageView } from "@/components/cart-page";

export const metadata: Metadata = {
  title: "Sepetim",
  robots: { index: false, follow: true },
};

export default function CartPage() {
  return (
    <main className="shell">
      <CartPageView />
    </main>
  );
}
