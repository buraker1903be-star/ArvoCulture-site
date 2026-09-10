"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/**
 * Uygulama kabuğu.
 *
 * Üç iş yapıyor, üçü de "bu site uygulama gibi çalışıyor"
 * hissinin doğrudan kaynağı:
 *
 *   1. Servis çalışanını kaydeder — ikinci açılışta yazı tipleri,
 *      betikler ve görseller cihazdan gelir.
 *   2. Bağlantı koptuğunda ve geri geldiğinde müşteriye söyler.
 *      Uygulamalar bunu yapar, web sayfaları genelde yapmaz;
 *      sessizce boş sayfa gösterir.
 *   3. Kurulum teklifini uygun zamanda sunar.
 *
 * Kurulum teklifinde kasıtlı bir ölçülülük var: ilk ziyarette
 * çıkmıyor. İlk saniyesinde "beni kur" diyen site, kendini
 * tanıtmadan adres isteyen satıcı gibidir. İkinci ziyaretten
 * itibaren, kapatıldığında otuz gün susarak çıkıyor.
 */

/* Chrome'un kurulum olayı; tip tanımı standartta yok. */
type KurulumOlayi = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const ZIYARET_ANAHTARI = "arvo-ziyaret";
const ERTELEME_ANAHTARI = "arvo-kurulum-ertelendi";
const ERTELEME_SURESI = 30 * 24 * 60 * 60 * 1000;

/** Uygulama olarak mı açıldı? Öyleyse kurulum teklifi anlamsız. */
function uygulamaModunda() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari standartı desteklemiyor, kendi bayrağını kullanıyor.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

function iosSafari() {
  const ua = window.navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua);
  // Chrome ve Firefox iOS'ta da WebKit; ama "Ana Ekrana Ekle"
  // yalnızca Safari'de var.
  const safari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return ios && safari;
}

function oku(anahtar: string) {
  try {
    return window.localStorage.getItem(anahtar);
  } catch {
    return null;
  }
}

function yaz(anahtar: string, deger: string) {
  try {
    window.localStorage.setItem(anahtar, deger);
  } catch {
    /* Gizli sekmede depolama kapalı olabilir; site yine çalışmalı. */
  }
}

/** useSyncExternalStore aboneliği; bileşenin dışında sabit kalmalı. */
function agAbone(degisti: () => void) {
  window.addEventListener("online", degisti);
  window.addEventListener("offline", degisti);
  return () => {
    window.removeEventListener("online", degisti);
    window.removeEventListener("offline", degisti);
  };
}

