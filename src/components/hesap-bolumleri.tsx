"use client";

import { AddressBook } from "@/components/address-book";
import { OrderCard } from "@/components/order-card";
import { ProfilKarti } from "@/components/profil-karti";
import { useHesap } from "@/components/hesap-baglami";
import Link from "next/link";

/**
 * Hesap bölümlerinin gövdeleri.
 *
 * Hepsi veriyi kabuktan (`useHesap`) okuyor; kendi isteğini
 * yapmıyorlar. Böylece bölüm değiştirmek yeni bir ağ isteği
 * doğurmuyor — önceden her bölüm kendi panelini kurduğu için
 * oturum ve sipariş listesi her tıklamada baştan çekiliyordu.
 */

export function BilgilerimBolumu() {
  const h = useHesap();
  return (
    <ProfilKarti
      ad={h.profileName}
      telefon={h.profilePhone}
      eposta={h.eposta}
      uyelikTarihi={h.uyelikTarihi}
      adDegisti={h.setProfileName}
      telefonDegisti={h.setProfilePhone}
      kaydet={h.kaydet}
      sifreDegistir={h.sifreDegistir}
    />
  );
}

export function AdreslerimBolumu() {
  const h = useHesap();
  return <AddressBook supabase={h.supabase} />;
}

/** Sipariş listesinin ortak hâlleri: yükleniyor / arıza / boş. */
function SiparisHalleri({ kisa = false }: { kisa?: boolean }) {
  const { orders, siparisOkunamadi, siparisleriYenile } = useHesap();

  if (orders === null && !siparisOkunamadi) {
    return <p className="hint">Siparişler yükleniyor…</p>;
  }

  /*
    Arıza "siparişiniz yok" diye gösterilmiyor: siparişi olan
    müşteriye geçici bir okuma hatasında siparişinin kaybolduğunu
    söylemiş oluruz.
  */
  if (siparisOkunamadi) {
    return (
      <p className="form-error" role="alert">
        Siparişleriniz şu anda alınamadı; yerinde duruyorlar.{" "}
        <button
          type="button"
          className="link-button"
          onClick={siparisleriYenile}
        >
          Tekrar dene
        </button>
      </p>
    );
  }

  if (orders && orders.length === 0) {
    return (
      <p className="hint">
        Henüz siparişiniz görünmüyor.
        {kisa
          ? ""
          : " Misafir olarak sipariş verdiyseniz, aynı e-posta adresini doğruladığınızda siparişleriniz burada listelenir."}
      </p>
    );
  }

  return null;
}

export function SiparislerimBolumu() {
  const { orders, supabaseUrl } = useHesap();

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h1>Siparişlerim</h1>
          <p>Geçmiş siparişleriniz ve tüm detayları.</p>
        </div>
      </div>

      <SiparisHalleri />

      {orders && orders.length > 0 && (
        <div className="order-cards">
          {orders.map((order) => (
            <OrderCard
              key={order.order_number}
              order={order}
              supabaseUrl={supabaseUrl}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Özet.
 *
 * Bölümler ayrı sayfalara çıkınca /hesap'ın elinde yalnızca
 * karşılama ve dört sayaç kalıyordu — bir kapı, arkasında hiçbir
 * şey yok. Özet bir SORUYA yanıt vermeli ve müşterinin hesaba
 * girerken sorduğu soru hemen her zaman aynı: "siparişim nerede".
 * Bu yüzden burada SON sipariş var, listenin tamamı değil.
 */
export function OzetBolumu() {
  const { orders, supabaseUrl } = useHesap();
  const sonuncu = orders?.[0] ?? null;

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>Son siparişiniz</h2>
          <p>Hesabınıza en son düşen sipariş.</p>
        </div>
        {orders && orders.length > 1 && (
          <Link className="linklike" href="/hesap/siparislerim">
            Tümü ({orders.length})
          </Link>
        )}
      </div>

      <SiparisHalleri kisa />

      {sonuncu && (
        <div className="order-cards order-cards-tek">
          <OrderCard order={sonuncu} supabaseUrl={supabaseUrl} />
        </div>
      )}
    </section>
  );
}
