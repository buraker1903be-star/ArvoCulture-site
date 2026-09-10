"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { useFavourites } from "@/components/favourites";
import type { Product } from "@/lib/product-types";

/**
 * Favoriler listesi.
 *
 * Slug listesi FavouritesProvider'dan gelir — üye müşteride
 * hesaptan, misafirde tarayıcıdan. Ürün bilgileri /api/favoriler
 * ucundan yalnızca o slug'lar için çekilir; katalog büyüdükçe bu
 * sayfanın maliyeti artmaz.
 */

type State =
  | { status: "loading" }
  | { status: "empty" }
  | { status: "ready"; products: Product[] }
  | { status: "error" };

export function FavouritesView() {
  const { slugs, syncing } = useFavourites();
  const [state, setState] = useState<State>({ status: "loading" });

  /* Hangi liste için istek yapıldığını tutar: aynı liste için
     tekrar tekrar ağ isteği yapılmasın. */
  const lastKey = useRef<string | null>(null);

  const load = useCallback(async (wanted: string[]) => {
    if (wanted.length === 0) {
      setState({ status: "empty" });
      return;
    }

    try {
      const response = await fetch("/api/favoriler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: wanted }),
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
        Hata "favoriniz yok" diye gösterilmiyor: müşterinin listesi
        duruyor olabilir ve boş liste yanıltıcı olurdu.
      */
      setState({ status: "error" });
    }
  }, []);

  useEffect(() => {
    /* Hesapla eşitleme sürerken bekleniyor: yarım listeyle istek
       yapmak, az sonra değişecek bir ekran çizmek demektir. */
    if (syncing) return;

    const key = slugs.join("|");
    if (lastKey.current === key) return;
    lastKey.current = key;

    void load(slugs);
  }, [slugs, syncing, load]);

  if (syncing || state.status === "loading") {
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
          Favorileriniz duruyor; bağlantı sorunu geçici olabilir. Tekrar denemek
          ister misiniz?
        </p>
        <div className="order-actions">
          <button
            className="btn"
            type="button"
            onClick={() => {
              lastKey.current = null;
              void load(slugs);
            }}
          >
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
          <h2>{state.products.length} ürün</h2>
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
