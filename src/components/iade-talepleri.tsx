"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAuthClient } from "@/lib/auth-client";
import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { formatPrice } from "@/lib/product-types";
import {
  formatOrderDate,
  RETURN_STATUS,
  type ReturnRequestRow,
} from "@/lib/order-types";

/**
 * İade taleplerim.
 *
 * `arc_storefront_my_returns` baştan beri vardı ama yalnızca TEK
 * bir siparişin detay sayfasından okunuyordu: müşteri "benim kaç
 * iade talebim var, hangisi ne durumda" sorusunu ancak siparişleri
 * tek tek açarak yanıtlayabiliyordu. Talebin hangi siparişe ait
 * olduğu kayıtta zaten duruyor; liste bu yüzden mümkündü, sadece
 * hiç yapılmamıştı.
 *
 * Okuma BÖLÜMÜN KENDİSİNDE: kabuk bunu her hesap sayfasında
 * çekseydi, iade ekranına hiç girmeyen müşteri için de bir istek
 * olurdu.
 */

type Durum =
  | { ad: "yukleniyor" }
  | { ad: "ariza" }
  | { ad: "liste"; talepler: ReturnRequestRow[] };

export function IadeTalepleri({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [durum, setDurum] = useState<Durum>({ ad: "yukleniyor" });

  /*
    OKUMA DURUMU YAZMIYOR, DÖNDÜRÜYOR.

    Önce `getir` hem okuyup hem setDurum çağırıyordu ve etkinin
    içinden çağrılınca kural haklı olarak zincirleme render riski
    sayıyordu. Şimdi okuma saf: etki sonucu `.then` ile yazıyor,
    "tekrar dene" düğmesi doğrudan — ikisi de aynı fonksiyonu
    kullanıyor, kopya yok.
  */
  const oku = useCallback(async (): Promise<Durum> => {
    const supabase = getAuthClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.rpc("arc_storefront_my_returns", {
      p_host: tarayiciKonagi(),
    });
    if (error) {
      console.error(error);
      return { ad: "ariza" };
    }
    return { ad: "liste", talepler: (data as ReturnRequestRow[]) ?? [] };
  }, [supabaseUrl, supabaseKey]);

  useEffect(() => {
    let acik = true;
    void oku().then((sonuc) => {
      /* Sayfa kapandıktan sonra gelen yanıt durumu tazelemesin. */
      if (acik) setDurum(sonuc);
    });
    return () => {
      acik = false;
    };
  }, [oku]);

  function tekrarDene() {
    setDurum({ ad: "yukleniyor" });
    void oku().then(setDurum);
  }

  if (durum.ad === "yukleniyor") {
    return <p className="hint">Talepleriniz yükleniyor…</p>;
  }

  /*
    Arıza "talebiniz yok" diye gösterilmiyor: açık talebi olan
    müşteriye geçici bir okuma hatasında talebinin kaybolduğunu
    söylemiş oluruz.
  */
  if (durum.ad === "ariza") {
    return (
      <p className="form-error" role="alert">
        Talepleriniz şu anda alınamadı; yerinde duruyorlar.{" "}
        <button type="button" className="link-button" onClick={tekrarDene}>
          Tekrar dene
        </button>
      </p>
    );
  }

  if (durum.talepler.length === 0) {
    return (
      <p className="hint">
        Henüz iade talebiniz yok. Teslim aldığınız bir siparişi
        siparişlerinizden açıp iade talebi oluşturabilirsiniz.
      </p>
    );
  }

  return (
    <div className="order-returns">
      {durum.talepler.map((istek) => {
        const durumMetni = RETURN_STATUS[istek.status] ?? {
          label: istek.status,
          detail: "",
        };
        return (
          <article
            className="order-return-card"
            key={istek.id}
            data-durum={istek.status}
          >
            <div className="order-return-head">
              <b>{durumMetni.label}</b>
              <time dateTime={istek.created_at}>
                {formatOrderDate(istek.created_at)}
              </time>
            </div>

            {/* Hangi siparişe ait olduğu listede ŞART: detayda
                belliydi, listede değil. */}
            <p className="order-return-reason">
              <Link
                href={`/hesap/siparis/${encodeURIComponent(istek.order_number)}`}
              >
                {istek.order_number}
              </Link>
            </p>

            <p>{durumMetni.detail}</p>

            {(istek.items ?? []).length > 0 && (
              <ul className="order-return-items">
                {(istek.items ?? []).map((kalem, sira) => (
                  <li key={`${istek.id}-${sira}`}>
                    {kalem.name ?? kalem.sku}{" "}
                    <small>{kalem.quantity ?? 1} adet</small>
                  </li>
                ))}
              </ul>
            )}

            <p className="order-return-reason">
              <b>Sebep:</b> {istek.reason}
            </p>

            {/* Operasyoncunun notu: iade adresi ve kargo talimatı
                burada geliyor; müşterinin ürünü nereye göndereceğini
                söyleyen tek yer. */}
            {istek.status_note && (
              <p className="order-return-note">
                <b>Bizden:</b> {istek.status_note}
              </p>
            )}

            {istek.status === "tamamlandi" && istek.refund_amount ? (
              <p className="order-return-amount">
                İade edilen tutar <b>{formatPrice(istek.refund_amount / 100)}</b>
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
