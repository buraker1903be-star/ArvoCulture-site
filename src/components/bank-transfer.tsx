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
  discount,
  transferEnabled = true,
  onSelect,
  selected,
}: {
  seller: { legalName: string; bankName: string; iban: string };
  discountPercent: number;
  /**
   * TL cinsinden sipariş toplamı (kargo dahil). Önceden kuruş
   * sanılıp 100'e bölünüyordu; ödeme formu TL gönderdiği için
   * ₺1.617,90'lık siparişte seçenekler "₺16,18" gösteriyordu.
   */
  total: number;
  /**
   * TL cinsinden havale indirimi. Burada yeniden hesaplanmıyor: taban
   * yalnızca mal bedeli (kargo hariç) ve kural ARC ile birebir olmalı;
   * tek yer lib/order-quote.ts. Ödeme özetiyle aynı tutarı gösterir.
   */
  discount: number;
  /** Mağaza havaleyi panelden kapattıysa seçenek gösterilmez (ARC reddeder). */
  transferEnabled?: boolean;
  onSelect: (useTransfer: boolean) => void;
  selected: boolean;
}) {
  const money = (lira: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(lira);

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

      {transferEnabled && (
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
      )}

      {selected && transferEnabled && (
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
