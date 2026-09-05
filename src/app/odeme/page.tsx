"use client";

import Link from "next/link";
import { useContext, useMemo, useState } from "react";
import { CartContext } from "@/components/cart";
import { formatPrice } from "@/lib/product-types";

/**
 * Ödeme sayfası.
 *
 * Buradaki tutarlar yalnızca müşteriye gösterim içindir. Gerçek
 * tutar ARC'ta, veritabanındaki fiyatlardan hesaplanır ve PayTR'a
 * giden tutar odur. Bu sayfadan gönderilen tek bilgi hangi ürünün
 * kaç adet istendiğidir.
 */

const ARC_URL = "https://arc.arvo-os.com";

/** Kargo kuralı ARC'taki fonksiyonla aynı tutulmalıdır. */
const SHIPPING_FEE = 120;
const FREE_SHIPPING_OVER = 2000;

export default function CheckoutPage() {
  const { items, total } = useContext(CartContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    line: "",
    postal: "",
  });
  const [consents, setConsents] = useState({
    distance: false,
    preInfo: false,
    privacy: false,
  });
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState("");

  const shipping = total >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const grand = total + shipping;

  const ready = useMemo(
    () =>
      form.name.trim().length > 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email) &&
      form.phone.replace(/\D/g, "").length >= 10 &&
      form.city.trim().length > 1 &&
      form.district.trim().length > 1 &&
      form.line.trim().length > 8 &&
      consents.distance &&
      consents.preInfo &&
      consents.privacy &&
      items.length > 0,
    [form, consents, items],
  );

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setForm({ ...form, [key]: event.target.value }),
    };
  }

  async function submit() {
    setState("sending");
    setMessage("");

    try {
      const response = await fetch(`${ARC_URL}/api/storefront/odeme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          phone: form.phone,
          address: {
            line: form.line,
            district: form.district,
            city: form.city,
            postal: form.postal,
            country: "TR",
          },
          items: items.map((item) => ({
            sku: item.slug,
            quantity: item.quantity,
            name: item.name,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.iframeUrl) {
        setState("error");
        setMessage(
          data.message ??
            "Ödeme başlatılamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
        );
        return;
      }

      window.location.href = data.iframeUrl;
    } catch {
      setState("error");
      setMessage("Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.");
    }
  }

  if (items.length === 0) {
    return (
      <main className="shell">
        <h1>Sepetiniz boş</h1>
        <p>Ödeme adımına geçmek için sepetinize ürün ekleyin.</p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Alışverişe başla
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="panel panel-tight"><h1 style={{ fontSize: "var(--t-h2)" }}>Ödeme</h1></div>

      <div className="checkout">
        <section className="panel">
          <h2>Teslimat bilgileri</h2>
          <p className="hint">
            Üye olmadan devam edebilirsiniz. Sipariş takibi, e-posta adresinize
            gönderilen sipariş numarasıyla yapılır.
          </p>

          <div className="fields">
            <label>
              Ad soyad
              <input type="text" autoComplete="name" {...field("name")} />
            </label>
            <label>
              E-posta
              <input type="email" autoComplete="email" {...field("email")} />
            </label>
            <label>
              Telefon
              <input type="tel" autoComplete="tel" {...field("phone")} />
            </label>
            <label>
              Posta kodu
              <input
                type="text"
                inputMode="numeric"
                autoComplete="postal-code"
                {...field("postal")}
              />
            </label>
            <label>
              İl
              <input
                type="text"
                autoComplete="address-level1"
                {...field("city")}
              />
            </label>
            <label>
              İlçe
              <input
                type="text"
                autoComplete="address-level2"
                {...field("district")}
              />
            </label>
            <label className="wide">
              Açık adres
              <textarea
                rows={3}
                autoComplete="street-address"
                {...field("line")}
              />
            </label>
          </div>

          <h2>Onaylar</h2>
          <div className="consents">
            <label>
              <input
                type="checkbox"
                checked={consents.preInfo}
                onChange={(event) =>
                  setConsents({ ...consents, preInfo: event.target.checked })
                }
              />
              <span>
                <Link href="/on-bilgilendirme-formu" target="_blank">
                  Ön Bilgilendirme Formu
                </Link>
                &apos;nu okudum ve onaylıyorum.
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={consents.distance}
                onChange={(event) =>
                  setConsents({ ...consents, distance: event.target.checked })
                }
              />
              <span>
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank">
                  Mesafeli Satış Sözleşmesi
                </Link>
                &apos;ni okudum ve kabul ediyorum.
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={consents.privacy}
                onChange={(event) =>
                  setConsents({ ...consents, privacy: event.target.checked })
                }
              />
              <span>
                <Link href="/kvkk-aydinlatma-metni" target="_blank">
                  KVKK Aydınlatma Metni
                </Link>
                &apos;ni okudum.
              </span>
            </label>
          </div>
        </section>

        <aside className="panel summary">
          <h2>Sipariş özeti</h2>

          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.slug}>
                <span>
                  {item.name} <small>× {item.quantity}</small>
                </span>
                <b>{formatPrice(item.price * item.quantity)}</b>
              </li>
            ))}
          </ul>

          <dl className="summary-totals">
            <div>
              <dt>Ara toplam</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
            <div>
              <dt>Kargo</dt>
              <dd>{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</dd>
            </div>
            <div className="grand">
              <dt>Toplam</dt>
              <dd>{formatPrice(grand)}</dd>
            </div>
          </dl>

          {shipping > 0 && (
            <p className="hint">
              {formatPrice(FREE_SHIPPING_OVER - total)} daha ekleyin, kargo
              ücretsiz olsun.
            </p>
          )}

          <button
            type="button"
            className="btn btn-block"
            disabled={!ready || state === "sending"}
            onClick={submit}
          >
            {state === "sending" ? "Yönlendiriliyor…" : "Ödemeye geç"}
          </button>

          {state === "error" && (
            <p className="form-error" role="alert">
              {message}
            </p>
          )}

          <p className="hint">
            Ödeme, 3D Secure korumalı PayTR altyapısı üzerinden alınır. Kart
            bilgileriniz bizim sunucularımıza hiçbir aşamada ulaşmaz.
          </p>
        </aside>
      </div>
    </main>
  );
}
