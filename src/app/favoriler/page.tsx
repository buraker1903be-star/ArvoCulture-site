import type { Metadata } from "next";
import { FavouritesView } from "@/components/favourites-view";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Beğendiğiniz ürünler.",
  alternates: { canonical: "/favoriler" },
  robots: { index: false, follow: true },
};

export default function FavouritesPage() {
  /*
    Katalog burada artık çekilmiyor. Favori listesi tarayıcıda
    tutulduğu için sunucunun hangi ürünlerin isteneceğini önceden
    bilmesi mümkün değil; ürünler istemciden /api/favoriler ucuna
    sorularak alınıyor. Eskiden tüm katalog çekilip istemciye prop
    olarak veriliyordu ve sayfa megabaytlarca HTML üretiyordu.
  */
  return (
    <main className="shell">
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">Favorilerim</p>
        <h1>Beğendikleriniz.</h1>
      </section>

      <FavouritesView />
    </main>
  );
}
