import "server-only";
import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { toBolgeler, type Bolge, type BolgeSatiri } from "@/lib/kargo-bolgesi";
import { vitrinKonagi } from "@/lib/konak";

/**
 * Yurtdışı kargo tarifesi (bölgeler).
 *
 * Mağaza panelinden yönetiliyor ve siparişi ArvoARC bu tarifeyle
 * hesaplıyor; vitrin aynalıyor. Müşteri ülkesini seçtiği anda ücreti
 * görmek zorunda — her tuş vuruşunda sunucuya sormak yerine liste bir
 * kez okunuyor, hesap `lib/order-quote` içinde yapılıyor.
 *
 * OTUZ SANİYE, satış ayarlarıyla aynı gerekçe (lib/store-settings):
 * tarife seyrek değişiyor ama değiştiği gün vitrinin dakikalarca eski
 * ücreti göstermesi, ekranla tahsilatın ayrılması demek.
 *
 * Okunamazsa BOŞ LİSTE dönüyor ve boş liste "bölge yok" demek: o
 * ülkeye satış yapılmıyor. Yurt içi satış etkilenmiyor. Yedek bir
 * tarife uydurmak, ArvoARC'ın tahsil ettiğinden farklı bir kargo
 * göstermek olurdu.
 */
/* Anahtar mağazanın adresi: tarife mağazaya özel ve anahtarsız bir
   önbellek B'nin müşterisine A'nın ücretini gösterirdi
   (lib/ttl-cache). */
const yukle = ttlCache(
  (konak: string) =>
    rpcOrEmpty<BolgeSatiri>("arc_storefront_shipping_zones", { p_host: konak }, {
      revalidate: 30,
      tags: ["storefront-shipping-zones"],
    }),
  30_000,
);

export const getShippingZones = cache(
  async (): Promise<Bolge[]> => toBolgeler(await yukle(await vitrinKonagi())),
);
