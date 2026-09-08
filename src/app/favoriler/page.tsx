import type { Metadata } from "next";
import { FavouritesView } from "@/components/favourites-view";
import { getStorefrontProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Favorilerim",
  description: "Beğendiğiniz ürünler.",
  alternates: { canonical: "/favoriler" },
  robots: { index: false, follow: true },
};

export default async function FavouritesPage() {
  // Katalog sunucuda çekilip istemciye veriliyor; favori
  // listesi tarayıcıda tutulduğu için eşleştirme orada yapılır.
  const products = await getStorefrontProducts(3000);

  return (
    <main className="shell">
      <section className="panel about-hero detail-hero">
        <p className="about-eyebrow">Favorilerim</p>
        <h1>Beğendikleriniz.</h1>
      </section>

      <FavouritesView products={products} />
    </main>
  );
}
