"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useFavourites } from "@/components/favourites";
import { tarayiciKonagi } from "@/lib/tarayici-konak";
import { formatPrice } from "@/lib/product-types";

/**
 * Hesap sayfasının özet şeridi.
 *
 * Sayfa, giriş yapmış müşteriye doğrudan FORMLARLA açılıyordu:
 * ad-soyad kutusu, adres defteri, sipariş listesi. Müşterinin
 * hesabında ne OLDUĞUNU — kaç siparişi, kaç favorisi, ne kadar
 * bakiyesi var — hiçbir yerde göremiyordu; hediye çeki ve kupon
 * ekranları eklendikten sonra da onlara giden bir yol yoktu.
 *
 * Dört sayı ve dört bağlantı. Sayılar süs değil: hepsi tıklanınca
 * karşılığı olan bir ekrana gidiyor.
 */

type Sayac = {
  href: string;
  etiket: string;
  deger: string;
  alt: string;
};

export function HesapOzeti({
  supabase,
  siparisSayisi,
  kuponSayisi,
}: {
  supabase: SupabaseClient;
  /** `null` = henüz okunmadı ya da okunamadı; sayı yerine çizgi. */
  siparisSayisi: number | null;
  kuponSayisi: number;
}) {
  const { slugs } = useFavourites();
  const [cekBakiyesi, setCekBakiyesi] = useState<number | null>(null);

  useEffect(() => {
    let acik = true;
    void (async () => {
      const { data, error } = await supabase.rpc(
        "arc_storefront_my_gift_cards",
        { p_host: tarayiciKonagi() },
      );
      if (!acik) return;
      if (error) {
        /*
          Okunamadıysa SIFIR yazılmıyor: bakiyesi olan müşteriye
          "0,00 TL" göstermek, parasının gittiğini söylemek olur.
          Çizgi "bilmiyorum" demek.
        */
        console.error(error);
        return;
      }
      const toplam = ((data ?? []) as Array<{ balance: number }>).reduce(
        (t, cek) => t + (cek.balance ?? 0),
        0,
      );
      setCekBakiyesi(toplam);
    })();
    return () => {
      acik = false;
    };
  }, [supabase]);

  const sayaclar: Sayac[] = [
    {
      href: "#siparislerim",
      etiket: "Siparişlerim",
      deger: siparisSayisi === null ? "—" : String(siparisSayisi),
      alt: siparisSayisi === 1 ? "sipariş" : "sipariş",
    },
    {
      href: "/favoriler",
      etiket: "Favorilerim",
      deger: String(slugs.length),
      alt: "ürün",
    },
    {
      href: "/hesap/kuponlarim",
      etiket: "Kuponlarım",
      deger: String(kuponSayisi),
      alt: "kullanılabilir kod",
    },
    {
      href: "/hesap/hediye-ceklerim",
      etiket: "Hediye çekim",
      deger: cekBakiyesi === null ? "—" : formatPrice(cekBakiyesi / 100),
      alt: "bakiye",
    },
  ];

  return (
    <nav className="hesap-ozet" aria-label="Hesap özeti">
      {sayaclar.map((sayac) => (
        <Link key={sayac.etiket} href={sayac.href} className="hesap-sayac">
          <span className="hesap-sayac-deger">{sayac.deger}</span>
          <strong>{sayac.etiket}</strong>
          <small>{sayac.alt}</small>
        </Link>
      ))}
    </nav>
  );
}
