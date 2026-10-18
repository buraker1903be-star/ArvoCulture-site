"use client";

import { BankDetails } from "@/components/bank-details";
import { useParaBirimi } from "@/components/para-birimi";

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
  /*
    HESAP BİLGİSİ YOKSA null. Mağaza ayarında IBAN yazılı değilse
    havale seçeneği hiç gösterilmiyor: yanlış ya da eksik hesapla
    "havaleyle öde" demek, müşteriye nereye ödeyeceğini söylemeden
    siparişi "ödeme bekliyor"da bırakmak olurdu. Önceden kodda bir
    yedek IBAN vardı ve o yedek paneldekinden BAŞKA bir hesaptı.
  */
  seller: {
    bankName: string;
    iban: string;
    accountHolder: string;
    transferInstructions?: string;
  } | null;
  discountPercent: number;
  /**
   * TL cinsinden sipariş toplamı (kargo dahil). Önceden kuruş
   * sanılıp 100'e bölünüyordu; ödeme formu TL gönderdiği için
   * ₺1.617,90'lık siparişte seçenekler "₺16,18" gösteriyordu.
   */
  total: number;
  /**
   * TL cinsinden havale indirimi. Burada yeniden hesaplanmıyor: taban
   * yalnızca mal bedeli (kargo hariç) ve kural ArvoARC ile birebir olmalı;
   * tek yer lib/order-quote.ts. Ödeme özetiyle aynı tutarı gösterir.
   */
  discount: number;
  /** Mağaza havaleyi panelden kapattıysa seçenek gösterilmez (ArvoARC reddeder). */
  transferEnabled?: boolean;
  onSelect: (useTransfer: boolean) => void;
  selected: boolean;
}) {
  /* Tutarlar LİRA kalıyor: tahsilat lira ve havale hesabı Türk
     bankasında (bkz. checkout-form, "Tahsilat Türk lirası olarak
     yapılır"). Burada dolar yazmak, müşteriye göndereceği tutarı
     yanlış söylemek olurdu. */
  const { t } = useParaBirimi();

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
          <b>{t("kartOdemesi")}</b>
          <small>
            {t("kartGuvence")} · {money(total)}
          </small>
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
              {t("havale")}
              <em className="pay-badge">
                {t("havaleIndirimi").replace("{oran}", String(discountPercent))}
              </em>
            </b>
            <small>
              <s>{money(total)}</s> {money(discounted)} ·{" "}
              {money(discount)} {t("tasarruf")}
            </small>
          </span>
        </label>
      )}

      {selected && transferEnabled && seller && (
        <BankDetails seller={seller}>
          <p className="hint">{t("havaleAciklama")}</p>
        </BankDetails>
      )}
    </div>
  );
}
