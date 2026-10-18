"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { Drawer } from "@/components/drawer";

/*
  PANEL TEMBEL YÜKLENİYOR.

  `AccountPanel` Supabase istemcisini içe aktarıyor — 233 KB. Daha
  önce /hesap bağlantısında `prefetch={false}` vardı, tam da bu
  yüzden: giriş yapmayacak ziyaretçiye o paketi indirmemek için.
  Çekmece başlıkta duruyor, yani statik bir içe aktarma paketi HER
  SAYFAYA sokardı ve o önlemi tersine çevirirdi.

  Çekmece kapalıyken hiç çizilmiyor (Drawer null dönüyor), yani
  parça da istenmiyor; ilk açılışta iniyor.
*/
const AccountPanel = dynamic(
  () => import("@/components/account-panel").then((m) => m.AccountPanel),
  { ssr: false, loading: () => <p className="drawer-empty">Yükleniyor…</p> },
);

/**
 * Hesap çekmecesi.
 *
 * Başlıktaki kişi simgesi /hesap sayfasına GİDİYORDU: müşteri
 * giriş yapmak için baktığı ürünü ya da sepeti terk ediyor,
 * girdikten sonra geri tuşuyla dönmeye çalışıyordu. Oysa giriş
 * çoğu zaman ALIŞVERİŞİN ORTASINDA yapılıyor — "siparişim nerede",
 * "adresim kayıtlı mıydı" — ve sayfadan çıkmak o akışı kesiyor.
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

  return (
    <>
      <button
        type="button"
        className="header-action-link"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="Hesabım"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5 20c.7-3.7 3.5-5.5 7-5.5s6.3 1.8 7 5.5" />
        </svg>
        <span>Hesabım</span>
      </button>

      <Drawer open={open} onClose={close} label="Hesabım" title="Hesabım" wide>
        <div className="drawer-scroll">
          <AccountPanel supabaseUrl={supabaseUrl} supabaseKey={supabaseKey} />
        </div>
      </Drawer>
    </>
  );
}