export function AppShell() {
  const [kurulumOlayi, setKurulumOlayi] = useState<KurulumOlayi | null>(null);
  const [iosIpucu, setIosIpucu] = useState(false);
  const [geriGeldi, setGeriGeldi] = useState(false);

  /*
    Bağlantı durumu React'in dışında yaşayan bir değer; onu bir
    etki içinde kopyalamak yerine doğrudan kaynağından okuyoruz.
    Sunucuda "bağlı" varsayılıyor: HTML üretilebiliyorsa zaten ağ
    vardır ve sayfa "bağlantı yok" çubuğuyla açılmamalı.
  */
  const cevrimdisi = !useSyncExternalStore(
    agAbone,
    () => navigator.onLine,
    () => true,
  );

  /*
    0 — "Sayfa canlandı" işareti.

    Sayfa geçiş animasyonu buna bağlı. İşaret ancak hidrasyondan
    sonra konduğu için siteye ilk giren müşteri animasyon
    beklemiyor: sunucudan gelen HTML olduğu gibi, anında görünür.
    Sonraki her gezinme ise yumuşak geçiyor.
  */
  useEffect(() => {
    document.documentElement.dataset.hydrated = "1";
  }, []);

  /* 1 — Servis çalışanı. */
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    /*
      Sayfa yüklenmesiyle yarışmasın: kayıt isteği ilk boyamayla
      aynı anda ağa çıkarsa açılışı geciktirir.
    */
    const kaydet = () => {
      navigator.serviceWorker.register("/sw.js").catch((hata) => {
        console.error("Servis çalışanı kaydedilemedi:", hata);
      });
    };
    if (document.readyState === "complete") kaydet();
    else {
      window.addEventListener("load", kaydet);
      return () => window.removeEventListener("load", kaydet);
    }
  }, []);

  /*
    2 — "Bağlantı geri geldi" mesajı.

    Bu, durumun kendisi değil; kısa ömürlü bir bildirim. Çevrimdışı
    çubuğu kalıcıdır (sorun sürüyor), bu ise iki buçuk saniye görünüp
    kayboluyor — çözülmüş bir sorunu ekranda tutmanın anlamı yok.
  */
  useEffect(() => {
    let zamanlayici = 0;
    const kopdu = () => {
      window.clearTimeout(zamanlayici);
      setGeriGeldi(false);
    };
    const geldi = () => {
      setGeriGeldi(true);
      zamanlayici = window.setTimeout(() => setGeriGeldi(false), 2600);
    };

    window.addEventListener("offline", kopdu);
    window.addEventListener("online", geldi);
    return () => {
      window.clearTimeout(zamanlayici);
      window.removeEventListener("offline", kopdu);
      window.removeEventListener("online", geldi);
    };
  }, []);

  /* 3 — Kurulum teklifi. */
  useEffect(() => {
    if (uygulamaModunda()) return;

    /* Ziyaret sayacı: bu oturumda bir kez artıyor. */
    const sayi = Number(oku(ZIYARET_ANAHTARI) ?? "0") + 1;
    yaz(ZIYARET_ANAHTARI, String(sayi));

    const ertelendi = Number(oku(ERTELEME_ANAHTARI) ?? "0");
    const susuyor = Date.now() - ertelendi < ERTELEME_SURESI;
    const hazir = sayi >= 2 && !susuyor;

    const yakala = (event: Event) => {
      /* Tarayıcının kendi çubuğunu engelleyip zamanlamayı biz
         seçiyoruz; teklif müşteri siteyi görmeden çıkmasın. */
      event.preventDefault();
      if (hazir) setKurulumOlayi(event as KurulumOlayi);
    };

    window.addEventListener("beforeinstallprompt", yakala);

    /*
      iOS'ta kurulum olayı hiç gelmiyor; tek yol elle anlatmak.
      Sayfa açılır açılmaz değil, müşteri yerleştikten sonra:
      ilk saniyede beliren bir kutu, okumaya başlayan gözü
      içerikten koparıyor.
    */
    const gecikme =
      hazir && iosSafari()
        ? window.setTimeout(() => setIosIpucu(true), 2500)
        : undefined;

    const kuruldu = () => {
      setKurulumOlayi(null);
      setIosIpucu(false);
    };
    window.addEventListener("appinstalled", kuruldu);

    return () => {
      if (gecikme) window.clearTimeout(gecikme);
      window.removeEventListener("beforeinstallprompt", yakala);
      window.removeEventListener("appinstalled", kuruldu);
    };
  }, []);

  const kapat = () => {
    yaz(ERTELEME_ANAHTARI, String(Date.now()));
    setKurulumOlayi(null);
    setIosIpucu(false);
  };

  const kur = async () => {
    if (!kurulumOlayi) return;
    await kurulumOlayi.prompt();
    await kurulumOlayi.userChoice;
    /* Teklif tek kullanımlık: aynı olay ikinci kez çağrılamaz. */
    setKurulumOlayi(null);
  };

  return (
    <>
      {/*
        Bağlantı çubuğu. role="status" ile ekran okuyucu da
        duyuyor; görsel bir uyarı olarak kalmıyor.
      */}
      {(cevrimdisi || geriGeldi) && (
        <div
          className={`net-bar ${cevrimdisi ? "net-off" : "net-on"}`}
          role="status"
        >
          {cevrimdisi
            ? "Bağlantı yok — sayfalar açılmayabilir."
            : "Bağlantı geri geldi."}
        </div>
      )}

      {(kurulumOlayi || iosIpucu) && (
        <div
          className="install-card"
          role="dialog"
          aria-label="Uygulama kurulumu"
        >
          <div className="install-text">
            <strong>ArvoCulture’ı ana ekranına ekle</strong>
            <small>
              {iosIpucu
                ? "Paylaş simgesine dokun, ardından “Ana Ekrana Ekle”yi seç."
                : "Tarayıcı çubuğu olmadan, tek dokunuşla açılır."}
            </small>
          </div>
          <div className="install-actions">
            {!iosIpucu && (
              <button
                type="button"
                className="button button-dark"
                onClick={kur}
              >
                Ekle
              </button>
            )}
            <button type="button" className="install-close" onClick={kapat}>
              Şimdi değil
            </button>
          </div>
        </div>
      )}
    </>
  );
}
