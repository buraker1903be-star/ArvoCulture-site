"use client";

import { useEffect, useState } from "react";
import { getAuthClient } from "@/lib/auth-client";
import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { formatPrice } from "@/lib/product-types";

/**
 * Ödeme adımında hediye çeki seçimi.
 *
 * Çek KODU ELLE YAZILMIYOR: çekler müşteriye e-postasıyla bağlı
 * (`arc_storefront_my_gift_cards`), yani hangi çeklerin ona ait
 * olduğunu zaten biliyoruz. Kod kutusu koymak, müşteriye kendi
 * parasının şifresini sordurmak olurdu — üstelik yanlış yazılan
 * her kod bir "geçersiz" mesajı demek.
 *
 * ASGARİ SEPET TUTARI BURADA SÖYLENİYOR. Kural ArvoARC'ta
 * (`arc_gift_card_apply`) ve son söz orada; ama kuralı yalnızca
 * ödeme anında öğrenmek, müşteriyi sepeti hazırladıktan sonra
 * duvara toslatmak olurdu. Eşiği geçmeyen çek seçilemiyor ve
 * sebebi yazıyor.
 */

type Cek = {
  id: string;
  code: string;
  balance: number;
  minimum_subtotal: number;
};

export function HediyeCekiSecici({
  supabaseUrl,
  supabaseKey,
  /** Sepetin ARA TOPLAMI (TL) — eşik ölçütü bu, ArvoARC'takiyle aynı. */
  araToplam,
  secili,
  secildi,
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
  araToplam: number;
  secili: string | null;
  secildi: (kod: string | null) => void;
}) {
  const [cekler, setCekler] = useState<Cek[] | null>(null);

  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;
    let acik = true;

    const supabase = getAuthClient(supabaseUrl, supabaseKey);
    supabase.auth
      .getSession()
      .then(({ data }) =>
        data.session
          ? supabase.rpc("arc_storefront_my_gift_cards", {
              p_host: tarayiciKonagi(),
            })
          : null,
      )
      .then((sonuc) => {
        if (!acik || !sonuc) return;
        if (sonuc.error) {
          console.error(sonuc.error);
          return;
        }
        setCekler(
          ((sonuc.data ?? []) as Cek[]).filter((cek) => cek.balance > 0),
        );
      });

    return () => {
      acik = false;
    };
  }, [supabaseUrl, supabaseKey]);

  /* Çeki olmayan müşteriye boş bir bölüm gösterilmiyor. */
  if (!cekler || cekler.length === 0) return null;

  return (
    <fieldset className="cek-secici">
      <legend>Hediye çeki</legend>

      {cekler.map((cek) => {
        /* Eşik kuruş, sepet TL: karşılaştırma kuruşta. */
        const esik = (cek.minimum_subtotal ?? 0) / 100;
        const yetersiz = esik > 0 && araToplam < esik;
        const isaretli = secili === cek.code;

        return (
          <label
            key={cek.id}
            className="cek-secenek"
            data-pasif={yetersiz ? "" : undefined}
          >
            <input
              type="checkbox"
              checked={isaretli}
              disabled={yetersiz}
              onChange={() => secildi(isaretli ? null : cek.code)}
            />
            <span>
              <strong>{formatPrice(cek.balance / 100)}</strong>
              <code>{cek.code}</code>
              {yetersiz ? (
                <small>
                  {formatPrice(esik)} ve üzeri siparişlerde geçerli
                </small>
              ) : (
                <small>En fazla bu tutar toplamdan düşülür</small>
              )}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
