"use client";

import { useState } from "react";

/**
 * Banka havalesi ile ödeme.
 *
 * Kartlı ödemede PayTR komisyonu var; havalede yok. Bu farkın
 * bir kısmını indirim olarak müşteriye vermek hem dönüşümü
 * artırıyor hem komisyon maliyetini düşürüyor.
 *
 * Sipariş "ödeme bekliyor" durumunda oluşuyor; havale
 * geldiğinde panelden onaylanıyor.
 */
export function BankTransfer({
  seller,
  discountPercent,
  total,
  onSelect,
  selected,
}: {
  seller: { legalName: string; bankName: string; iban: string };
  discountPercent: number;
  /** Kuruş cinsinden sepet toplamı. */
  total: number;
  onSelect: (useTransfer: boolean) => void;
  selected: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const money = (kurus: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(kurus / 100);

  const discount = Math.round((total * discountPercent) / 100);
  const discounted = total - discount;

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
    <div className="pay-methods">
      <label className="pay-method" data-selected={!selected}>
        <input
          type="radio"
          name="payment_method"
          checked={!selected}
          onChange={() => onSelect(false)}
        />
        <span>
          <b>Kredi / banka kartı</b>
          <small>3D Secure ile güvenli ödeme · {money(total)}</small>
        </span>
      </label>

      <label className="pay-method" data-selected={selected}>
        <input
          type="radio"
          name="payment_method"
          checked={selected}
          onChange={() => onSelect(true)}
        />
        <span>
          <b>
            Banka havalesi / EFT
            <em className="pay-badge">%{discountPercent} indirim</em>
          </b>
          <small>
            <s>{money(total)}</s> {money(discounted)} ·{" "}
            {money(discount)} tasarruf
          </small>
        </span>
      </label>

      {selected && (
        <div className="pay-bank">
          <p className="hint">
            Siparişinizi tamamladıktan sonra aşağıdaki hesaba havale veya
            EFT yapın. Açıklama kısmına sipariş numaranızı yazın; ödemeniz
            onaylandığında siparişiniz hazırlanmaya başlar.
          </p>

          <div className="pay-bank-row">
            <div>
              <small>ALICI UNVANI</small>
              <b>{seller.legalName}</b>
            </div>
            <button
              type="button"
              className="linklike"
              onClick={() => copy("unvan", seller.legalName)}
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
              onClick={() =>
                copy("iban", seller.iban.replace(/\s/g, ""))
              }
            >
              {copied === "iban" ? "Kopyalandı ✓" : "Kopyala"}
            </button>
          </div>

          <p className="hint">
            IBAN kopyalandığında boşluklar kaldırılır. Havale ücreti
            bankanıza aittir.
          </p>
        </div>
      )}
    </div>
  );
}
