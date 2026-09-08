"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Kaydırma ile beliren bölüm.
 *
 * Ekrana girdiğinde içeriği yumuşakça yukarı kaydırıp
 * görünürleştirir. Sayfa boyunca aynı anda her şeyi göstermek
 * yerine göz akışına ritim katar.
 *
 * `IntersectionObserver` kullanılıyor: kaydırma olayını her
 * karede dinlemek yerine tarayıcı yalnızca eşik geçildiğinde
 * haber veriyor, bu da düşük güçlü telefonlarda takılma
 * yaratmıyor.
 *
 * Hareket tercihini kapatan kullanıcıda animasyon hiç
 * çalışmaz; içerik doğrudan görünür.
 */
export function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    /*
      Animasyon ancak buraya gelindiğinde açılır. İçerik
      varsayılan olarak görünür durumda; JavaScript çalışmazsa
      ya da hidrasyon gecikirse bölüm gizli kalmaz.
    */
    node.dataset.motion = "on";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // Bir kez göründükten sonra izlemeyi bırak.
          (entry.target as HTMLElement).dataset.shown = "true";
          observer.unobserve(entry.target);
        }
      },
      // Bölümün beşte biri görününce başlat; kullanıcı
      // animasyonu kaçırmasın.
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="reveal"
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
