"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Sayfa açılışını kaydeder.
 *
 * Konum Vercel'in kenar başlıklarından okunuyor ve o başlıklar
 * yalnızca tarayıcıdan gelen gerçek istekte var; bu yüzden kayıt
 * sayfanın sunucu tarafından değil, buradan atılan küçük bir
 * istekle yazılıyor (`/api/ziyaret`).
 *
 * `keepalive`: müşteri bağlantıya tıklayıp sayfadan çıkarken de
 * isteğin tamamlanmasını sağlıyor; yoksa hızlı gezinen ziyaretçi
 * hiç sayılmazdı.
 */
export function ZiyaretKaydi() {
  const yol = usePathname();
  /* Aynı yol için iki kez yazmıyor: React'in çift çalışan
     geliştirme etkisi ve geri/ileri gezinmesi sayacı şişirirdi. */
  const sonYol = useRef<string | null>(null);

  useEffect(() => {
    if (!yol || sonYol.current === yol) return;
    sonYol.current = yol;

    void fetch("/api/ziyaret", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yol }),
      keepalive: true,
    }).catch(() => {
      /* Sayaç ikincil iş: hatası müşteriye yansımıyor. */
    });
  }, [yol]);

  return null;
}
