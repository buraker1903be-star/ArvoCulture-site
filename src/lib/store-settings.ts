import "server-only";
import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { toSalesRules, type SalesRules, type SalesRulesRow } from "@/lib/order-quote";

/**
 * Mağazanın satış ayarları: kargo ücreti, ücretsiz kargo eşiği, havale.
 *
 * Bunlar ARC'ta mağaza panelinden değişiyor ve siparişi ARC bu
 * değerlerle hesaplıyor. Önceden vitrin 120 TL / 2.000 TL / %3'ü kodda
 * sabit tutuyordu; panelden değiştirilince sepet bir tutar, sipariş
 * başka bir tutar gösterecekti.
 *
 * Okunamazsa (fonksiyon henüz yoksa ya da geçici arıza) bugünkü
 * sabitlere düşülür: vitrin açık kalır. Boş sonuç önbelleğe alınmaz
 * (ttlCache), bir sonraki istekte yeniden denenir.
 *
 * Otuz saniye: indirim tanımlarıyla aynı gerekçe (lib/discounts.ts).
 * Tutarlar ARC'ta kuruş, vitrinde TL.
 */
const yukle = ttlCache(
  () =>
    rpcOrEmpty<SalesRulesRow>("get_arvoculture_storefront_settings", {}, {
      revalidate: 30,
      tags: ["storefront-settings"],
    }),
  30_000,
);

export const getSalesRules = cache(async (): Promise<SalesRules> => toSalesRules((await yukle())[0]));
