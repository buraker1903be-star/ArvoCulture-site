"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/product-types";
import {
  formatOrderDate,
  productImageUrl,
  STATUS_LABEL,
  type Order,
} from "@/lib/order-types";

/**
 * Sipariş kartı.
 *
 * Liste yerine kart: her sipariş kendi kutusunda, ürün görselleri
 * küçük bir şerit hâlinde. Müşteri hangi siparişin ne olduğunu
 * içeriğini okumadan görselden tanıyor. Tıklayınca detay sayfası
 * açılıyor.
 */
export function OrderCard({
  order,
  supabaseUrl,
}: {
  order: Order;
  supabaseUrl: string;
}) {
  const shown = order.items.slice(0, 4);
  const rest = order.items.length - shown.length;

  return (
    <Link
      href={`/hesap/siparis/${encodeURIComponent(order.order_number)}`}
      className="order-card"
    >
      <div className="order-card-head">
        <strong>{order.order_number}</strong>
        <span className="tag tag-soft">
          {STATUS_LABEL[order.status] ?? order.status}
        </span>
      </div>

      <div className="order-card-thumbs">
        {shown.map((item, index) => {
          const url = productImageUrl(supabaseUrl, item.image);
          return (
            <span key={`${order.order_number}-${index}`}>
              {url && <Image src={url} alt="" fill sizes="52px" />}
            </span>
          );
        })}
        {rest > 0 && <em>+{rest}</em>}
      </div>

      <div className="order-card-foot">
        <time dateTime={order.created_at}>
          {formatOrderDate(order.created_at)}
        </time>
        <b>{formatPrice(order.total / 100)}</b>
      </div>
    </Link>
  );
}
