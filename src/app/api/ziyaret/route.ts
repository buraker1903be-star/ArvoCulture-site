import { NextResponse } from "next/server";
import { rpc } from "@/lib/arc";

/**
 * Ziyaret kaydı.
 *
 * NEDEN AYRI BİR UÇ: konum Vercel'in KENAR BAŞLIKLARINDAN
 * geliyor (`x-vercel-ip-*`) ve o başlıklar yalnızca tarayıcıdan
 * gelen gerçek istekte var. Sayfanın sunucu tarafında okunamaz;
 * sayfa önbellekten de dönebilir ve o zaman hiç çalışmazdı.
 *
 * KONUM İZNİ İSTENMİYOR. Tarayıcıdan `geolocation` sormak hem
 * izin kutusu açardı hem de kişiye ait kesin konum verirdi;
 * buradaki değer şehir merkezinin yaklaşık koordinatı.
 *
 * IP KAYDEDİLMİYOR: veritabanına yalnızca günlük tuzlu karması
 * gidiyor ve o da yalnızca hız sınırı için (bkz. migration
 * 20261018212040).
 */

export const dynamic = "force-dynamic";

/** Ürün sayfasıysa slug; değilse null. */
function urunSlugu(yol: string): string | null {
  const eslesme = /^\/urun\/([a-z0-9][a-z0-9-]{0,199})$/.exec(yol);
  return eslesme ? eslesme[1] : null;
}

export async function POST(request: Request) {
  let govde: unknown;
  try {
    govde = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ham = String((govde as { yol?: unknown })?.yol ?? "").trim();
  /* Yalnızca kendi sitemizin yolu: tam adres ya da başka bir
     siteye ait bir şey yazılmasın. */
  if (!ham.startsWith("/") || ham.length > 300) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  /* Sorgu dizesi atılıyor: arama terimi ve kupon kodu gibi
     kişiye ait olabilecek değerler kayda girmesin. */
  const yol = ham.split("?")[0].split("#")[0];

  /*
    Kaynak TARAYICIDAN geliyor: sunucudaki `referer` başlığı bu
    isteğin kendi sayfası olurdu (aynı köken), dış kaynağı
    göstermezdi. Panel onu okunabilir platform adına çeviriyor
    (ArvoARC lib/ziyaret-kaynagi).
  */
  const kaynakHam = (govde as { kaynak?: unknown })?.kaynak;
  const kaynak =
    typeof kaynakHam === "string" && kaynakHam.trim()
      ? kaynakHam.trim().slice(0, 80)
      : null;

  const bas = request.headers;
  const sayi = (deger: string | null) => {
    const n = Number(deger);
    return Number.isFinite(n) ? n : null;
  };

  try {
    await rpc(
      "arc_storefront_visit",
      {
        p_host: bas.get("host") ?? "",
        p_path: yol,
        p_product_slug: urunSlugu(yol),
        p_country: bas.get("x-vercel-ip-country"),
        /* Şehir adı yüzde kodlu gelebiliyor ("Istanbul" / "K%C3%B6ln"). */
        p_city: bas.get("x-vercel-ip-city")
          ? decodeURIComponent(bas.get("x-vercel-ip-city") as string)
          : null,
        p_lat: sayi(bas.get("x-vercel-ip-latitude")),
        p_lon: sayi(bas.get("x-vercel-ip-longitude")),
        p_ip: bas.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        p_source: kaynak,
      },
      { onbelleksiz: true },
    );
  } catch (hata) {
    /*
      Sayaç İKİNCİL İŞ: yazılamadıysa müşteriye hiçbir şey
      olmamalı. Ama yanıt "ok" DEMİYOR — uç her durumda başarı
      döndürürken yazmanın düşüp düşmediği hiçbir yerden
      anlaşılamıyordu; tarayıcıdan tek bir istekle sınamak
      mümkün değildi.
    */
    console.error("Ziyaret kaydedilemedi:", hata);
    return NextResponse.json({
      ok: false,
      /* Sır değil: fonksiyon adı ve durum kodu. Anahtar ya da
         istek gövdesi dönmüyor. */
      hata: hata instanceof Error ? hata.message.slice(0, 200) : "bilinmiyor",
    });
  }

  return NextResponse.json({ ok: true });
}
