"use client";

import { useState } from "react";

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
    eder. `accountHolder` verilmezse unvana düşülüyor.
  */
  seller: {
    legalName: string;
    bankName: string;
    iban: string;
    accountHolder?: string;
    transferInstructions?: string;
  };
  /** Bloğun başındaki açıklama. */
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const alici = seller.accountHolder?.trim() || seller.legalName;

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
          <small>ALICI UNVANI</small>
          <b>{alici}</b>
        </div>
        <button
          type="button"
          className="linklike"
          onClick={() => copy("unvan", alici)}
        >
          {copied === "unvan" ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>

      <div className="pay-bank-row">
        <div>
          <small>BANKA</small>
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
          {copied === "iban" ? "Kopyalandı ✓" : "Kopyala"}
        </button>
      </div>

      {/* Mağazanın kendi havale açıklaması (panelden); varsa
          standart notun ÜSTÜNDE duruyor çünkü mağazaya özel bilgi
          genel nottan önce okunmalı. */}
      {seller.transferInstructions?.trim() && (
        <p className="hint">{seller.transferInstructions.trim()}</p>
      )}

      <p className="hint">
        IBAN kopyalandığında boşluklar kaldırılır. Havale ücreti bankanıza
        aittir.
      </p>
    </div>
  );
}
