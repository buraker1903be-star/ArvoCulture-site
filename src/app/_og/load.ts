import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "@/lib/env";
import { canOptimizeImage } from "@/lib/image-hosts";

/*
  Paylaşım kartlarının malzemesi: fontlar, logo ve ürün görseli.

  Yollar `join(process.cwd(), "…")` biçiminde ve sabit yazılı: Next'in
  dosya izleyicisi bu kalıbı tanıyıp dosyaları sunucu paketine
  ekliyor. Değişkenle kurulan yol izlenmez ve canlıda "dosya yok"
  hatası verir.

  Fontlar Google Fonts deposundaki Cormorant Garamond ve Inter'den
  (OFL). Satori woff2 okuyamıyor, bu yüzden next/font'un dosyaları
  kullanılamıyor. Depodaki değişken TTF'leri de okuyamıyor: font
  okuyucusu `fvar` tablosunda çöküyor. Dosyalardan varyasyon tabloları
  çıkarıldı; geriye varsayılan kesim kaldı: Cormorant Light (300),
  Inter Regular (400).
*/
export async function ogFonts() {
  const [cormorant, inter] = await Promise.all([
    readFile(join(process.cwd(), "src/app/_og/fonts/Cormorant-Light.ttf")),
    readFile(join(process.cwd(), "src/app/_og/fonts/Inter-Regular.ttf")),
  ]);
  return [
    { name: "Cormorant", data: cormorant, style: "normal" as const, weight: 300 as const },
    { name: "Inter", data: inter, style: "normal" as const, weight: 400 as const },
  ];
}

export async function ogLogo(): Promise<string | null> {
  try {
    const data = await readFile(
      join(process.cwd(), "public/arvoculture-logo-transparent.png"),
    );
    return `data:image/png;base64,${data.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * Ürün görseli, satori'nin okuyabileceği biçimde (PNG/JPEG data URI).
 *
 * Önce sitenin kendi optimize edicisinden 640px PNG isteniyor: ham
 * dosyalar 300–800 KB, küçültülmüş hâli 40–50 KB. Olmazsa ham adres
 * deneniyor. WebP gibi satori'nin okuyamadığı bir biçim gelirse
 * görsel atlanıyor; kart yine çiziliyor.
 */
export async function ogProductImage(url?: string): Promise<string | null> {
  if (!url) return null;

  const absolute = url.startsWith("/") ? `${env.siteUrl}${url}` : url;
  const candidates =
    canOptimizeImage(url) && !url.startsWith("/")
      ? [
          `${env.siteUrl}/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`,
          absolute,
        ]
      : [absolute];

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, {
        headers: { Accept: "image/png,image/jpeg" },
        signal: AbortSignal.timeout(6000),
      });
      const type = (response.headers.get("content-type") ?? "").split(";")[0];
      if (!response.ok || !/^image\/(png|jpeg)$/.test(type)) continue;
      const data = Buffer.from(await response.arrayBuffer());
      return `data:${type};base64,${data.toString("base64")}`;
    } catch {
      // Sıradaki aday.
    }
  }
  return null;
}
