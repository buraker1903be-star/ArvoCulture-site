"use client";

import Link from "next/link";
import { useContext, useEffect, useMemo, useState } from "react";
import { CartContext } from "@/components/cart";
import { formatPrice } from "@/lib/product-types";
import { readCoupon, readNote } from "@/lib/cart-extras";
import { getAuthClient } from "@/lib/auth-client";
import { formatPhone, isValidPhone, phoneDigits } from "@/lib/phone";
import { evaluateCoupon } from "@/lib/coupon";
import type { Address } from "@/components/address-book";

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

export function CheckoutForm({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
}) {
  const { items, total, discounts } = useContext(CartContext);
  const [saved, setSaved] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | "manual">("manual");

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
  // Sepette girilen kupon ve not ödeme isteğine taşınır.
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    /*
      localStorage sunucuda okunamaz; değerler ilk render'dan
      sonra yüklenir.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoupon(readCoupon());
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNote(readNote());
  }, []);

  /*
    Giriş yapmış müşterinin kayıtlı adresleri getirilir ve
    varsayılan olan forma doldurulur. Müşteri her siparişte
    adresini yeniden yazmak zorunda kalmıyor; isterse "Yeni adres"
    seçip elle giriyor.
  */
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    let active = true;

    async function load() {
      const supabase = getAuthClient(supabaseUrl!, supabaseKey!);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !active) return;

      const meta = sessionData.session.user.user_metadata ?? {};

      const { data } = await supabase
        .from("arc_customer_addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (!active) return;

      const list = (data as Address[]) ?? [];
      setSaved(list);

      const preferred = list[0];
      if (preferred) {
        applyAddress(preferred);
        setSelected(preferred.id);
      } else {
        setForm((current) => ({
          ...current,
          name: current.name || String(meta.full_name ?? ""),
          email: current.email || (sessionData.session!.user.email ?? ""),
          phone: current.phone || formatPhone(String(meta.phone ?? "")),
        }));
      }
    }

    void load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabaseUrl, supabaseKey]);

  function applyAddress(address: Address) {
    setForm({
      name: address.full_name,
      email: form.email,
      phone: formatPhone(address.phone),
      city: address.city,
      district: address.district,
      line: address.line,
      postal: address.postal_code ?? "",
    });
  }
  const [message, setMessage] = useState("");

  const shipping = total >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const grand = total + shipping;

  const ready = useMemo(
    () =>
      form.name.trim().length > 2 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email) &&
      isValidPhone(form.phone) &&
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
          phone: `+90${phoneDigits(form.phone)}`,
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
          couponCode: coupon || null,
          note: note || null,
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

          {saved.length > 0 && (
            <div className="address-picker">
              {saved.map((address) => (
                <button
                  type="button"
                  key={address.id}
                  aria-pressed={selected === address.id}
                  onClick={() => {
                    applyAddress(address);
                    setSelected(address.id);
                  }}
                >
                  <strong>
                    {address.title}
                    {(address.tax_number ?? address.company_name) && (
                      <em> / Kurumsal fatura</em>
                    )}
                  </strong>
                  <small>
                    {address.line} · {address.district} / {address.city}
                  </small>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={selected === "manual"}
                onClick={() => {
                  setSelected("manual");
                  setForm({
                    ...form,
                    city: "",
                    district: "",
                    line: "",
                    postal: "",
                  });
                }}
              >
                <strong>Yeni adres</strong>
                <small>Elle girmek istiyorum</small>
              </button>
            </div>
          )}

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
              <input
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="+90 (5XX) XXX XX XX"
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: formatPhone(event.target.value) })
                }
              />
              {form.phone && !isValidPhone(form.phone) && (
                <small className="field-warn">
                  Cep telefonu 5 ile başlayan 10 haneli olmalı.
                </small>
              )}
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
