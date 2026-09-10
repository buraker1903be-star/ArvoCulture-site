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
 * Katman kapandığında bu adımı geri almamız gerekiyor; yoksa
 * müşteri geri tuşuna iki kez basmak zorunda kalır. Ama kapanış
 * her zaman aynı sebeple olmuyor ve sebebi bilmek şart:
 *
 *   - "Kapat" düğmesi, örtü, Escape → adımı geri almalıyız.
 *   - Katmandaki bir bağlantı        → almamalıyız, çünkü müşteri
 *                                      artık başka bir sayfaya
 *                                      gidiyor.
 *
 * İlk sürümde bunu "geçmişin tepesindeki kayıt hâlâ bizim mi"
 * diye ayırt etmeye çalışmıştım ve bu yanlıştı: Next, gezinmeye
 * başlarken geçmiş durumunu kendi ağacıyla *birleştiriyor*, yani
 * bizim işaretimiz orada duruyor. Sonuç: katalogdan bir kategori
 * seçildiğinde geri adımı atılıyor, gezinme iptal oluyor ve
 * müşteri kaldığı sayfada kalıyordu — tam da menünün işini
 * yapmaması demek.
 *
 * Şimdi sebebi tahmin etmiyoruz, doğrudan gözlüyoruz: katman
 * açıkken bir bağlantıya tıklandığını yakalama aşamasında
 * duyuyoruz. Tıklama, React'in durum güncellemesinden de Next'in
 * gezinmesinden de önce geldiği için bu bilgi kapanış anında
 * elimizde oluyor.
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
    let gezinmeVar = false;

    const geri = () => {
      geriyleKapandi = true;
      kapat.current();
    };

    /*
      Yakalama aşaması: React kendi işleyicisini kökte, kabarma
      aşamasında dinliyor. Buradan bakınca tıklamayı ondan önce
      görüyoruz.
    */
    const tiklama = (event: MouseEvent) => {
      const hedef = event.target as Element | null;
      const bag = hedef?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!bag) return;
      /* Yeni sekmede açılan bağlantı bu sayfadan gitmiyor. */
      if (bag.target && bag.target !== "_self") return;
      if (event.metaKey || event.ctrlKey || event.shiftKey) return;
      gezinmeVar = true;
    };

    window.addEventListener("popstate", geri);
    document.addEventListener("click", tiklama, true);

    return () => {
      window.removeEventListener("popstate", geri);
      document.removeEventListener("click", tiklama, true);
      if (geriyleKapandi || gezinmeVar) return;
      window.history.back();
    };
  }, [open]);
}
