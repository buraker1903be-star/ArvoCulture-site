"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { AddressBook } from "@/components/address-book";
import { formatPrice } from "@/lib/product-types";

type Mode = "login" | "register" | "reset";

type Order = {
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  currency: string;
  coupon_code: string | null;
  address: {
    line?: string;
    district?: string;
    city?: string;
    postal?: string;
  };
  created_at: string;
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    unit_price: number;
    total: number;
    slug: string | null;
    image: string | null;
  }>;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Ödeme bekleniyor",
  confirmed: "Hazırlanıyor",
  processing: "Hazırlanıyor",
  fulfilled: "Teslim edildi",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
  refunded: "İade edildi",
};



/**
 * Müşteri hesap paneli.
 *
 * Oturum tarayıcıda tutulur; siparişler `get_arvoculture_my_orders`
 * RPC'siyle çekilir. O fonksiyon `auth.uid()` üzerinden çalıştığı
 * için müşteri yalnızca kendi siparişlerini görebilir — sipariş
 * numarası tahmin ederek başkasının siparişine erişmek mümkün
 * değildir.
 */
export function AccountPanel({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [orders, setOrders] = useState<Order[] | null>(null);

  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    kind: "error" | "info";
    text: string;
  } | null>(null);

  const configured = Boolean(supabaseUrl && supabaseKey);

  /* --- Oturum takibi --- */
  useEffect(() => {
    // Yapılandırma eksikse istemci hiç kurulmaz; panel uyarı
    // gösterir ve sayfa çökmez.
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, next) => setSession(next),
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabaseUrl, supabaseKey]);

  /* --- Siparişleri getir --- */
  const loadOrders = useCallback(async () => {
    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    // Kayıt öncesi misafir siparişleri varsa hesaba bağlanır.
    await supabase.rpc("claim_arvoculture_orders");

    const { data, error } = await supabase.rpc("get_arvoculture_my_orders");
    if (error) {
      console.error(error);
      setOrders([]);
      return;
    }
    setOrders((data as Order[]) ?? []);
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    if (!session) return;
    const meta = session.user.user_metadata ?? {};
    /*
      Profil alanları oturumdan doldurulur. Kural bunu zincirleme
      render riski sayıyor; burada tek seferlik bir başlangıç
      değeri olduğu için güvenli.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfileName(String(meta.full_name ?? ""));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProfilePhone(String(meta.phone ?? ""));
    /*
      loadOrders eşzamansızdır; durum güncellemesi ağ isteği
      döndükten sonra olur. Kural bunu ayırt edemediği için
      burada bilinçli olarak kapatılıyor.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadOrders();
  }, [session, loadOrders]);

  /* --- Form --- */
  async function submit() {
    setBusy(true);
    setMessage(null);
    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/hesap`,
        });
        if (error) throw error;
        setMessage({
          kind: "info",
          text: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        });
        return;
      }

      if (mode === "register") {
        if (password.length < 8) {
          setMessage({
            kind: "error",
            text: "Şifreniz en az 8 karakter olmalı.",
          });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/hesap` },
        });
        if (error) throw error;
        setMessage({
          kind: "info",
          text: "Doğrulama bağlantısı e-posta adresinize gönderildi. Bağlantıya tıkladıktan sonra giriş yapabilirsiniz.",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setMessage({
        kind: "error",
        text: translateAuthError((error as Error).message),
      });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    await getAuthClient(supabaseUrl, supabaseKey).auth.signOut();
    setOrders(null);
    setEmail("");
    setPassword("");
  }

  if (!configured) {
    return (
      <section className="panel">
        <h2>Hesap sistemi hazırlanıyor</h2>
        <p className="hint" style={{ marginTop: "var(--s2)" }}>
          Üyelik özelliği kısa süre içinde açılacak. Bu sırada misafir
          olarak alışveriş yapabilir, siparişinizi numarasıyla takip
          edebilirsiniz.
        </p>
      </section>
    );
  }

  if (!ready) {
    return (
      <section className="panel">
        <p className="hint">Yükleniyor…</p>
      </section>
    );
  }

  /* --- Giriş yapılmış --- */
  if (session) {
    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    async function saveProfile() {
      setProfileSaved(false);
      const { error } = await supabase.rpc("update_arvoculture_profile", {
        p_full_name: profileName,
        p_phone: profilePhone,
      });
      if (!error) setProfileSaved(true);
    }

    return (
      <div className="account-shell">
        <div className="account-bar">
          <div>
            <strong>{session.user.email}</strong>
            <small>Hesabınıza giriş yaptınız</small>
          </div>
          <button type="button" className="linklike" onClick={signOut}>
            Çıkış yap
          </button>
        </div>

        {/*
          Sekme yerine tek sayfa: hesap bilgileri ve adresler üstte
          yan yana, siparişler altta tam genişlikte. Müşteri
          aradığını sekme değiştirmeden görüyor.
        */}
        <div className="account-top">
          <section className="panel">
            <div className="head">
              <div>
                <h2>Hesap bilgilerim</h2>
                <p>Sipariş formlarında bu bilgiler önerilir.</p>
              </div>
            </div>

            <div className="fields">
              <label className="wide">
                Ad soyad
                <input
                  type="text"
                  autoComplete="name"
                  value={profileName}
                  onChange={(event) => setProfileName(event.target.value)}
                />
              </label>
              <label className="wide">
                Telefon
                <input
                  type="tel"
                  autoComplete="tel"
                  value={profilePhone}
                  onChange={(event) => setProfilePhone(event.target.value)}
                />
              </label>
              <label className="wide">
                E-posta
                <input type="email" value={session.user.email ?? ""} disabled />
              </label>
            </div>

            {profileSaved && (
              <p className="form-note">Bilgileriniz kaydedildi.</p>
            )}

            <button
              type="button"
              className="btn"
              style={{ justifySelf: "start" }}
              onClick={saveProfile}
            >
              Kaydet
            </button>
          </section>

          <AddressBook supabase={supabase} />
        </div>

        <section className="panel">
          <div className="head">
            <div>
              <h2>Siparişlerim</h2>
              <p>Geçmiş siparişleriniz ve tüm detayları.</p>
            </div>
          </div>

          {orders === null && <p className="hint">Siparişler yükleniyor…</p>}

          {orders?.length === 0 && (
            <p className="hint">
              Henüz siparişiniz görünmüyor. Misafir olarak sipariş
              verdiyseniz, aynı e-posta adresini doğruladığınızda
              siparişleriniz burada listelenir.
            </p>
          )}

          {orders && orders.length > 0 && (
            <ul className="order-list">
              {orders.map((order) => (
                <li key={order.order_number}>
                  <div className="order-head">
                    <strong>{order.order_number}</strong>
                    <span className="tag tag-soft">
                      {STATUS_LABEL[order.status] ?? order.status}
                    </span>
                    <time dateTime={order.created_at}>
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }).format(new Date(order.created_at))}
                    </time>
                    <b>{formatPrice(order.total / 100)}</b>
                  </div>

                  {/* Kalemler görselleriyle. */}
                  <ul className="order-items">
                    {order.items.map((item, index) => (
                      <li key={`${order.order_number}-${index}`}>
                        <span className="order-thumb">
                          {item.image && (
                            <Image
                              src={`${supabaseUrl}/storage/v1/object/public/arc-product-images/${item.image}`}
                              alt=""
                              fill
                              sizes="56px"
                            />
                          )}
                        </span>
                        <span className="order-item-text">
                          {item.slug ? (
                            <a href={`/urun/${item.slug}`}>{item.name}</a>
                          ) : (
                            <span>{item.name}</span>
                          )}
                          <small>
                            {item.quantity} adet ×{" "}
                            {formatPrice(item.unit_price / 100)}
                          </small>
                        </span>
                        <b>{formatPrice(item.total / 100)}</b>
                      </li>
                    ))}
                  </ul>

                  {/* Tutar dökümü ve teslimat adresi. */}
                  <div className="order-foot">
                    <dl className="order-totals">
                      <div>
                        <dt>Ara toplam</dt>
                        <dd>{formatPrice(order.subtotal / 100)}</dd>
                      </div>
                      {order.discount > 0 && (
                        <div className="is-discount">
                          <dt>
                            İndirim
                            {order.coupon_code ? ` (${order.coupon_code})` : ""}
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

                    {order.address?.line && (
                      <div className="order-address">
                        <small>Teslimat adresi</small>
                        <p>
                          {order.address.line}
                          <br />
                          {order.address.district} / {order.address.city}
                          {order.address.postal
                            ? ` · ${order.address.postal}`
                            : ""}
                        </p>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    );
  }

  /* --- Giriş formu --- */
  return (
    <section className="panel auth-panel">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => setMode("login")}
        >
          Giriş yap
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          onClick={() => setMode("register")}
        >
          Hesap oluştur
        </button>
      </div>

      <div className="fields auth-fields">
        <label className="wide">
          E-posta
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>

        {mode !== "reset" && (
          <label className="wide">
            Şifre
            <input
              type="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void submit();
              }}
            />
          </label>
        )}
      </div>

      {message && (
        <p
          className={message.kind === "error" ? "form-error" : "form-note"}
          role="alert"
        >
          {message.text}
        </p>
      )}

      <button
        type="button"
        className="btn btn-block"
        disabled={busy || !email}
        onClick={submit}
      >
        {busy
          ? "Bekleyin…"
          : mode === "register"
            ? "Hesap oluştur"
            : mode === "reset"
              ? "Sıfırlama bağlantısı gönder"
              : "Giriş yap"}
      </button>

      <div className="auth-alt">
        {mode === "reset" ? (
          <button type="button" className="linklike" onClick={() => setMode("login")}>
            Girişe dön
          </button>
        ) : (
          <button type="button" className="linklike" onClick={() => setMode("reset")}>
            Şifremi unuttum
          </button>
        )}
      </div>

      {/*
        Sosyal giriş. Supabase Auth destekliyor ama her sağlayıcı
        için OAuth uygulaması açılıp anahtarların Supabase'e
        girilmesi gerekiyor. Hazır olmadan buton koymuyoruz.
      */}
      <div className="soon-social" aria-label="Yakında eklenecek giriş yöntemleri">
        <span>Google ile giriş — yakında</span>
        <span>Facebook ile giriş — yakında</span>
      </div>
    </section>
  );
}

/** Supabase hata metinleri İngilizce döner; sık görülenleri çeviririz. */
function translateAuthError(message: string) {
  const map: Array<[RegExp, string]> = [
    [/invalid login credentials/i, "E-posta veya şifre hatalı."],
    [/email not confirmed/i, "E-posta adresinizi doğrulamanız gerekiyor."],
    [/user already registered/i, "Bu e-posta ile zaten bir hesap var."],
    [/password should be at least/i, "Şifreniz en az 8 karakter olmalı."],
    [/rate limit|too many/i, "Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin."],
    [/invalid email/i, "Geçerli bir e-posta adresi girin."],
  ];

  for (const [pattern, text] of map) {
    if (pattern.test(message)) return text;
  }
  return "Bir sorun oluştu. Lütfen tekrar deneyin.";
}
