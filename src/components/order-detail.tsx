"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ReturnRequest } from "@/components/return-request";
import { getAuthClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/product-types";
import {
  formatOrderDate,
  productImageUrl,
  STATUS_LABEL,
  SHIPMENT_STATUS_LABEL,
  RETURN_STATUS,
  type ReturnRequestRow,
  initials,
  type Order,
  type OrderAddress,
} from "@/lib/order-types";

type State = "loading" | "ready" | "missing" | "signed-out";

export function OrderDetail({
  orderNumber,
  supabaseUrl,
  supabaseKey,
}: {
  orderNumber: string;
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [order, setOrder] = useState<Order | null>(null);
  const [iadeler, setIadeler] = useState<ReturnRequestRow[]>([]);
  const [state, setState] = useState<State>("loading");

  useEffect(() => {
    let active = true;

    async function load() {
      const supabase = getAuthClient(supabaseUrl, supabaseKey);
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        if (active) setState("signed-out");
        return;
      }

      /*
        İADE TALEPLERİ DE ÇEKİLİYOR. Fonksiyon baştan beri vardı ama
        vitrin onu hiç çağırmıyordu; müşteri talebinin ne olduğunu
        yalnızca e-postadan öğreniyordu.

        Hatası siparişi düşürmüyor: iade bölümü görünmese de siparişin
        kendisi okunabilir kalmalı.
      */
      const [{ data, error }, { data: iadeVerisi }] = await Promise.all([
        supabase.rpc("get_arvoculture_my_orders"),
        supabase.rpc("get_arvoculture_my_returns").then(
          (sonuc) => (sonuc.error ? { data: null } : sonuc),
          () => ({ data: null }),
        ),
      ]);
      if (!active) return;

      if (error) {
        console.error(error);
        setState("missing");
        return;
      }

      const found = (data as Order[]).find(
        (item) => item.order_number === orderNumber,
      );

      if (!found) {
        setState("missing");
        return;
      }

      setIadeler(
        ((iadeVerisi as ReturnRequestRow[] | null) ?? []).filter((istek) => istek.order_number === orderNumber),
      );
      setOrder(found);
      setState("ready");
    }

    void load();
    return () => {
      active = false;
    };
  }, [orderNumber, supabaseUrl, supabaseKey]);

  if (state === "loading") {
    return (
      <section className="panel">
        <p className="hint">Yükleniyor…</p>
      </section>
    );
  }

  if (state === "signed-out") {
    return (
      <section className="panel about-hero order-result">
        <p className="about-eyebrow">Sipariş detayı</p>
        <h1>Giriş yapmanız gerekiyor.</h1>
        <p className="about-lede">
          Sipariş detayını görmek için hesabınıza giriş yapın.
        </p>
        <Link className="btn" href="/hesap">
          Hesabıma git
        </Link>
      </section>
    );
  }

  if (state === "missing" || !order) {
    return (
      <section className="panel about-hero order-result">
        <p className="about-eyebrow">Sipariş detayı</p>
        <h1>Sipariş bulunamadı.</h1>
        <p className="about-lede">
          Bu sipariş hesabınıza bağlı değil ya da numara hatalı olabilir.
        </p>
        <Link className="btn" href="/hesap">
          Siparişlerime dön
        </Link>
      </section>
    );
  }

  /*
    Alan eski siparişlerde ve fonksiyon yenilenmeden önce HİÇ GELMEYEBİLİR
    (ArvoARC migration'ı uygulanana kadar); boş dizi sayılıyor, bölüm de
    hiç görünmüyor.
  */
  const gonderiler = order.shipments ?? [];

  return (
    <>
      <section className="panel about-hero detail-hero">
        <nav className="crumbs" aria-label="Konum">
          <Link href="/hesap">Hesabım</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{order.order_number}</span>
        </nav>
        <h1>{order.order_number}</h1>
        <div className="detail-meta">
          <span className="tag tag-soft">
            {STATUS_LABEL[order.status] ?? order.status}
          </span>
          <time dateTime={order.created_at}>
            {formatOrderDate(order.created_at)}
          </time>
        </div>
      </section>

      {/*
        KARGO TAKİBİ. Numara yalnızca e-postada vardı; e-postayı silen ya
        da bulamayan müşteri kargosunu takip edemiyor, destek kanalına
        yazıyordu.

        Her paket AYRI gösteriliyor: sipariş birden çok depodan
        çıkabiliyor ve tek numara göstermek, gelmeyen kalemi kayıp
        sandırırdı. Paketin İÇİNDEKİLER de yazıyor ki hangi ürünün hangi
        kargoda olduğu belli olsun.
      */}
      {gonderiler.length > 0 && (
        <section className="panel">
          <div className="head">
            <h2>{gonderiler.length > 1 ? `Kargo · ${gonderiler.length} paket` : "Kargo"}</h2>
          </div>
          <ul className="order-shipments">
            {gonderiler.map((gonderi) => (
              <li key={gonderi.sequence}>
                <div className="order-shipment-head">
                  <b>
                    {gonderiler.length > 1 ? `${gonderi.sequence}. paket` : "Paketiniz"}
                    {gonderi.carrier ? ` · ${gonderi.carrier}` : ""}
                  </b>
                  <span className="tag tag-soft">
                    {SHIPMENT_STATUS_LABEL[gonderi.status] ?? "Kargoya verildi"}
                  </span>
                </div>

                {gonderi.tracking_number ? (
                  <p className="order-shipment-no">
                    Takip numarası <strong>{gonderi.tracking_number}</strong>
                  </p>
                ) : (
                  <p className="hint">Takip numarası kargo firmasından gelince burada görünecek.</p>
                )}

                {/*
                  Bağlantı UYDURULMUYOR: adres yalnızca ArvoARC'ın
                  kaydettiği değerden geliyor. Firma adından tahmin
                  edilen bir adres, müşteriyi çalışmayan bir sayfaya
                  götürürdü.
                */}
                {gonderi.tracking_url && (
                  <a className="btn btn-ghost" href={gonderi.tracking_url} target="_blank" rel="noreferrer noopener">
                    Kargomu takip et
                  </a>
                )}

                {gonderi.items.length > 0 && (
                  <ul className="order-shipment-items">
                    {gonderi.items.map((kalem, sira) => (
                      <li key={`${gonderi.sequence}-${sira}`}>
                        {kalem.name} <small>{kalem.quantity} adet</small>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
          {gonderiler.length > 1 && (
            <p className="hint">
              Siparişiniz farklı depolardan gönderildiği için birden çok pakette geliyor; paketler ayrı ayrı teslim edilebilir.
            </p>
          )}
        </section>
      )}

      <div className="detail-grid">
        <section className="panel">
          <div className="head">
            <h2>Ürünler</h2>
          </div>
          <ul className="order-items">
            {order.items.map((item, index) => {
              const url = productImageUrl(supabaseUrl, item.image);
              return (
                <li key={`${order.order_number}-${index}`}>
                  <span className="order-thumb">
                    {url ? (
                      <Image src={url} alt="" fill sizes="56px" />
                    ) : (
                      <i aria-hidden="true">{initials(item.name)}</i>
                    )}
                  </span>
                  <span className="order-item-text">
                    {item.slug ? (
                      <Link href={`/urun/${item.slug}`}>{item.name}</Link>
                    ) : (
                      <span>{item.name}</span>
                    )}
                    <small>
                      {item.quantity} adet × {formatPrice(item.unit_price / 100)}
                    </small>
                  </span>
                  <b>{formatPrice(item.total / 100)}</b>
                </li>
              );
            })}
          </ul>

          {/*
            İade talebi. Yalnızca ödemesi tamamlanmış siparişte
            görünüyor; iptal edilmiş siparişte iade edilecek bir
            şey yok.
          */}
          {/*
            Koşul gevşek tutuldu: ödeme durumu kaynağa göre
            farklı yazılabiliyor. İptal ve iade edilmiş
            siparişlerde gösterilmiyor.
          */}
          {/*
            AÇIK TALEP VARKEN FORM GÖSTERİLMİYOR. Önce her zaman
            açıktı: müşteri talebini gönderdikten sonra sayfaya dönünce
            hiçbir iz göremiyor, ikinci kez gönderiyor ve veritabanı
            "zaten açık bir talebiniz var" diye reddediyordu.
          */}
          {iadeler.length > 0 && (
            <div className="order-returns">
              <h2>İade talebiniz</h2>
              {iadeler.map((istek) => {
                const durum = RETURN_STATUS[istek.status] ?? { label: istek.status, detail: "" };
                return (
                  <article className="order-return-card" key={istek.id} data-durum={istek.status}>
                    <div className="order-return-head">
                      <b>{durum.label}</b>
                      <time dateTime={istek.created_at}>{formatOrderDate(istek.created_at)}</time>
                    </div>
                    <p>{durum.detail}</p>

                    {(istek.items ?? []).length > 0 && (
                      <ul className="order-return-items">
                        {(istek.items ?? []).map((kalem, sira) => (
                          <li key={`${istek.id}-${sira}`}>
                            {kalem.name ?? kalem.sku} <small>{kalem.quantity ?? 1} adet</small>
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="order-return-reason"><b>Sebep:</b> {istek.reason}</p>

                    {/*
                      Operasyoncunun notu: iade adresi ve kargo
                      talimatı burada geliyor. Müşterinin ürünü nereye
                      göndereceğini söyleyen tek yer bu.
                    */}
                    {istek.status_note && (
                      <p className="order-return-note"><b>Bizden:</b> {istek.status_note}</p>
                    )}

                    {istek.status === "tamamlandi" && istek.refund_amount ? (
                      <p className="order-return-amount">
                        İade edilen tutar <b>{formatPrice(istek.refund_amount / 100)}</b>
                      </p>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}

          {!["cancelled", "refunded"].includes(order.status) && !iadeler.some((i) => i.status === "beklemede" || i.status === "onaylandi") && (
            <div className="order-return">
              <ReturnRequest
                orderNumber={order.order_number}
                items={order.items.map((item) => ({
                  sku: item.sku ?? "",
                  name: item.name,
                  quantity: item.quantity,
                  total: item.total,
                }))}
                supabaseUrl={supabaseUrl}
                supabaseKey={supabaseKey}
              />
            </div>
          )}
        </section>

        <aside className="panel detail-side">
          <div className="head">
            <h2>Özet</h2>
          </div>

          <dl className="order-totals">
            <div>
              <dt>Ara toplam</dt>
              <dd>{formatPrice(order.subtotal / 100)}</dd>
            </div>
            {order.discount > 0 && (
              <div className="is-discount">
                <dt>
                  İndirim{order.coupon_code ? ` (${order.coupon_code})` : ""}
                </dt>
                <dd>−{formatPrice(order.discount / 100)}</dd>
              </div>
            )}
            <div>
              <dt>Kargo</dt>
              <dd>
                {order.shipping > 0
                  ? formatPrice(order.shipping / 100)
                  : "Ücretsiz"}
              </dd>
            </div>
            <div className="is-total">
              <dt>Toplam</dt>
              <dd>{formatPrice(order.total / 100)}</dd>
            </div>
          </dl>

          <AddressBlock label="Teslimat adresi" address={order.address} />

          {/* Fatura adresi teslimatla aynıysa tekrar gösterilmez. */}
          {order.billing_address &&
            order.billing_address.line !== order.address?.line && (
              <AddressBlock
                label="Fatura adresi"
                address={order.billing_address}
              />
            )}

          {order.billing_address &&
            order.billing_address.line === order.address?.line && (
              <p className="hint">Fatura adresi teslimat adresiyle aynı.</p>
            )}

          {order.note && (
            <div className="order-address">
              <small>Sipariş notu</small>
              <p>{order.note}</p>
            </div>
          )}

          <Link className="btn btn-ghost btn-block" href="/hesap">
            Siparişlerime dön
          </Link>
        </aside>
      </div>
    </>
  );
}

/** Adres bloğu. Kurumsal fatura alanları varsa onları da yazar. */
function AddressBlock({
  label,
  address,
}: {
  label: string;
  address: OrderAddress | null;
}) {
  if (!address?.line) return null;

  return (
    <div className="order-address">
      <small>{label}</small>
      <p>
        {address.name && (
          <>
            <b>{address.name}</b>
            {address.phone ? ` · ${address.phone}` : ""}
            <br />
          </>
        )}
        {address.line}
        <br />
        {address.district && address.district !== "-"
          ? `${address.district} / `
          : ""}
        {address.city}
        {address.postal ? ` · ${address.postal}` : ""}
        {address.company && (
          <>
            <br />
            {address.company}
            {address.tax_office ? ` · ${address.tax_office}` : ""}
            {address.tax_number ? ` · ${address.tax_number}` : ""}
          </>
        )}
      </p>
    </div>
  );
}
