"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLayerBack } from "@/lib/use-layer-back";

/*
  PANEL TEMBEL YÜKLENİYOR.

  `AccountPanel` Supabase istemcisini içe aktarıyor — 233 KB. Daha
  önce /hesap bağlantısında `prefetch={false}` vardı, tam da bu
  yüzden: giriş yapmayacak ziyaretçiye o paketi indirmemek için.
  Menü başlıkta duruyor, yani statik bir içe aktarma paketi HER
  SAYFAYA sokardı ve o önlemi tersine çevirirdi.

  Menü kapalıyken hiç çizilmiyor, yani parça da istenmiyor; ilk
  açılışta iniyor.
*/
const AccountPanel = dynamic(
  () => import("@/components/account-panel").then((m) => m.AccountPanel),
  { ssr: false, loading: () => <p className="account-pop-loading">Yükleniyor…</p> },
);

/**
 * Hesap menüsü.
 *
 * Başlıktaki kişi simgesi önce /hesap sayfasına gidiyordu, sonra
 * yandan çekmece açtı; ikisi de yanlıştı. Sayfa alışverişin
 * akışını kesiyordu, çekmece ise başlıkta duran bir simgeye
 * ekranın öbür ucundan cevap veriyordu — tıkladığın yerle açılan
 * yer arasında bağ yok.
 *
 * Menü, simgenin ALTINDAN açılıyor: üst menünün kategori
 * panelleriyle aynı davranış ve aynı yer. Dışına tıklamak ve
 * Escape kapatıyor.
 *
 * Panel sayfayla ORTAK (`AccountPanel`): giriş, kayıt, şifre
 * sıfırlama, siparişler ve adres defteri tek yerde. İkinci bir
 * giriş formu yazmak, yarın birinde düzeltilen bir doğrulamanın
 * öbüründe kalması demekti.
 *
 * /hesap sayfası duruyor: paylaşılabilir bir adres ve şifre
 * sıfırlama bağlantısı oraya dönüyor.
 */
export function AccountDrawer({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const kap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    /*
      Dışarı tıklama `pointerdown` ile dinleniyor, `click` ile
      değil: panelin içindeki bir alana basıp dışarıda bırakan
      sürükleme (metin seçimi) `click`i kabın dışında doğuruyor ve
      menü seçim yapılırken kapanıyordu.
    */
    const disari = (olay: PointerEvent) => {
      if (!kap.current?.contains(olay.target as Node)) close();
    };
    const tus = (olay: KeyboardEvent) => {
      if (olay.key === "Escape") close();
    };

    window.addEventListener("pointerdown", disari);
    window.addEventListener("keydown", tus);
    return () => {
      window.removeEventListener("pointerdown", disari);
      window.removeEventListener("keydown", tus);
    };
  }, [open, close]);

  /* Telefonda geri hareketi menüyü kapatsın, siteyi değil. */
  useLayerBack(open, close);

  return (
    <div className="account-menu" ref={kap}>
      <button
        type="button"
        className="header-action-link"
        onClick={() => setOpen((acik) => !acik)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Hesabım"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c.7-3.7 3.5-5.5 7-5.5s6.3 1.8 7 5.5" />
        </svg>
        <span>Hesabım</span>
      </button>

      {open && (
        <div className="account-pop" role="dialog" aria-label="Hesabım">
          <AccountPanel
            supabaseUrl={supabaseUrl}
            supabaseKey={supabaseKey}
            kompakt
          />
        </div>
      )}
    </div>
  );
}
