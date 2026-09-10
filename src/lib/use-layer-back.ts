"use client";

import { useEffect, useRef } from "react";

/**
 * Geri tuşu açık katmanı kapatsın.
 *
 * Telefonda en çok can sıkan şeylerden biri: sepet çekmecesi
 * açıkken geri tuşuna basmak. Uygulamada çekmece kapanır; web
 * sitesinde site terk edilir. Müşteri alışverişin ortasında
 * kendini bir önceki sayfada bulur.
 *
 * Çözüm, katman açılırken geçmişe sahte bir adım eklemek: geri
 * hareketi o adımı yiyor, sayfa yerinde kalıyor.
 *
 * İki ince nokta var:
 *
 *   1. Katman düğmeyle kapatıldığında eklediğimiz adımı geri
 *      almalıyız; yoksa müşteri geri tuşuna iki kez basmak zorunda
 *      kalır ve bu sefer de "geri çalışmıyor" der.
 *   2. Katmandaki bir bağlantıya tıklandığında katman kapanır ama
 *      artık başka bir sayfadayızdır. O anda geçmişi geri almak,
 *      müşteriyi yeni açtığı sayfadan koparmak olurdu. Bu yüzden
 *      geri adımı yalnızca geçmişteki üst kayıt hâlâ bizimse
 *      atılıyor.
 */
export function useLayerBack(open: boolean, close: () => void) {
  /* Kapatma işlevi her render'da yeniden üretiliyor olabilir;
     etkiyi ona bağlarsak her render bir geçmiş adımı ekler. */
  const kapat = useRef(close);
  useEffect(() => {
    kapat.current = close;
  });

  useEffect(() => {
    if (!open) return;

    window.history.pushState({ arvoKatman: true }, "", window.location.href);

    let geriyleKapandi = false;
    const geri = () => {
      geriyleKapandi = true;
      kapat.current();
    };
    window.addEventListener("popstate", geri);

    return () => {
      window.removeEventListener("popstate", geri);
      if (geriyleKapandi) return;
      /* Gezinme olduysa geçmişin tepesi artık bizim değil; dokunma. */
      const durum = window.history.state as { arvoKatman?: boolean } | null;
      if (durum?.arvoKatman) window.history.back();
    };
  }, [open]);
}
