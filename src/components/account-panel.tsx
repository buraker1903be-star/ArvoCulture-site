"use client";

import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { AddressBook } from "@/components/address-book";
import { OrderCard } from "@/components/order-card";
import type { Order } from "@/lib/order-types";

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
  /*
    SİPARİŞLER OKUNAMADI, "SİPARİŞ YOK" DEĞİL (17.10.2026).

    Okuma hatasında liste boş diziye çekiliyordu ve ekran "Henüz
    siparişiniz görünmüyor" diyordu. Geçici bir arızada, siparişi
    olan müşteriye siparişi olmadığını söylemek demekti bu — hem
    yanlış hem telaş verici. Boş liste ile okunamamış liste ayrı
    tutuluyor.
  */
  const [siparisOkunamadi, setSiparisOkunamadi] = useState(false);

  /* Şifre görünür mü: yazım hatasını görmenin tek yolu. */
  const [sifreAcik, setSifreAcik] = useState(false);
  /*
    Hangi sağlayıcıya yönlendiriliyoruz.

    Düğme yalnızca PASİFLEŞİYORDU: müşteri tıklıyor, yazı değişmiyor
    ve tarayıcı sayfadan ayrılana kadar bir-iki saniye hiçbir şey
    olmuyormuş gibi duruyor — özellikle Facebook'un giriş sayfası
    ağır yüklendiğinde. "Çalışmadı" sanıp tekrar tıklıyor.
  */
  const [yonlendirilen, setYonlendirilen] = useState<
    "google" | "facebook" | null
  >(null);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaved, setProfileSaved] = useState(false);

  /*
    Şifre sıfırlama akışı. Supabase’in kurtarma bağlantısı
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

    const { data, error } = await supabase.rpc("arc_storefront_my_orders", { p_host: tarayiciKonagi() });
    if (error) {
      console.error(error);
      setSiparisOkunamadi(true);
      setOrders(null);
      return;
    }
    setSiparisOkunamadi(false);
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
    setProfilePhone(String(meta.phone ?? ""));
    /* loadOrders eşzamansızdır; durum güncellemesi ağ isteği
       döndükten sonra olur. */
    void loadOrders();
  }, [session, loadOrders]);

  /* --- Form --- */
  async function submit() {
    setBusy(true);
    setMessage(null);
    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    try {
      /*
        Kayıt ve şifre sıfırlama e-postaları ArvoARC üzerinden
        gönderiliyor. Supabase’in kendi gönderimi proje geneli
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

  /*
    SAĞLAYICIDAN HATAYLA DÖNÜŞ.

    Müşteri Google ekranında "iptal" derse ya da sağlayıcı reddederse
    adrese `error_description` eklenerek geri dönülüyor. Panel bunu
    okumazsa müşteri hiçbir şey olmamış gibi aynı formla karşılaşıyor
    ve neden giremediğini anlamıyor.

    İşaret adresten TEMİZLENİYOR: sayfa yenilendiğinde eski hata
    yeniden görünmemeli.
  */
  useEffect(() => {
    const kaynaklar = [window.location.hash.slice(1), window.location.search.slice(1)];
    for (const kaynak of kaynaklar) {
      if (!kaynak) continue;
      const alanlar = new URLSearchParams(kaynak);
      const aciklama = alanlar.get("error_description") ?? alanlar.get("error");
      if (!aciklama) continue;
      /* Tek seferlik: adresteki işaret hemen siliniyor, yani
         zincirleme render doğmuyor. */
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessage({ kind: "error", text: translateAuthError(aciklama) });
      window.history.replaceState(null, "", window.location.pathname);
      break;
    }
  }, []);

  /*
    SOSYAL GİRİŞ.

    Supabase sağlayıcıyı kendi tarafında açtığı için burada yapılan
    tek şey yönlendirme. Dönüş adresi MÜŞTERİNİN BULUNDUĞU SAYFA:
    giriş alışverişin ortasında yapılıyor ve /hesap'a düşürmek,
    menüyü sayfa yerine açmakla kazanılanı geri verirdi.

    Sağlayıcı Supabase'de açık değilse dönen hata İngilizce ve
    teknik ("Unsupported provider"); müşteriye ne yapacağını
    söylemiyor, bu yüzden çevriliyor (translateAuthError).
  */
  async function sosyalGiris(saglayici: "google" | "facebook") {
    setBusy(true);
    setYonlendirilen(saglayici);
    setMessage(null);
    try {
      const supabase = getAuthClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: saglayici,
        options: {
          redirectTo: `${window.location.origin}${window.location.pathname}`,
          /*
            HESAP SEÇTİRİLİYOR. Google varsayılan olarak tarayıcıda
            açık olan hesapla sessizce giriyor; ortak kullanılan bir
            bilgisayarda müşteri başkasının hesabıyla giriş yapmış
            oluyor ve bunu ancak siparişlerinde fark ediyor.
            Facebook'ta karşılığı yok, bu yüzden yalnızca Google'a
            veriliyor.
          */
          ...(saglayici === "google"
            ? { queryParams: { prompt: "select_account" } }
            : {}),
        },
      });
      if (error) throw error;
      /* Yönlendirme başlıyor; `busy` açık kalıyor ki müşteri
         ikinci kez tıklamasın. */
    } catch (error) {
      setMessage({
        kind: "error",
        text: translateAuthError((error as Error).message),
      });
      setBusy(false);
      setYonlendirilen(null);
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

          {orders === null && !siparisOkunamadi && (
            <p className="hint">Siparişler yükleniyor…</p>
          )}

          {siparisOkunamadi && (
            <p className="form-error" role="alert">
              Siparişleriniz şu anda alınamadı; yerinde duruyorlar.{" "}
              <button type="button" className="link-button" onClick={() => void loadOrders()}>
                Tekrar dene
              </button>
            </p>
          )}

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

      {/*
        GERÇEK BİR <form>.

        Alanlar ve düğme serbest duruyordu; Enter yalnızca ŞİFRE
        alanında işe yarıyordu (oraya elle bir tuş dinleyicisi
        konmuştu) ve e-posta alanında Enter'a basan müşteriye
        hiçbir şey olmuyordu. Form olunca Enter her alanda
        gönderiyor, tarayıcı ve şifre yöneticileri de alanları
        doğru tanıyor.
      */}
      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        {/*
        NE İŞE YARADIĞI YAZIYOR.

        Panelde yalnızca iki alan ve bir düğme vardı; üye olmanın
        ne kazandırdığı hiçbir yerde söylenmiyordu. Üyelik zorunlu
        değil — misafir alışveriş açık — yani bu satır bir uyarı
        değil, davet.
      */}
      <p className="auth-lede">
        {mode === "register"
          ? "Bir sonraki alışveriş tek adımda bitsin."
          : mode === "reset"
            ? "Şifrenizi yenilemeniz için bağlantı gönderelim."
            : "Siparişleriniz ve adres defteriniz tek yerde."}
      </p>

      <div className="fields auth-fields">
          <label className="wide">
            E-posta
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              /* Yer tutucu biçimi gösteriyor: boş bir kutu neyin
                 beklendiğini söylemiyordu. */
              placeholder="ornek@eposta.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          {mode !== "reset" && (
            <label className="wide auth-password">
              Şifre
              <input
                type={sifreAcik ? "text" : "password"}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                placeholder={
                  mode === "register" ? "En az 8 karakter" : "Şifreniz"
                }
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              {/*
                Şifreyi görmek: telefonda yazılan şifrenin
                doğruluğunu görmenin tek yolu. "Giriş bilgileri
                hatalı" hatalarının önemli bir kısmı yazım hatası.
              */}
              <button
                type="button"
                className="auth-eye"
                onClick={() => setSifreAcik((acik) => !acik)}
                aria-label={sifreAcik ? "Şifreyi gizle" : "Şifreyi göster"}
              >
                {sifreAcik ? "Gizle" : "Göster"}
              </button>
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

      {/*
        Kayıt formunda sözleşme bildirimi. Üyelik Sözleşmesi
        kayıt anında onaylanmış sayılıyor; bunun kullanıcıya
        açıkça söylenmesi gerekiyor.
      */}
      {mode === "register" && (
        <p className="form-note">
          Hesap oluşturarak{" "}
          <a href="/uyelik-sozlesmesi" target="_blank" rel="noreferrer">
            Üyelik Sözleşmesi
          </a>{" "}
          ve{" "}
          <a href="/kvkk-aydinlatma-metni" target="_blank" rel="noreferrer">
            KVKK Aydınlatma Metni
          </a>
          ’ni kabul etmiş sayılırsınız.
        </p>
      )}

      <button
        type="submit"
        className="btn btn-block"
        /* Şifre de zorunlu: eskiden yalnızca e-posta yeterliydi ve
           boş şifreyle gönderilen giriş "bilgiler hatalı" dönüyordu
           — müşteri neyin eksik olduğunu göremiyordu. */
        disabled={busy || !email || (mode !== "reset" && !password)}
      >
        {busy
          ? "Bekleyin…"
          : mode === "register"
            ? "Hesap oluştur"
            : mode === "reset"
              ? "Sıfırlama bağlantısı gönder"
              : "Giriş yap"}
      </button>
      </form>

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
        SOSYAL GİRİŞ.

        Burada "yakında" yazan iki yer tutucu duruyordu. Supabase
        sağlayıcıyı kendi tarafında yönettiği için vitrinde yapılan
        tek şey yönlendirme; sağlayıcı panelde açık değilse dönen
        hata çevriliyor ve müşteriye e-posta ile girmesi söyleniyor
        (translateAuthError).

        Şifresiz giriş terk oranını düşüren en somut şey: hesabı
        olmayan müşteri şifre uydurmak, olan müşteri hatırlamak
        zorunda kalmıyor.
      */}
      <div className="auth-divider">
        <span>ya da</span>
      </div>

      <div className="auth-social">
        <button
          type="button"
          className="btn btn-ghost btn-block"
          disabled={busy}
          onClick={() => void sosyalGiris("google")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="auth-logo">
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2-3.1 0-5.7-2.1-6.6-4.9H1.4v3.1A12 12 0 0 0 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.4 14.4a7.2 7.2 0 0 1 0-4.6V6.7H1.4a12 12 0 0 0 0 10.8l4-3.1z"
            />
            <path
              fill="#EA4335"
              d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A11.5 11.5 0 0 0 12 0 12 12 0 0 0 1.4 6.7l4 3.1C6.3 6.9 8.9 4.8 12 4.8z"
            />
          </svg>
          {yonlendirilen === "google"
            ? "Google'a yönlendiriliyorsunuz…"
            : "Google ile giriş yap"}
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-block"
          disabled={busy}
          onClick={() => void sosyalGiris("facebook")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="auth-logo">
            <path
              fill="#1877F2"
              d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3V9.4c0-3 1.8-4.6 4.5-4.6 1.3 0 2.6.2 2.6.2v2.9h-1.5c-1.5 0-1.9.9-1.9 1.8V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"
            />
          </svg>
          {yonlendirilen === "facebook"
            ? "Facebook'a yönlendiriliyorsunuz…"
            : "Facebook ile giriş yap"}
        </button>
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
    /* Sağlayıcı Supabase'de açılmamış. Müşteriye "desteklenmeyen
       sağlayıcı" demek bir şey anlatmıyor; sorun onda değil. */
    [
      /unsupported provider|provider is not enabled/i,
      "Bu giriş yöntemi şu anda kullanılamıyor. E-posta ile giriş yapabilirsiniz.",
    ],
    /* Müşteri sağlayıcı ekranında vazgeçti; bu bir arıza değil. */
    [/access_denied|user denied|cancell?ed/i, "Giriş iptal edildi."],
    /*
      SAĞLAYICI E-POSTA VERMEDİ.

      Facebook'ta görülebiliyor: hesap yalnızca telefonla açılmışsa
      ya da müşteri e-posta iznini vermezse Supabase'e e-posta
      gelmiyor ve "Allow users without an email" kapalı olduğu için
      giriş reddediliyor. Kapalı olması doğru — siparişler ve
      favoriler e-postaya bağlı — ama müşteriye NE YAPACAĞINI
      söylemek gerekiyor.
    */
    [
      /email.*(not provided|missing|required)|no email|unverified email/i,
      "Hesabınızda doğrulanmış bir e-posta adresi görünmüyor. E-posta ile giriş yapabilir ya da sağlayıcıda e-posta iznini verip tekrar deneyebilirsiniz.",
    ],
    [
      /redirect|not allowed/i,
      "Giriş tamamlanamadı. Lütfen tekrar deneyin ya da e-posta ile girin.",
    ],
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
 * ArvoARC’a gidiyor: bağlantıyı üretmek `service_role` yetkisi
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
