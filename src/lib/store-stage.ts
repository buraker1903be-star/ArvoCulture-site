import "server-only";
import { rpc } from "@/lib/arc";
import { env } from "@/lib/env";

/**
 * Mağazanın açık olup olmadığı.
 *
 * Arc aboneliği ArvoOS üzerinden yönetilir ve ödeme gecikince mağaza kademe
 * kademe daralır (kural tek yerde: public.arc_store_stage):
 *
 *   open          her şey açık
 *   panel_closed  mağaza sahibi panele giremez; vitrin ve satış sürer
 *   sales_closed  yeni sipariş alınmaz; vitrin görünür
 *   closed        vitrin de kapalı
 *
 * Vitrini yalnızca son kademe kapatır. Okuma başarısız olursa vitrin AÇIK
 * kabul edilir: geçici bir arıza yüzünden çalışan bir mağazayı kapatmak,
 * kapalı bir mağazayı bir süre açık bırakmaktan çok daha pahalıdır.
 */
export type StoreStage = "open" | "panel_closed" | "sales_closed" | "closed";

export async function getStoreStage(): Promise<StoreStage> {
  try {
    // Skaler dönen fonksiyonda PostgREST diziyi değil doğrudan değeri verir.
    const result = (await rpc<StoreStage>(
      "arc_store_stage",
      { p_organization_id: env.organizationId },
      { revalidate: 300 },
    )) as unknown as StoreStage | StoreStage[] | null;

    const stage = Array.isArray(result) ? result[0] : result;
    return stage ?? "open";
  } catch (error) {
    console.error("Mağaza durumu okunamadı, vitrin açık kabul edildi:", error);
    return "open";
  }
}

export const isStoreClosed = async () => (await getStoreStage()) === "closed";
