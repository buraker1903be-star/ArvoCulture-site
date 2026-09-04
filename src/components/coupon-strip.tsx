"use client";

import { useState } from "react";

/**
 * Kupon kodunu tek tıkla panoya kopyalar. Eskiden kod yalnızca
 * metin olarak yazıyordu; müşterinin elle yazması gerekiyordu ve
 * her elle yazım bir terk noktası.
 */
export function CouponStrip({
  code,
  headline,
  note,
}: {
  code: string;
  headline: string;
  note?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <section className="coupon-strip" aria-label="İndirim kodu">
      <div>
        <strong>{headline}</strong>
        {note && <small>{note}</small>}
      </div>
      <button
        type="button"
        className="coupon-code"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            // Pano izni yoksa kod zaten ekranda görünüyor.
          }
        }}
        aria-label={`${code} kodunu kopyala`}
      >
        <span>{code}</span>
        <em>{copied ? "Kopyalandı" : "Kopyala"}</em>
      </button>
    </section>
  );
}
