"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { readFavourites } from "@/lib/favourites";
import type { Product } from "@/lib/product-types";

/**
 * Favoriler listesi.
 *
 * Ürünler artık sayfa yüklenirken sunucudan toplu hâlde gelmiyor;
 * tarayıcıdaki favori listesi /api/favoriler ucuna gönderilip
 * yalnızca o ürünler çekiliyor. Katalog büyüdükçe bu sayfanın
 * maliyeti artmıyor ve katalog sınırının dışında kalan ürünler
 * kaybolmuyor.
 */

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; products: Product[] }
  | { status: "error" };

export function FavouritesView() {
  const [state, setState] = useState<State>({ status: "loading" });

  const load = useCallback(async () => {
    /*
      Okuma bilerek bir mikro göreve bırakılıyor. readFavourites()
      senkron çalıştığı için boş liste durumunda setState, effect ile
      aynı tik'te çağrılır ve React zincirleme render uyarısı verir.
    */
    await Promise.resolve();

    const slugs = readFavourites();

    if (slugs.length === 0) {
      setState({ status: "empty" });
      return;
    }

    try {
      const response = await fetch("/api/favoriler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as { products?: Product[] };
      const products = Array.isArray(data.products) ? data.products : [];

      setState(
        products.length > 0
          ? { status: "ready", products }
          : { status: "empty" },
      );
    } catch {
      /*
        Hata sessizce "favoriniz yok" diye gösterilmiyor: müşterinin
        listesi duruyor olabilir ve boş liste yanıltıcı olurdu.
      */
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    /*
      Kural burada yanlış alarm veriyor: load() ilk satırında await
      kullandığı için içindeki setState çağrıları effect'in tik'inde
      değil, sonraki mikro görevde çalışır. Kuralın statik çözümlemesi
      bunu göremiyor.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();

    window.addEventListener("arvo:favourites", load);
    // Başka sekmede değişirse burası da tazelensin.
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("arvo:favourites", load);
      window.removeEventListener("storage", load);
    };
  }, [load]);

  if (state.status === "loading") {
    return (
      <section className="panel">
        <p className="hint">Yükleniyor…</p>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="panel order-result">
        <h2>Liste şu anda getirilemedi.</h2>
        <p>
          Favorileriniz duruyor; bağlantı sorunu geçici olabilir. Sayfayı
          yenilemeyi deneyin.
        </p>
        <div className="order-actions">
          <button className="btn" type="button" onClick={() => void load()}>
            Tekrar dene
          </button>
        </div>
      </section>
    );
  }

  if (state.status === "empty") {
    return (
      <section className="panel order-result">
        <h2>Henüz favoriniz yok.</h2>
        <p>
          Beğendiğiniz ürünlerin köşesindeki kalbe dokunun; hepsi burada
          birikir.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Ürünlere göz at
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>
            {state.products.length} ürün
          </h2>
          <p>Favorilerinize eklediğiniz ürünler.</p>
        </div>
      </div>
      <div className="grid">
        {state.products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  );
}
