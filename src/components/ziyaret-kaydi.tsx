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
/**
 * Ziyaretin kaynağı: hangi platformdan gelindi.
 *
 * İKİ YERDEN okunuyor ve sıra önemli:
 *
 * 1. `utm_source` — reklam ve kampanya bağlantılarının taşıdığı
 *    değer. Reklamveren ne yazdıysa o doğrudur; yönlendiren site
 *    bazen aracı bir alan adı oluyor (l.instagram.com) ya da hiç
 *    gelmiyor (uygulama içi tarayıcılar referrer göndermiyor).
 * 2. `document.referrer` konağı — doğal gelen trafik.
 *
 * KENDİ SİTEMİZ KAYNAK DEĞİL. Sayfalar arası gezinmede referrer
 * bizim konağımız oluyor; onu yazsaydık her ziyaretçi ikinci
 * sayfadan itibaren "arvoculture.com'dan geldi" sayılır, gerçek
 * kaynak ilk sayfadan sonra kaybolurdu.
 *
 * TAM ADRES DEĞİL KONAK: yönlendiren adres arama terimi, kampanya
 * kimliği ve bazen oturum anahtarı taşıyor.
 */
function ziyaretKaynagi(): string | null {
  try {
    const utm = new URLSearchParams(window.location.search).get("utm_source");
    if (utm) return utm.trim().slice(0, 80);

    const yonlendiren = document.referrer;
    if (!yonlendiren) return null;

    const konak = new URL(yonlendiren).hostname;
    if (!konak || konak === window.location.hostname) return null;
    return konak.slice(0, 80);
  } catch {
    /* Bozuk referrer ya da erişilemeyen location: kaynak yok
       sayılıyor, sayaç yine de yazılıyor. */
    return null;
  }
}

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
      body: JSON.stringify({ yol, kaynak: ziyaretKaynagi() }),
      keepalive: true,
    }).catch(() => {
      /* Sayaç ikincil iş: hatası müşteriye yansımıyor. */
    });
  }, [yol]);

  return null;
}
