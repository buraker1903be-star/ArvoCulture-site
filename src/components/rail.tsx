"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Yatay raf.
 *
 * Kaydırma çubuğu masaüstünde çirkin duruyor ve kullanıcıya
 * "burada devamı var" demiyor. Ok düğmeleri hem daha temiz hem
 * de kaydırılabilir olduğunu açıkça gösteriyor.
 *
 * Dokunmatikte oklar gizleniyor: orada parmakla kaydırmak zaten
 * beklenen davranış.
 */
export function Rail({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /* Okların etkin olup olmadığını kaydırma konumundan hesapla. */
  const sync = () => {
    const node = ref.current;
    if (!node) return;
    setAtStart(node.scrollLeft < 8);
    setAtEnd(node.scrollLeft + node.clientWidth >= node.scrollWidth - 8);
  };

  useEffect(() => {
    sync();
    const node = ref.current;
    if (!node) return;

    node.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      node.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  const scroll = (direction: 1 | -1) => {
    const node = ref.current;
    if (!node) return;
    // Görünen alanın yaklaşık dörtte üçü kadar kaydır: bir sonraki
    // kart tamamen görünsün, bağlam da kaybolmasın.
    node.scrollBy({
      left: direction * node.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  return (
    <div className="rail-wrap">
      <div className="rail" ref={ref}>
        {children}
      </div>

      <button
        type="button"
        className="rail-arrow is-prev"
        aria-label="Öncekiler"
        disabled={atStart}
        onClick={() => scroll(-1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m15 5-7 7 7 7" />
        </svg>
      </button>

      <button
        type="button"
        className="rail-arrow is-next"
        aria-label="Sonrakiler"
        disabled={atEnd}
        onClick={() => scroll(1)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
