"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { formatPrice } from "@/lib/product-types";

/**
 * Hediye çeklerim.
 *
 * Çekler MÜŞTERİYE bağlı, bu yüzden sunucuda değil tarayıcıda
 * okunuyor: vitrinin sunucu tarafı anon anahtarla çalışıyor ve
 * "bu müşteri kim" bilgisi yalnızca tarayıcıdaki oturumda var.
 * Siparişler de aynı sebeple böyle çekiliyor
 * (`arc_storefront_my_orders`).
 *
 * Okuma başarısız olursa liste BOŞ GÖSTERİLMEZ: bakiyesi olan
 * müşteriye "çekiniz yok" demek, parasının kaybolduğunu söylemek
 * olur. Arıza ayrı bir durum ve öyle yazıyor.
 */

type HediyeCeki = {
  id: string;
  code: string;
  balance: number;
  initial_amount: number;
  expires_at: string | null;
  status: string;
  /* Asgari sepet tutarı (kuruş). Kural ArvoARC'ta ve son söz
     orada; ekranda yazması müşterinin sepeti hazırladıktan sonra
     duvara toslamaması için. */
  minimum_subtotal: number;
};

type Durum =
  | { ad: "yukleniyor" }
  | { ad: "misafir" }
  | { ad: "ariza" }
  | { ad: "liste"; cekler: HediyeCeki[] };

export function HediyeCekleri({
  supabaseUrl,
  supabaseKey,
}: {
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [durum, setDurum] = useState<Durum>({ ad: "yukleniyor" });

  const getir = useCallback(
    async (oturum: Session | null) => {
      if (!oturum) {
        setDurum({ ad: "misafir" });
        return;
      }

      const supabase = getAuthClient(supabaseUrl, supabaseKey);
      const { data, error } = await supabase.rpc(
        "arc_storefront_my_gift_cards",
        { p_host: tarayiciKonagi() },
      );

      if (error) {
        console.error(error);
        setDurum({ ad: "ariza" });
        return;
      }
      setDurum({ ad: "liste", cekler: (data as HediyeCeki[]) ?? [] });
    },
    [supabaseUrl, supabaseKey],
  );

  useEffect(() => {
    let acik = true;
    const supabase = getAuthClient(supabaseUrl, supabaseKey);

    supabase.auth.getSession().then(({ data }) => {
      if (acik) void getir(data.session);
    });

    /* Aynı sekmede giriş yapıldığında liste kendiliğinden dolsun. */
    const { data: dinleyici } = supabase.auth.onAuthStateChange(
      (_olay, oturum) => {
        if (acik) void getir(oturum);
      },
    );

    return () => {
      acik = false;
      dinleyici.subscription.unsubscribe();
    };
  }, [supabaseUrl, supabaseKey, getir]);

  if (durum.ad === "yukleniyor") {
    return <p className="hint">Yükleniyor…</p>;
  }

  if (durum.ad === "misafir") {
    return (
      <div className="order-result">
        <p>
          Hediye çekleri hesabınıza tanımlanır; giriş yaptığınızda
          bakiyeniz burada görünür.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/hesap">
            Giriş yap
          </Link>
        </div>
      </div>
    );
  }

  if (durum.ad === "ariza") {
    return (
      <p className="form-error" role="alert">
        Çekleriniz şu an okunamadı; bakiyeniz duruyor. Bağlantı sorunu
        geçici olabilir, birazdan tekrar deneyin.
      </p>
    );
  }

  if (durum.cekler.length === 0) {
    return (
      <div className="order-result">
        <p className="hint">
          Henüz hediye çekiniz yok. Size bir çek tanımlandığında kodu ve
          bakiyesi burada görünür.
        </p>
        <div className="order-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Ürünlere göz atın
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ul className="cek-izgara">
      {durum.cekler.map((cek) => {
        const bitti = cek.balance <= 0;
        return (
          <li
            key={cek.id}
            className={bitti ? "cek-kart cek-kart-bitti" : "cek-kart"}
          >
            <div className="cek-ust">
              <span className="cek-etiket">Hediye çeki</span>
              <strong className="cek-bakiye">
                {formatPrice(cek.balance / 100)}
              </strong>
              {/* Başlangıç tutarı yalnızca harcama yapılmışsa
                  gösteriliyor; hiç kullanılmamış çekte aynı iki
                  sayıyı yan yana yazmak kafa karıştırırdı. */}
              {cek.balance < cek.initial_amount && (
                <small>
                  {formatPrice(cek.initial_amount / 100)} tutarındaki
                  çekten kalan
                </small>
              )}
            </div>

            <code className="cek-kod">{cek.code}</code>

            {/* Asgari tutar, son kullanımdan ÖNCE: ödeme anında
                çeki engelleyen ilk kural o. */}
            {!bitti && cek.minimum_subtotal > 0 && (
              <p className="cek-not">
                {formatPrice(cek.minimum_subtotal / 100)} ve üzeri
                siparişlerde geçerli.
              </p>
            )}

            <p className="cek-not">
              {bitti
                ? "Bu çekin bakiyesi tükendi."
                : cek.expires_at
                  ? `Son kullanım: ${new Intl.DateTimeFormat("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }).format(new Date(cek.expires_at))}`
                  : "Son kullanım tarihi yok."}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
