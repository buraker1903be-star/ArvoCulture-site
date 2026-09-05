import { CartView } from "@/components/cart";
export default function CartPage() {
  return (
    <main className="shell"><div className="panel simple-page">
      <p className="eyebrow">SEPETİN</p>
      <h1>Seçimlerini tamamla.</h1>
      <CartView />
    </div></main>
  );
}
