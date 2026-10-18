"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { telefonBicimle, telefonGecerli } from "@/lib/telefon";

/**
 * Profilim kartı.
 *
 * Önceki hâli üç alan ve bir "Kaydet" düğmesiydi; üç kusuru vardı
 * ve üçü de SESSİZDİ:
 *
 * * KAYIT HATASI YUTULUYORDU (`if (!error) setProfileSaved(true)`).
 *   İstek düşerse ekranda hiçbir şey olmuyor; müşteri kaydettim
 *   sanıp çıkıyor, bilgi eski kalıyordu.
 * * DÜĞME HER ZAMAN AÇIKTI. Hiçbir şey değiştirmeden basan
 *   müşteri "kaydedildi" görüyordu — doğru ama anlamsız; gerçek
 *   kaydın geri bildirimini değersizleştiriyordu.
 * * TELEFON HAM KAYDEDİLİYORDU, aynı numara dört ayrı biçimde
 *   (`lib/telefon`).
 *
 * Bir de EKSİK ALAN hiç söylenmiyordu. Telefonu olmayan müşterinin
 * paketi kargo onu bulamadığı için geri dönüyor ve bunun profil
 * ekranıyla bağı hiçbir yerde kurulmuyordu.
 */

type Kayit = (ad: string, telefon: string) => Promise<{ hata: boolean }>;

