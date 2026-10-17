import "server-only";
import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { toSalesRules, type SalesRules, type SalesRulesRow } from "@/lib/order-quote";
import { vitrinKonagi } from "@/lib/konak";

/**
 * Mağazanın satış ayarları: kargo ücreti, ücretsiz kargo eşiği, havale.
 *
 * Bunlar ArvoARC'ta mağaza panelinden değişiyor ve siparişi ArvoARC bu
 * değerlerle hesaplıyor. Önceden vitrin 120 TL / 2.000 TL / %3'ü kodda
 * sabit tutuyordu; panelden değiştirilince sepet bir tutar, sipariş
 * başka bir tutar gösterecekti.
 *
 * Okunamazsa (fonksiyon henüz yoksa ya da geçici arıza) bugünkü
 * sabitlere düşülür: vitrin açık kalır. Boş sonuç önbelleğe alınmaz
 * (ttlCache), bir sonraki istekte yeniden denenir.
 *
 * Otuz saniye: indirim tanımlarıyla aynı gerekçe (lib/discounts.ts).
 * Tutarlar ArvoARC'ta kuruş, vitrinde TL.
 */
/* Anahtar mağazanın adresi: kargo ücreti ve havale indirimi mağazaya
   özel; anahtarsız bir önbellek B'nin müşterisine A'nın kuralını
   gösterirdi (lib/ttl-cache). */
const yukle = ttlCache(
  (konak: string) =>
    rpcOrEmpty<SalesRulesRow>("arc_storefront_settings", { p_host: konak }, {
      revalidate: 30,
      tags: ["storefront-settings"],
    }),
  30_000,
);

export const getSalesRules = cache(
  async (): Promise<SalesRules> => toSalesRules((await yukle(await vitrinKonagi()))[0]),
);
