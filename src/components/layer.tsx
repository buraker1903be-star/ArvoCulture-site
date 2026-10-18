"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLayerBack } from "@/lib/use-layer-back";

/**
 * Tam ekran katman: arama ve favoriler bunu paylaşıyor.
 *
 * Önce yalnızca arama katmanı vardı ve bütün davranış onun
 * içindeydi. Favoriler de aynı şekilde açılınca iki kopya olurdu:
 * birinde düzeltilen bir davranış öbüründe kalırdı. Burada
 * toplanan dört şey var ve dördü de bir kez yanlış yapılmıştı:
 *
 *   1. PORTAL. Katman doğrudan <body> altına basılıyor. Başlıkta
 *      `backdrop-filter` var ve o, içindeki `position: fixed`
 *      öğeler için yeni bir kapsayıcı kuruyor; başlığın içinde
 *      çizilen katman ekrana değil BAŞLIĞA göre konumlanıyor ve
 *      ince bir şerit olarak çıkıyordu (canlıda görüldü).
 *   2. ESCAPE kapatıyor.
 *   3. ARKA PLAN KAYMIYOR: katman açıkken gövdenin kaydırması
 *      kilitleniyor, kapanınca eski değerine dönüyor.
 *   4. GERİ HAREKETİ katmanı kapatıyor, siteyi terk etmiyor
 *      (lib/use-layer-back).
 */
export function Layer({
  open,
  onClose,
  label,
  head,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Ekran okuyucuya katmanın ne olduğunu söyler. */
  label: string;
  /** Üst satır: aramada alan, favorilerde başlık. */
  head: React.ReactNode;
  children?: React.ReactNode;
}) {
  /* `document` yalnızca tarayıcıda var; sunucu çiziminde portal
     kurulamaz. */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Tek seferlik; zincirleme render riski yok.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useLayerBack(open, onClose);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="layer" role="dialog" aria-modal="true" aria-label={label}>
      <button
        type="button"
        className="layer-veil"
        aria-label={`${label} katmanını kapat`}
        onClick={onClose}
      />

      <div className="layer-sheet">
        <div className="layer-head">
          {head}
          {/*
            Kapat yuvarlak ve çarpılı. Önceden metin hapıydı ve
            aramadaki "Temizle" ile aynı biçimdeydi; hangisinin ne
            yaptığı belli olmuyordu. Metin erişilebilir etikette.
          */}
          <button
            type="button"
            className="layer-close"
            onClick={onClose}
            aria-label={`${label} katmanını kapat`}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  );
}
