"use client";

import { useState } from "react";
import { useParaBirimi } from "@/components/para-birimi";

/**
 * Havale bilgileri: alıcı unvanı, banka ve IBAN, kopyala
 * düğmeleriyle.
 *
 * Ödeme adımında ve sipariş onay sayfasında aynı blok. Onay
 * sayfasında önceden kopyala düğmesi yoktu; oysa müşteri IBAN'ı
 * tam o anda, bankacılık uygulamasına geçerken kopyalıyor.
 */
export function BankDetails({
  seller,
  children,
}: {
  /*
    ALICI UNVANI DEĞİL HESAP SAHİBİ. Önceden ticaret unvanı
    yazılıyordu; hesap başka bir unvana (şahıs şirketi, eski unvan)
    açılmış olabilir ve IBAN'ın sahibi tutmazsa banka havaleyi iade
    eder. Değer mağaza ayarından geliyor, kodda yedeği YOK: yanlış
    hesap göstermek, hesap göstermemekten kötü.
  */
  seller: {
    bankName: string;
    iban: string;
    accountHolder: string;
    transferInstructions?: string;
  };
  /** Bloğun başındaki açıklama. */
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  /* İngilizce vitrinde etiketler de İngilizce (lib/sozluk); IBAN ve
     banka adı veri, çevrilmiyor. */
  const { t } = useParaBirimi();

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      /* Pano erişimi engellenmişse sessizce geç: müşteri
         metni elle seçebiliyor. */
    }
  }

  return (
    <div className="pay-bank">
      {children}

      <div className="pay-bank-row">
        <div>
          <small>{t("aliciUnvani")}</small>
          <b>{seller.accountHolder}</b>
        </div>
        <button
          type="button"
          className="linklike"
          onClick={() => copy("unvan", seller.accountHolder)}
        >
          {copied === "unvan" ? t("kopyalandi") : t("kopyala")}
        </button>
      </div>

      <div className="pay-bank-row">
        <div>
          <small>{t("banka")}</small>
          <b>{seller.bankName}</b>
        </div>
      </div>

      <div className="pay-bank-row">
        <div>
          <small>IBAN</small>
          <b className="pay-iban">{seller.iban}</b>
        </div>
        <button
          type="button"
          className="linklike"
          onClick={() => copy("iban", seller.iban.replace(/\s/g, ""))}
        >
          {copied === "iban" ? t("kopyalandi") : t("kopyala")}
        </button>
      </div>

      {/* Mağazanın kendi havale açıklaması (panelden); varsa
          standart notun ÜSTÜNDE duruyor çünkü mağazaya özel bilgi
          genel nottan önce okunmalı. */}
      {seller.transferInstructions?.trim() && (
        <p className="hint">{seller.transferInstructions.trim()}</p>
      )}

      <p className="hint">{t("ibanNotu")}</p>
    </div>
  );
}
