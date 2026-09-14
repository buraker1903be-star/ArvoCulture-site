"use client";

import { BankDetails } from "@/components/bank-details";

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
  const money = (kurus: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(kurus / 100);

  const discount = Math.round((total * discountPercent) / 100);
  const discounted = total - discount;

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
        <BankDetails seller={seller}>
          <p className="hint">
            Siparişinizi tamamladıktan sonra aşağıdaki hesaba havale veya
            EFT yapın. Açıklama kısmına sipariş numaranızı yazın; ödemeniz
            onaylandığında siparişiniz hazırlanmaya başlar.
          </p>
        </BankDetails>
      )}
    </div>
  );
}
