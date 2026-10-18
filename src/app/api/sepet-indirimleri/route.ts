import { NextResponse } from "next/server";
import { getProductVariants } from "@/lib/variants";

/**
 * Sepetteki satırların ÜSTÜ ÇİZİLİ FİYATINI söyler.
 *
 * NEDEN VAR: satırın indirimli sayılıp sayılmayacağı
 * `oldPrice` alanına bakıyor ve o alan 18.10.2026'ya kadar
 * karttan eklenen satırlara hiç yazılmıyordu (bkz. cart.tsx).
 * Kural düzeldi ama MÜŞTERİNİN TARAYICISINDA DURAN sepetler
 * düzelmiyor: orada alan yok, satır indirimsiz sayılıyor ve
 * "indirimdeki ürünlerde geçerli değildir" kuponu o satıra da
 * uygulanıyor.
 *
 * Eski sepeti atmak ya da fiyatları tazelemek DEĞİL — ikisi de
 * müşterinin sepetine izinsiz dokunmak olurdu. Yalnızca eksik
 * alan, kaynağından (varyantın compare_at_price'ı) tamamlanıyor.
 */

const MAX_KALEM = 50;

export async function POST(request: Request) {
  let govde: unknown;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const ham = (govde as { kalemler?: unknown })?.kalemler;
  if (!Array.isArray(ham)) {
    return NextResponse.json({ error: "Kalem yok." }, { status: 400 });
  }

  const kalemler = (ham as Array<{ slug?: unknown; sku?: unknown }>)
    .slice(0, MAX_KALEM)
    .map((k) => ({
      slug: typeof k.slug === "string" ? k.slug : "",
      sku: typeof k.sku === "string" ? k.sku : "",
    }))
    .filter((k) => k.sku && /^[a-z0-9][a-z0-9-]{0,199}$/.test(k.slug));

  const sluglar = [...new Set(kalemler.map((k) => k.slug))];
  const girdiler = await Promise.all(
    sluglar.map(async (slug) => [slug, await getProductVariants(slug)] as const),
  );
  const harita = new Map(girdiler);

  const satirlar = kalemler.map((kalem) => {
    const sonuc = harita.get(kalem.slug);
    /*
      OKUNAMADIYSA SUSUYORUZ. `oldPrice: null` dönmek "bu ürün
      indirimli değil" demek olurdu ve okuma hatası, kuralı
      yeniden kapatırdı. Alan yoksa istemci de dokunmuyor.
    */
    if (!sonuc || sonuc.okunamadi) return { sku: kalem.sku };

    const varyant = sonuc.varyantlar.find((v) => v.sku === kalem.sku);
    if (!varyant) return { sku: kalem.sku, bilinen: true as const };

    return {
      sku: kalem.sku,
      bilinen: true as const,
      oldPrice:
        varyant.compare_at_price && varyant.compare_at_price > varyant.price
          ? varyant.compare_at_price
          : undefined,
    };
  });

  return NextResponse.json({ satirlar });
}
