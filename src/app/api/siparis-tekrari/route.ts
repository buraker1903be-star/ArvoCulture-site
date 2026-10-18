import { NextResponse } from "next/server";
import { getProductVariants } from "@/lib/variants";
import { productsBySlugs } from "@/lib/products-by-slug";
import { displayVariantLabel } from "@/lib/product-types";

/**
 * "Siparişi tekrarla": eski siparişin kalemlerini BUGÜNKÜ fiyat ve
 * stokla sepete hazırlar.
 *
 * NEDEN SUNUCUDA: akla gelen ilk çözüm, sipariş kalemlerini
 * doğrudan sepete yazmaktı. İki şeyi birden bozardı:
 *
 * * FİYAT. Sipariş kalemindeki `unit_price` o günün fiyatı.
 *   Sepete onu yazmak, müşteriye artık geçerli olmayan bir tutar
 *   göstermek olurdu; ödeme adımında ArvoARC bugünkü fiyattan
 *   hesaplar ve iki rakam tutmaz (bu depoda aynı sapma bir kez
 *   yaşandı: 17 Eylül 2026).
 * * STOK VE SEÇENEK. Varyant tükenmiş ya da kaldırılmış olabilir.
 *   SKU'suz eklemek ise ArvoARC'ın siparişi stokta olan HERHANGİ
 *   bir varyanta bağlamasına yol açıyor (`arc_create_order`) —
 *   müşteri seçmediği tonu/bedeni alıyor.
 *
 * Bu yüzden kalemler SKU ile eşleştiriliyor; eşleşmeyen satır
 * sepete hiç girmiyor ve müşteriye SÖYLENİYOR. Sessizce eksik bir
 * sepet, yanlış bir sepetten yalnızca biraz iyidir.
 */

const MAX_KALEM = 50;

type Istek = { slug?: unknown; sku?: unknown; quantity?: unknown };

export async function POST(request: Request) {
  /* Adres BAŞLIKTAN okunuyor: API uçları middleware'in yeniden
     yazdığı yolun dışında ve `vitrinKonagi()` orada başlık
     yedeğine düşüyor (lib/konak). */
  let govde: unknown;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const ham = (govde as { kalemler?: unknown })?.kalemler;
  if (!Array.isArray(ham) || ham.length === 0) {
    return NextResponse.json({ error: "Kalem yok." }, { status: 400 });
  }

  const kalemler = (ham as Istek[])
    .slice(0, MAX_KALEM)
    .map((k) => ({
      slug: typeof k.slug === "string" ? k.slug : "",
      sku: typeof k.sku === "string" ? k.sku : "",
      quantity:
        typeof k.quantity === "number" && k.quantity > 0
          ? Math.min(20, Math.floor(k.quantity))
          : 1,
    }))
    .filter((k) => /^[a-z0-9][a-z0-9-]{0,199}$/.test(k.slug));

  if (kalemler.length === 0) {
    return NextResponse.json({ eklenecekler: [], atlananlar: [] });
  }

  const sluglar = [...new Set(kalemler.map((k) => k.slug))];
  const urunler = await productsBySlugs(sluglar);
  const urunHaritasi = new Map(urunler.map((u) => [u.slug, u]));

  /* Varyantlar slug başına bir kez okunuyor: aynı üründen iki
     beden sipariş edilmiş olabilir. */
  const varyantGirdileri = await Promise.all(
    sluglar.map(async (slug) => [slug, await getProductVariants(slug)] as const),
  );
  const varyantHaritasi = new Map(varyantGirdileri);

  const eklenecekler = [];
  const atlananlar = [];

  for (const kalem of kalemler) {
    const urun = urunHaritasi.get(kalem.slug);
    if (!urun) {
      atlananlar.push({ ad: kalem.slug, sebep: "Ürün artık satışta değil" });
      continue;
    }

    const sonuc = varyantHaritasi.get(kalem.slug);
    /*
      OKUNAMADI "SEÇENEK YOK" DEĞİL. Varyant okuması düşerse
      kalemi SKU'suz eklemek, ArvoARC'ın rastgele bir varyanta
      bağlamasına yol açar; atlamak ve söylemek doğru olan.
    */
    if (!sonuc || sonuc.okunamadi) {
      atlananlar.push({ ad: urun.name, sebep: "Seçenekler okunamadı" });
      continue;
    }

    const varyant = sonuc.varyantlar.find((v) => v.sku === kalem.sku);
    if (!varyant) {
      atlananlar.push({ ad: urun.name, sebep: "Bu seçenek artık yok" });
      continue;
    }

    if (!varyant.available) {
      atlananlar.push({ ad: urun.name, sebep: "Tükendi" });
      continue;
    }

    eklenecekler.push({
      urun,
      varyant: {
        sku: varyant.sku,
        label: displayVariantLabel(varyant),
        price: varyant.price,
        oldPrice:
          varyant.compare_at_price && varyant.compare_at_price > varyant.price
            ? varyant.compare_at_price
            : undefined,
      },
      adet: kalem.quantity,
    });
  }

  return NextResponse.json({ eklenecekler, atlananlar });
}
