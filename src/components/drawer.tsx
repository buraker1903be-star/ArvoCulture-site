"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLayerBack } from "@/lib/use-layer-back";

/**
 * Yandan açılan çekmece kabuğu.
 *
 * Sepet çekmecesinin içinde duran davranışın aynısı; hesap
 * çekmecesi eklenince ikinci kopya olmasın diye ayrıldı. Dördü de
 * bir kez yanlış yapılmıştı ve dördü de burada:
 *
 *   1. PORTAL. Çekmece doğrudan <body> altına basılıyor. Başlık
 *      `position: sticky` ve `z-index: 40` ile kendi yığın
 *      bağlamını kuruyor; çekmece onun içinde kalsaydı z-index
 *      değeri ne olursa olsun sayfa içeriğinin ARKASINDA
 *      görünürdü.
 *   2. KAPANIŞ ANİMASYONU bitmeden bileşen kaldırılmıyor.
 *   3. ESCAPE kapatıyor, arka plan kaymıyor.
 *   4. GERİ HAREKETİ çekmeceyi kapatıyor, siteyi terk etmiyor.
 */
export function Drawer({
  open,
  onClose,
  label,
  title,
  wide = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Ekran okuyucuya çekmecenin ne olduğunu söyler. */
  label: string;
  title: string;
  /** Hesap çekmecesi gibi form taşıyan içerik için daha geniş. */
  wide?: boolean;
  children: React.ReactNode;
}) {
  const [closing, setClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Tek seferlik; zincirleme render riski yok.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      setClosing(false);
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  useLayerBack(open, close);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className={`drawer-layer${closing ? " is-closing" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        className="drawer-veil"
        aria-label={`${label} çekmecesini kapat`}
        onClick={close}
      />

      <aside className={`drawer${wide ? " drawer-wide" : ""}`}>
        <header className="drawer-head">
          <h2>{title}</h2>
          <button type="button" onClick={close}>
            Kapat
          </button>
        </header>

        {children}
      </aside>
    </div>,
    document.body,
  );
}
