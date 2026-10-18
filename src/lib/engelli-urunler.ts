import "server-only";
import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { vitrinKonagi } from "@/lib/konak";

/**
 * Yurtdışına gönderilemeyen ürünlerin slug listesi.
 *
 * Sipariş fonksiyonu bu ürünleri yurtdışı adresinde zaten reddediyor;
 * bu liste vitrinin onları yurtdışı modunda GÖSTERMEMESİ için.
 * Müşteri sepeti doldurup ödeme adımında "bu ürün yurtdışına
 * gönderilemiyor" cümlesiyle karşılaşmasın.
 *
 * SÜZGEÇ KOLAYLIK, SİPARİŞİ REDDEDEN SATIR KURAL. Bu liste bir gün
 * boş gelirse kart görünür olur ama sipariş yine geçmez — tersi
 * olsaydı (liste var, kural yok) ürün satılır ve gönderilemezdi.
 *
 * BEŞ DAKİKA: işaret panelden değişiyor ve seyrek. Fiyat ya da stok
 * değil; bayatlığının bedeli bir kartın birkaç dakika fazla
 * görünmesi.
 */
/* Anahtar mağazanın adresi: liste mağazaya özel ve anahtarsız bir
   önbellek A'nın engelli ürünlerini B'nin vitrininde gizlerdi
   (lib/ttl-cache). */
const yukle = ttlCache(
  (konak: string) =>
    rpcOrEmpty<{ slug: string | null }>(
      "arc_storefront_blocked_products",
      { p_host: konak },
      { revalidate: 300, tags: ["storefront-blocked"] },
    ),
  300_000,
);

/**
 * Slug listesi.
 *
 * SLUG BİÇİMİ SÜZÜLÜYOR: liste sunucuda bir CSS seçicisine
 * dönüşüyor (bkz. [konak]/layout) ve oraya tırnak ya da süslü parantez
 * girerse seçici bozulur, hatta sayfanın bütün stilini bozabilir.
 * Slug'lar zaten harf-rakam-tire; beklenmeyen bir değer sessizce
 * atılıyor — bir ürünü gizlemeyi kaçırmak, sayfayı bozmaktan iyi.
 */
export const getBlockedProducts = cache(async (): Promise<string[]> => {
  const satirlar = await yukle(await vitrinKonagi());
  return satirlar
    .map((satir) => (satir.slug ?? "").trim())
    .filter((slug) => /^[a-z0-9-]+$/i.test(slug));
});
