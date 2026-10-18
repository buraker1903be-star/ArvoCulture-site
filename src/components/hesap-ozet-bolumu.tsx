"use client";

import Link from "next/link";
import { OrderCard } from "@/components/order-card";
import type { Order } from "@/lib/order-types";

/**
 * Hesabın özet sayfası.
 *
 * Bölümler ayrı sayfalara çıkınca /hesap'ın elinde yalnızca
 * karşılama ve dört sayaç kalıyordu — bir kapı, arkasında hiçbir
 * şey yok. Özet sayfası bir SORUYA yanıt vermeli ve müşterinin
 * hesaba girerken sorduğu soru hemen her zaman aynı: "siparişim
 * nerede".
 *
 * Bu yüzden burada SON SİPARİŞ var, listenin tamamı değil.
 * Tamamı kendi sayfasında.
 */
export function HesapOzetBolumu({
  orders,
  siparisOkunamadi,
  supabaseUrl,
  yenidenDene,
}: {
  orders: Order[] | null;
  siparisOkunamadi: boolean;
  supabaseUrl: string;
  yenidenDene: () => void;
}) {
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

      {orders === null && !siparisOkunamadi && (
        <p className="hint">Siparişler yükleniyor…</p>
      )}

      {/*
        Arıza "siparişiniz yok" diye gösterilmiyor: siparişi olan
        müşteriye geçici bir okuma hatasında siparişinin kaybolduğunu
        söylemiş oluruz.
      */}
      {siparisOkunamadi && (
        <p className="form-error" role="alert">
          Siparişleriniz şu anda alınamadı; yerinde duruyorlar.{" "}
          <button type="button" className="link-button" onClick={yenidenDene}>
            Tekrar dene
          </button>
        </p>
      )}

      {orders && orders.length === 0 && (
        <p className="hint">
          Henüz siparişiniz görünmüyor. Misafir olarak sipariş
          verdiyseniz, aynı e-posta adresini doğruladığınızda
          siparişleriniz burada listelenir.
        </p>
      )}

      {sonuncu && (
        <div className="order-cards order-cards-tek">
          <OrderCard order={sonuncu} supabaseUrl={supabaseUrl} />
        </div>
      )}
    </section>
  );
}
