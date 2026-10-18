"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { CartContext } from "@/components/cart";
import type { Product } from "@/lib/product-types";
import type { Order } from "@/lib/order-types";

/**
 * "Siparişi tekrarla".
 *
 * Kalemler SEPETE DOĞRUDAN YAZILMIYOR. Sipariş satırındaki
 * `unit_price` o günün fiyatı; onu sepete koymak müşteriye artık
 * geçerli olmayan bir tutar göstermek olurdu ve ödeme adımında
 * ArvoARC bugünkü fiyattan hesaplar — iki rakam tutmaz. Varyant da
 * tükenmiş ya da kaldırılmış olabilir.
 *
 * Bu yüzden sunucuya sorup (`/api/siparis-tekrari`) bugünkü ürün,
 * fiyat ve stokla dönüyoruz; eşleşmeyen satır sepete hiç girmiyor
 * ve müşteriye SÖYLENİYOR. Sessizce eksik bir sepet, yanlış bir
 * sepetten yalnızca biraz iyidir.
 */

type Yanit = {
  eklenecekler: Array<{
    urun: Product;
    varyant: { sku: string; label?: string; price: number; oldPrice?: number };
    adet: number;
  }>;
  atlananlar: Array<{ ad: string; sebep: string }>;
};

export function SiparisTekrarla({ order }: { order: Order }) {
  const { add } = useContext(CartContext);
  const router = useRouter();
  const [durum, setDurum] = useState<"bos" | "calisiyor" | "hata">("bos");
  const [atlananlar, setAtlananlar] = useState<Yanit["atlananlar"]>([]);

  /* SKU'suz kalem gönderilmiyor: eşleştirme SKU ile yapılıyor. */
  const kalemler = order.items
    .filter((item) => item.slug && item.sku)
    .map((item) => ({
      slug: item.slug as string,
      sku: item.sku,
      quantity: item.quantity,
    }));

  if (kalemler.length === 0) return null;

  async function tekrarla() {
    setDurum("calisiyor");
    setAtlananlar([]);
    try {
      const yanit = await fetch("/api/siparis-tekrari", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kalemler }),
      });
      if (!yanit.ok) throw new Error(`HTTP ${yanit.status}`);
      const veri = (await yanit.json()) as Yanit;

      for (const satir of veri.eklenecekler) {
        /* `add` bir kez bir adet ekliyor; miktar kadar çağrılıyor.
           Yazma eşzamanlı (localStorage), sıra güvenli. */
        for (let i = 0; i < satir.adet; i += 1) {
          add(satir.urun, satir.varyant);
        }
      }

      if (veri.eklenecekler.length === 0) {
        setAtlananlar(veri.atlananlar);
        setDurum("bos");
        return;
      }

      /*
        Atlanan varsa SEPETE GİTMİYORUZ: müşteri uyarıyı okumadan
        sayfadan çıkmış olurdu. Hepsi eklendiyse sepet açılıyor.
      */
      if (veri.atlananlar.length > 0) {
        setAtlananlar(veri.atlananlar);
        setDurum("bos");
        return;
      }

      router.push("/sepet");
    } catch (hata) {
      console.error(hata);
      setDurum("hata");
    }
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={durum === "calisiyor"}
        onClick={() => void tekrarla()}
      >
        {durum === "calisiyor" ? "Hazırlanıyor…" : "Siparişi tekrarla"}
      </button>

      {durum === "hata" && (
        <p className="form-error" role="alert">
          Sepet hazırlanamadı. Bağlantınızı kontrol edip tekrar deneyin.
        </p>
      )}

      {atlananlar.length > 0 && (
        <p className="form-note" role="status">
          {atlananlar.map((satir) => `${satir.ad} — ${satir.sebep}`).join(", ")}
          . Kalanlar sepetinize eklendi.
        </p>
      )}
    </>
  );
}
