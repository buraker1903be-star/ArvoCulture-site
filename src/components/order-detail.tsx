"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAuthClient } from "@/lib/auth-client";
import { formatPrice } from "@/lib/product-types";
import {
  formatOrderDate,
  productImageUrl,
  STATUS_LABEL,
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

      const { data, error } = await supabase.rpc("get_arvoculture_my_orders");
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
      <section className="panel order-result">
        <h1>Giriş yapmanız gerekiyor</h1>
        <p>Sipariş detayını görmek için hesabınıza giriş yapın.</p>
        <Link className="btn" href="/hesap">
          Hesabıma git
        </Link>
      </section>
    );
  }

  if (state === "missing" || !order) {
    return (
      <section className="panel order-result">
        <h1>Sipariş bulunamadı</h1>
        <p>
          Bu sipariş hesabınıza bağlı değil ya da numara hatalı olabilir.
        </p>
        <Link className="btn" href="/hesap">
          Siparişlerime dön
        </Link>
      </section>
    );
  }

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
