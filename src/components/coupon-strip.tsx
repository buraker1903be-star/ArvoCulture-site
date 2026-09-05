"use client";

import { useState } from "react";

/**
 * Kupon kodunu tek tıkla panoya kopyalar. Kod yalnızca metin olarak
 * dursaydı müşterinin elle yazması gerekirdi; her elle yazım bir
 * terk noktasıdır.
 */
export function CouponCopy({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  return (
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
  );
}