export function ProfilKarti({
  ad,
  telefon,
  eposta,
  uyelikTarihi,
  adDegisti,
  telefonDegisti,
  kaydet,
  sifreDegistir,
}: {
  ad: string;
  telefon: string;
  eposta: string | undefined;
  /** `session.user.created_at`. */
  uyelikTarihi: string | undefined;
  adDegisti: (deger: string) => void;
  telefonDegisti: (deger: string) => void;
  kaydet: Kayit;
  /** Şifre sıfırlama postası ister; çözümü çağıran yapıyor. */
  sifreDegistir: () => Promise<{ hata: boolean }>;
}) {
  /* Başlangıç değerleri: "değişti mi" sorusunun ölçüsü. */
  const [ilk] = useState({ ad, telefon });
  const [durum, setDurum] = useState<
    "bos" | "kaydediliyor" | "kaydedildi" | "hata"
  >("bos");
  const [sifreDurumu, setSifreDurumu] = useState<
    "bos" | "gonderiliyor" | "gonderildi" | "hata"
  >("bos");

  const degisti = ad !== ilk.ad || telefon !== ilk.telefon;
  const telefonSorunlu = !telefonGecerli(telefon);

  const uyelik = useMemo(() => {
    if (!uyelikTarihi) return null;
    const t = new Date(uyelikTarihi);
    if (Number.isNaN(t.getTime())) return null;
    return new Intl.DateTimeFormat("tr-TR", {
      month: "long",
      year: "numeric",
    }).format(t);
  }, [uyelikTarihi]);

  const eksikler = [
    !ad.trim() && "adınız",
    !telefon.trim() && "telefonunuz",
  ].filter(Boolean) as string[];

  async function kaydetmeyiDene() {
    if (telefonSorunlu) {
      setDurum("hata");
      return;
    }
    setDurum("kaydediliyor");
    /* Telefon KAYDEDİLİRKEN biçimleniyor, yazarken değil: her
       tuşta imleci oynatmak, numarayı düzeltmeye çalışan
       müşteriyi deli ediyordu. */
    const temiz = telefonBicimle(telefon);
    if (temiz !== telefon) telefonDegisti(temiz);
    const { hata } = await kaydet(ad.trim(), temiz);
    setDurum(hata ? "hata" : "kaydedildi");
  }

  return (
    <section className="panel profil" id="hesap-bilgilerim">
      {/*
        BAŞLIK KİMLİK DEĞİL, İŞ.

        Burada monogram + ad + e-posta + üyelik rozeti duruyordu;
        sayfanın karşılaması da aynı dörtlüyü gösteriyordu. İki
        yuvarlak, iki "Burak", iki adres — kart kimliği ikinci kez
        ilan ediyordu. Kimlik yukarıda; kart artık formun kendisi.
      */}
      <div className="head">
        <div>
          <h1>Hesap bilgilerim</h1>
          <p>Sipariş formlarında bu bilgiler hazır gelir.</p>
        </div>
        {uyelik && <span className="profil-uyelik">Üye · {uyelik}</span>}
      </div>

      {/* Eksik alan bir uyarı değil, bir SEBEP: neden gerektiğini
          söylemeyen bir "profilinizi tamamlayın" çubuğu, kapatılan
          bir çubuktur. */}
      {eksikler.length > 0 && (
        <p className="profil-eksik">
          <strong>{eksikler.join(" ve ")} eksik.</strong>{" "}
          {eksikler.includes("telefonunuz")
            ? "Kargo sizi bulamazsa paket geri döner; numaranız yalnızca teslimat için kullanılır."
            : "Sipariş formlarında bu bilgi hazır gelir."}
        </p>
      )}

      <div className="fields">
        <label className="wide">
          Ad soyad
          <input
            type="text"
            autoComplete="name"
            value={ad}
            onChange={(olay) => {
              adDegisti(olay.target.value);
              setDurum("bos");
            }}
          />
        </label>

        <label className="wide">
          Telefon
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0532 123 45 67"
            value={telefon}
            aria-invalid={telefonSorunlu || undefined}
            onChange={(olay) => {
              telefonDegisti(olay.target.value);
              setDurum("bos");
            }}
          />
          {telefonSorunlu && (
            <small className="profil-ipucu">
              Cep numarası 11 haneli olmalı: 0532 123 45 67
            </small>
          )}
        </label>

        <label className="wide">
          E-posta
          <input type="email" value={eposta ?? ""} disabled />
          {/* Kilitli bir alanın NEDEN kilitli olduğu yazmıyorsa,
              müşteri onu bir arıza sanıyor. */}
          <small className="profil-ipucu">
            Siparişleriniz bu adrese bağlı. Değiştirmek için{" "}
            <Link href="/iletisim">bize yazın</Link>.
          </small>
        </label>
      </div>

      <div className="profil-alt">
        <button
          type="button"
          className="btn"
          disabled={!degisti || durum === "kaydediliyor"}
          onClick={() => void kaydetmeyiDene()}
        >
          {durum === "kaydediliyor" ? "Kaydediliyor…" : "Kaydet"}
        </button>

        <button
          type="button"
          className="linklike"
          disabled={sifreDurumu === "gonderiliyor"}
          onClick={async () => {
            setSifreDurumu("gonderiliyor");
            const { hata } = await sifreDegistir();
            setSifreDurumu(hata ? "hata" : "gonderildi");
          }}
        >
          Şifremi değiştir
        </button>
      </div>

      {durum === "kaydedildi" && (
        <p className="form-note" role="status">
          Bilgileriniz kaydedildi.
        </p>
      )}

      {/*
        Hata artık GÖRÜNÜYOR. Önceden istek düşünce hiçbir şey
        olmuyordu ve müşteri kaydettim sanıyordu.
      */}
      {durum === "hata" && (
        <p className="form-error" role="alert">
          {telefonSorunlu
            ? "Telefon numarasını kontrol edin."
            : "Bilgileriniz kaydedilemedi. Bağlantınızı kontrol edip tekrar deneyin."}
        </p>
      )}

      {sifreDurumu === "gonderildi" && (
        <p className="form-note" role="status">
          Şifre değiştirme bağlantısı {eposta} adresine gönderildi.
        </p>
      )}

      {sifreDurumu === "hata" && (
        <p className="form-error" role="alert">
          Bağlantı gönderilemedi. Birazdan tekrar deneyin.
        </p>
      )}
    </section>
  );
}
