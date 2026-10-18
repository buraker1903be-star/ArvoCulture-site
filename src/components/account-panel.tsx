"use client";

import { useRouter } from "next/navigation";
import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { AddressBook } from "@/components/address-book";
import { OrderCard } from "@/components/order-card";
import { AccountMenuHome, selamAdi } from "@/components/account-menu-home";
import { ProfilKarti } from "@/components/profil-karti";
import { HesapOzeti } from "@/components/hesap-ozeti";
import { HesapYanMenu } from "@/components/hesap-yan-menu";
import { HesapOzetBolumu } from "@/components/hesap-ozet-bolumu";
import type { Order } from "@/lib/order-types";

type Mode = "login" | "register" | "reset";

/*
  FACEBOOK DÜĞMESİ KAPALI (18.10.2026).

  Kurulum tamam: Meta uygulaması açık, Supabase sağlayıcısı bağlı,
  yönlendirme doğru çalışıyor. Kapalı olmasının sebebi ürün
  kararı:

  * App Review bitene kadar düğme YALNIZCA uygulamada rolü olan
    hesaplarla çalışıyor; müşteri tıklayıp hata alıyor ve bu, tam
    dönüşüm anında güven kaybı. Çalışmayan bir düğme, olmayan
    düğmeden kötü.
  * Facebook telefonla açılmış hesaplarda e-posta döndürmüyor;
    siparişler ve favoriler e-postaya bağlı olduğu için o müşteri
    çıkmaza giriyor.
  * Meta tarafı sürekli bakım istiyor (izin değişiminde yeniden
    inceleme, işletme doğrulamasının güncelliği, veri işleme
    beyanları).

  AÇMAK İÇİN: bu değeri `true` yapmak yeterli. Supabase ve Meta
  ayarları yerinde duruyor, başka hiçbir şey gerekmiyor.
*/
const FACEBOOK_ACIK = false;

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
  menuBicimi = false,
  cikisBitti,
  kuponSayisi = 0,
  bolum = "ozet",
  children,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  /**
   * Başlıktaki hesap menüsü için KISA giriş sonrası görünüm.
   *
   * Menü, giriş yapılmış müşteriye hesap sayfasının TAMAMINI
   * basıyordu: profil formu, adres defteri ve sipariş listesi
   * 27rem'lik bir açılır menüye sıkışıyor, sütunlar üst üste
   * biniyordu (canlıda görüldü). Menüde olması gereken şey sayfa
   * değil, sayfaya giden kısa bir liste.
   */
  menuBicimi?: boolean;
  /**
   * Çıkış tamamlandı — menü biçiminde kabı kapatmak için.
   *
   * Menü, çıkıştan sonra aynı yerde giriş formuna dönüyordu:
   * çıkmak isteyen müşterinin önüne hemen "Giriş yap / Hesap
   * oluştur" açılıyordu. Sayfa görünümünde böyle bir sorun yok;
   * orada form zaten sayfanın kendisi.
   */
  cikisBitti?: () => void;
  /**
   * Açık kupon sayısı — özet şeridindeki sayaç için.
   *
   * SUNUCUDAN geliyor: kuponlar müşteriden bağımsız ve zaten
   * sayfanın sunucu tarafında okunuyor. Tarayıcıda ikinci kez
   * istemek, aynı veriyi iki kez çekmek olurdu.
   */
  kuponSayisi?: number;
  /**
   * Hangi bölüm çizilecek.
   *
   * Her şey tek sayfadayken sayfa müşteriyle birlikte büyüyordu
   * ve bölümlerin adresi yoktu (bkz. `HesapYanMenu`). Panel
   * oturumu, siparişleri ve profil durumunu tutmaya devam
   * ediyor; artık yalnızca istenen bölümü basıyor.
   */
  bolum?: "ozet" | "bilgilerim" | "adreslerim" | "siparislerim" | "icerik";
  /**
   * `bolum="icerik"` için: sunucuda çizilmiş bölüm gövdesi.
   *
   * Kuponlar ve hediye çekleri panelin DIŞINDA duruyordu ve
   * sonuç canlıda görüldü: o iki sayfada karşılama şeridi hiç
   * yoktu, başlıklar da başka bir kalıptaydı (künye + büyük
   * başlık), ötekiler ise panel başlığı kullanıyordu. Aynı
   * hesabın altı sayfası üç ayrı tasarım gibi duruyordu.
   *
   * Kabuk artık tek yerde: oturum denetimi, karşılama ve yan menü
   * burada; sayfa yalnızca kendi gövdesini veriyor.
   */
  children?: ReactNode;
}) {
  const router = useRouter();
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

  /*
    ÇIKIŞIN KENDİ DURUMU VAR.

    Önceden `signOut` bir satırdı: isteği gönderip yerel durumu
    temizliyordu. İstek DÜŞERSE Supabase oturumu yerinde kalıyor
    ama ekran çıkılmış gibi görünüyordu — ortak bilgisayarda
    müşteri çıktığını sanıp kalkıyor, oturum açık kalıyordu.
    Şimdi hata görünüyor ve çıkılmış gibi yapılmıyor.
  */
  const [cikisDurumu, setCikisDurumu] = useState<
    "bos" | "cikiliyor" | "cikildi" | "hata"
  >("bos");

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

    const { data, error } = await supabase.rpc("arc_storefront_my_orders", {
      p_host: tarayiciKonagi(),
    });
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
    SAĞLAYICIDAN GERİ DÖNÜŞTE PANEL KİLİTLİ KALIYORDU.

    Sosyal girişte sayfadan ayrılıyoruz ve `busy` açık bırakılıyor
    (düğmeler pasif, "yönlendiriliyorsunuz…" yazıyor) — bilerek,
    müşteri ikinci kez tıklamasın diye. Ama müşteri sağlayıcı
    ekranında vazgeçip GERİ TUŞUYLA dönerse tarayıcı sayfayı
    bıraktığı hâliyle geri yüklüyor (bfcache): menü açık, bütün
    düğmeler pasif, panel kilitli. Ne tekrar deneyebiliyor ne
    e-postayla girebiliyor.

    `pageshow` geri yüklemeyi bildiriyor; durum orada
    sıfırlanıyor. `visibilitychange` yedek: bazı tarayıcılar
    sayfayı önbellekten getirmeden sekmeye geri dönüyor.
  */
  useEffect(() => {
    const serbestBirak = () => {
      setBusy(false);
      setYonlendirilen(null);
    };
    const geriYuklendi = (olay: PageTransitionEvent) => {
      if (olay.persisted) serbestBirak();
    };
    const gorunurOldu = () => {
      if (document.visibilityState === "visible") serbestBirak();
    };

    window.addEventListener("pageshow", geriYuklendi);
    document.addEventListener("visibilitychange", gorunurOldu);
    return () => {
      window.removeEventListener("pageshow", geriYuklendi);
      document.removeEventListener("visibilitychange", gorunurOldu);
    };
  }, []);

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
    const kaynaklar = [
      window.location.hash.slice(1),
      window.location.search.slice(1),
    ];
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
    setCikisDurumu("cikiliyor");
    const { error } = await getAuthClient(
      supabaseUrl,
      supabaseKey,
    ).auth.signOut({
      /*
        YALNIZCA BU TARAYICI.

        Supabase'in varsayılanı `global`: buradan çıkmak
        müşterinin TELEFONUNDAKİ oturumu da kapatıyordu. Mağazada
        bu beklenmedik bir şey — bilgisayarda çıkış yapan kişi
        telefonunda da yeniden giriş yapmak zorunda kalıyor.
        Bütün cihazlardan çıkmak ayrı bir istek ve ayrı bir düğme
        olmalı; sessiz varsayılan değil.
      */
      scope: "local",
    });

    if (error) {
      console.error(error);
      setCikisDurumu("hata");
      return;
    }

    setOrders(null);
    setEmail("");
    setPassword("");
    /* Sonraki müşteri formda bir öncekinin adını bulmasın. */
    setProfileName("");
    setProfilePhone("");
    setCikisDurumu("cikildi");

    /*
      Menü biçiminde kap kapanıyor; "çıkış yapıldı" bildirimine de
      gerek kalmıyor çünkü panel hiç görünmüyor. Sayfa görünümünde
      çağrılmıyor: orada kapatılacak bir kap yok.
    */
    cikisBitti?.();

    /*
      HESAP SAYFALARINDAN ÇIKILINCA ANA SAYFAYA.

      /hesap ve altındaki ekranlar (kuponlarım, hediye çeklerim)
      yalnızca üyeye ait; çıkıştan sonra orada kalmak "Giriş yap /
      Hesap oluştur" formunun açılması demekti. Çıkmak isteyen
      müşteriye girmeyi teklif etmek, istediğinin tersi.

      /favoriler bilerek dışarıda: misafir de kullanabiliyor ve
      ekran listenin hesapta durduğunu zaten söylüyor.
    */
    if (window.location.pathname.startsWith("/hesap")) {
      router.push("/");
    }
  }

  if (!configured) {
    return (
      <section className="panel">
        <h2>Hesap sistemi hazırlanıyor</h2>
        <p className="hint" style={{ marginTop: "var(--s2)" }}>
          Üyelik özelliği kısa süre içinde açılacak. Bu sırada misafir olarak
          alışveriş yapabilir, siparişinizi numarasıyla takip edebilirsiniz.
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

    /*
      Sonuç ÇAĞIRANA dönüyor. Önceden hata yutuluyordu
      (`if (!error) setProfileSaved(true)`): istek düşerse ekranda
      hiçbir şey olmuyor, müşteri kaydettim sanıp çıkıyordu.
    */
    async function saveProfile(ad: string, telefon: string) {
      const { error } = await supabase.rpc("update_arvoculture_profile", {
        p_full_name: ad,
        p_phone: telefon,
      });
      if (error) console.error(error);
      return { hata: Boolean(error) };
    }

    /*
      Şifre değiştirme, giriş ekranındaki "şifremi unuttum" ile AYNI
      yoldan geçiyor: bağlantıyı üretmek service_role istiyor ve o
      anahtar tarayıcıya konulamaz.
    */
    async function sifreDegistir() {
      try {
        await requestAuthEmail({
          islem: "sifirla",
          email: session?.user.email ?? "",
        });
        return { hata: false };
      } catch (error) {
        console.error(error);
        return { hata: true };
      }
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

        {/*
          SAYFANIN KARŞILAMASI.

          Üç parça aynı şeyi söylüyordu: sayfanın "Hoş geldiniz."
          başlığı (kime hoş geldin dediği belirsiz), altındaki gri
          şeritte e-posta adresi, onun da altında profil kartının
          içinde ad ve aynı e-posta. Üçü de kimliği taşıyordu ve
          hiçbiri müşterinin ADIYLA selam vermiyordu.

          Tek karşılama kaldı; profil kartı artık yalnızca FORM.
        */}
        {!menuBicimi && (
          <section
            className="hesap-karsilama"
            /*
              KARŞILAMA YALNIZCA ÖZET SAYFASINDA BÜYÜK.

              Her bölüm kendi sayfasına çıkınca karşılama her
              sayfada tekrar ediyordu ve "Hoş geldiniz, Burak."
              başlığı sayfanın asıl başlığını (Adreslerim,
              Kuponlarım) gölgeliyordu — üstelik iki h1 oluyordu.
              Özet dışında kimlik şeridi: aynı bilgi, bir satır.
            */
            data-genis={bolum === "ozet" ? "" : undefined}
          >
            <span className="hesap-karsilama-monogram" aria-hidden="true">
              {(profileName || session.user.email || "•")
                .charAt(0)
                .toLocaleUpperCase("tr")}
            </span>

            <div className="hesap-karsilama-metin">
              {bolum === "ozet" ? (
                <>
                  <p className="about-eyebrow">Hesabım</p>
                  <h1>
                    Hoş geldiniz
                    {selamAdi(profileName, session.user.email) &&
                      `, ${selamAdi(profileName, session.user.email)}`}
                    .
                  </h1>
                </>
              ) : (
                <p className="hesap-karsilama-ad">
                  {profileName.trim() || selamAdi(profileName, session.user.email)}
                </p>
              )}
              <p className="hesap-karsilama-eposta">{session.user.email}</p>
            </div>

            <div className="hesap-karsilama-cikis">
              <button
                type="button"
                className="linklike"
                disabled={cikisDurumu === "cikiliyor"}
                onClick={() => void signOut()}
              >
                {cikisDurumu === "cikiliyor" ? "Çıkılıyor…" : "Çıkış yap"}
              </button>
              {cikisDurumu === "hata" && (
                <p className="form-error" role="alert">
                  Çıkış yapılamadı; hâlâ giriş yapmış durumdasınız.
                </p>
              )}
            </div>
          </section>
        )}

        {!menuBicimi && bolum === "ozet" && (
          <HesapOzeti
            supabase={supabase}
            siparisSayisi={siparisOkunamadi ? null : (orders?.length ?? null)}
            kuponSayisi={kuponSayisi}
          />
        )}

        {/*
          MENÜDE SAYFA DEĞİL, KISA BİR EV.

          Açılır menüye hesap sayfasının tamamını basmak sütunları
          üst üste bindiriyordu. Kartlar artık bölümlerin KENDİ
          sayfalarına gidiyor; önce çapalara (#adreslerim)
          gidiyorlardı ve çapa, sayfanın uzunluğuna konmuş bir
          yamaydı.

          Selamda e-posta DEĞİL ad var: giriş yapmış birine
          adresini göstermek, tanımadığını söylemektir.
        */}
        {menuBicimi ? (
          <AccountMenuHome
            ad={selamAdi(profileName, session.user.email)}
            eposta={session.user.email}
            cikisYap={signOut}
            cikisDurumu={cikisDurumu}
          />
        ) : (
          <div className="hesap-duzen">
            <HesapYanMenu />

            <div className="hesap-icerik">
              {bolum === "ozet" && (
                <HesapOzetBolumu
                  orders={orders}
                  siparisOkunamadi={siparisOkunamadi}
                  supabaseUrl={supabaseUrl}
                  yenidenDene={() => void loadOrders()}
                />
              )}

              {bolum === "bilgilerim" && (
                <ProfilKarti
                  ad={profileName}
                  telefon={profilePhone}
                  eposta={session.user.email}
                  uyelikTarihi={session.user.created_at}
                  adDegisti={setProfileName}
                  telefonDegisti={setProfilePhone}
                  kaydet={saveProfile}
                  sifreDegistir={sifreDegistir}
                />
              )}

              {bolum === "adreslerim" && <AddressBook supabase={supabase} />}

              {/* Sunucuda çizilen bölümler (kuponlar, hediye
                  çekleri) gövdelerini buradan veriyor. */}
              {bolum === "icerik" && children}

              {bolum === "siparislerim" && (
                <section className="panel" id="siparislerim">
                  <div className="head">
                    <div>
                      <h1>Siparişlerim</h1>
                      <p>Geçmiş siparişleriniz ve tüm detayları.</p>
                    </div>
                  </div>

                  {orders === null && !siparisOkunamadi && (
                    <p className="hint">Siparişler yükleniyor…</p>
                  )}

                  {siparisOkunamadi && (
                    <p className="form-error" role="alert">
                      Siparişleriniz şu anda alınamadı; yerinde duruyorlar.{" "}
                      <button
                        type="button"
                        className="link-button"
                        onClick={() => void loadOrders()}
                      >
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
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  /* --- Giriş formu --- */
  const girisFormu = (
    <section className="panel auth-panel">
      {/*
        GEÇİŞ ANI İÇİN.

        Çıkıştan sonra giriş formu artık AÇILMIYOR: menü kapanıyor,
        hesap sayfasından ana sayfaya gidiliyor. Ama ikisi de bir
        an sürüyor ve o anda ekranda duran şey bu panel. Açıklama
        olmasa müşteri, çıkmak için bastığı düğmenin önüne "Giriş
        yap / Hesap oluştur" koyduğunu görürdü.

        Favori listesinin aynı anda boşalması da burada söyleniyor:
        liste ortak bilgisayarda bir sonrakine devrolmasın diye
        bilerek siliniyor ve açıklamasız bırakılınca veri kaybı
        gibi görünüyor.
      */}
      {cikisDurumu === "cikildi" && (
        <p className="auth-cikis" role="status">
          <strong>Çıkış yapıldı.</strong> Favorileriniz ve
          siparişleriniz hesabınızda duruyor; tekrar giriş
          yaptığınızda yerlerinde olacaklar.
        </p>
      )}

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => {
            setMode("login");
            /* Müşteri giriş yapmaya başladı; çıkış bildirimi
               artık geçmişe ait. */
            setCikisDurumu("bos");
          }}
        >
          Giriş yap
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "register"}
          onClick={() => {
            setMode("register");
            setCikisDurumu("bos");
          }}
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
          <button
            type="button"
            className="linklike"
            onClick={() => setMode("login")}
          >
            Girişe dön
          </button>
        ) : (
          <button
            type="button"
            className="linklike"
            onClick={() => setMode("reset")}
          >
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

        {FACEBOOK_ACIK && (
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
        )}
      </div>
    </section>
  );

  /*
    MENÜDE TEK SÜTUN, SAYFADA İKİ.

    /hesap masaüstünde 1440 piksel genişliğinde açılıyordu ve
    içinde ortalanmış 27rem'lik bir giriş formu duruyordu: ekranın
    dörtte üçü boş. Üstelik üye olmanın ne kazandırdığı hiçbir
    yerde yazmıyordu — form, kendini açıklamayan bir kapıydı.

    Yan sütun o boşluğu dolduruyor ve iki soruyu yanıtlıyor:
    "neden üye olayım" ve "üye değilsem siparişimi nasıl takip
    ederim". Menüde (27rem) böyle bir boşluk yok, orada tek sütun.
  */
  if (menuBicimi) return girisFormu;

  return (
    <div className="hesap-giris">
      {/*
        Başlık sayfadan buraya taşındı: sunucu kimin baktığını
        bilmediği için "Hoş geldiniz." her iki duruma da aynı
        şekilde basılıyordu.
      */}
      <header className="hesap-giris-ust">
        <p className="about-eyebrow">Hesabım</p>
        <h1>Giriş yapın.</h1>
        <p className="about-lede">
          Siparişleriniz, adres defteriniz ve favorileriniz tek yerde.
        </p>
      </header>

      {girisFormu}

      <aside className="panel hesap-davet">
        <p className="about-eyebrow">Üyelik</p>
        <h2>Hesap ne kazandırıyor?</h2>

        <ul className="hesap-davet-liste">
          <li>
            <strong>Siparişleriniz tek yerde.</strong> Geçmiş
            siparişleriniz, tutarları ve kargo durumları hesabınızda
            durur; e-postadaki bağlantıyı aramanıza gerek kalmaz.
          </li>
          <li>
            <strong>Adres defteri.</strong> Teslimat ve fatura
            adresiniz kayıtlı gelir; bir sonraki alışveriş tek
            adımda biter.
          </li>
          <li>
            <strong>Favorileriniz her cihazda.</strong> Telefonda
            beğendiğiniz ürün bilgisayarda da listenizde olur;
            tarayıcı verisini temizleseniz de durur.
          </li>
          <li>
            <strong>Kuponlar ve hediye çekleri.</strong> Size
            tanımlı bakiye ve kullanabileceğiniz kodlar hesabınızda
            görünür.
          </li>
        </ul>

        {/*
          ÜYELİK ZORUNLU DEĞİL ve bunu söylemek davetin parçası.
          Önceden burada "siparişinizi NUMARASIYLA takip
          edebilirsiniz" yazıyordu; vitrinde numarayla sorgulanan
          bir ekran YOK — takip, sipariş onayı e-postasındaki
          kişiye özel bağlantıyla yapılıyor. Tutulamayan bir söz,
          verilmemiş sözden kötü: müşteri numarayı nereye yazacağını
          arıyor ve bulamıyor.
        */}
        <p className="hesap-davet-misafir">
          <strong>Üye olmadan da alışveriş yapabilirsiniz.</strong>{" "}
          Sipariş onayı e-postanızdaki bağlantı, siparişinizin güncel
          durumunu her zaman açar.
        </p>
      </aside>
    </div>
  );
}

/** Supabase hata metinleri İngilizce döner; sık görülenleri çeviririz. */
function translateAuthError(message: string) {
  const map: Array<[RegExp, string]> = [
    [/invalid login credentials/i, "E-posta veya şifre hatalı."],
    [/email not confirmed/i, "E-posta adresinizi doğrulamanız gerekiyor."],
    [/user already registered/i, "Bu e-posta ile zaten bir hesap var."],
    [/password should be at least/i, "Şifreniz en az 8 karakter olmalı."],
    [
      /rate limit|too many/i,
      "Çok fazla deneme yapıldı. Biraz sonra tekrar deneyin.",
    ],
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
