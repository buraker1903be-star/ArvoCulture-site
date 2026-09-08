"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { AddressBook } from "@/components/address-book";
import { OrderCard } from "@/components/order-card";
import type { Order } from "@/lib/order-types";
import { formatPrice } from "@/lib/product-types";

type Mode = "login" | "register" | "reset";





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

  /*
    Şifre sıfırlama akışı. Supabase'in kurtarma bağlantısı
    kullanıcıyı geçici olarak oturum açtırıyor; yeni şifre
    belirlenmezse müşteri eski şifresiyle kalıyor ve bir daha
    giremiyor.

    Bağlantıdan gelindiği `PASSWORD_RECOVERY` olayıyla anlaşılır.
  */
  const [recovering, setRecovering] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordDone, setNewPasswordDone] = useState(false);

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
      (event, next) => {
        setSession(next);
        if (event === "PASSWORD_RECOVERY") setRecovering(true);
      },
    );

    /*
      Olay hidrasyondan önce tetiklenmiş olabilir. Adres
      çubuğundaki bağlantı türü de kontrol edilir.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (window.location.hash.includes("type=recovery")) setRecovering(true);

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
      /*
        Kayıt ve şifre sıfırlama e-postaları ARC üzerinden
        gönderiliyor. Supabase'in kendi gönderimi proje geneli
        SMTP ayarını kullanıyor ve o ayar ArvoARC panelinden
        giden personel e-postalarını da etkiliyor; müşteriye
        giden e-postalar ArvoCulture kimliğinde olmalı.
      */
      if (mode === "reset") {
        await requestAuthEmail({ islem: "sifirla", email });
        setMessage({
          kind: "info",
          text: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin.",
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

        await requestAuthEmail({ islem: "kayit", email, sifre: password });
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

    async function savePassword() {
      if (newPassword.length < 8) {
        setMessage({
          kind: "error",
          text: "Şifreniz en az 8 karakter olmalı.",
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        setMessage({
          kind: "error",
          text: "Şifre güncellenemedi. Bağlantının süresi dolmuş olabilir.",
        });
        return;
      }

      setNewPassword("");
      setNewPasswordDone(true);
      setRecovering(false);
      setMessage(null);
    }

    return (
      <div className="account-shell">
        {/* Sıfırlama bağlantısından gelindiyse yeni şifre istenir. */}
        {recovering && (
          <section className="panel">
            <div className="head">
              <div>
                <h2>Yeni şifrenizi belirleyin</h2>
                <p>En az 8 karakter olmalı.</p>
              </div>
            </div>

            <div className="fields">
              <label className="wide">
                Yeni şifre
                <input
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void savePassword();
                  }}
                />
              </label>
            </div>

            {message?.kind === "error" && (
              <p className="form-error" role="alert">
                {message.text}
              </p>
            )}

            <button
              type="button"
              className="btn"
              style={{ justifySelf: "start" }}
              onClick={savePassword}
            >
              Şifremi güncelle
            </button>
          </section>
        )}

        {newPasswordDone && (
          <p className="form-note">
            Şifreniz güncellendi. Bundan sonra yeni şifrenizle giriş
            yapabilirsiniz.
          </p>
        )}

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
    [/gecersiz_eposta/, "Geçerli bir e-posta adresi girin."],
    [/kisa_sifre/, "Şifreniz en az 8 karakter olmalı."],
    [/islem_basarisiz/, "E-posta gönderilemedi. Lütfen tekrar deneyin."],
  ];

  for (const [pattern, text] of map) {
    if (pattern.test(message)) return text;
  }
  return "Bir sorun oluştu. Lütfen tekrar deneyin.";
}

/**
 * Kayıt ve şifre sıfırlama e-postası isteği.
 *
 * ARC'a gidiyor: bağlantıyı üretmek `service_role` yetkisi
 * gerektiriyor ve o anahtar tarayıcıya konulamaz.
 */
async function requestAuthEmail(payload: {
  islem: "kayit" | "sifirla";
  email: string;
  sifre?: string;
}) {
  const response = await fetch(
    "https://arc.arvo-os.com/api/storefront/kimlik",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(data.error ?? "islem_basarisiz");
  }
}
