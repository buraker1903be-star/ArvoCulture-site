import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "@/lib/env";
import { canOptimizeImage } from "@/lib/image-hosts";
import { vitrinAdresi } from "@/lib/konak";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { gorselOlcusu } from "@/lib/gorsel-olcusu";

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

/**
 * Kartın logosu.
 *
 * ÖNCE MAĞAZANIN KENDİ LOGOSU. Burada yalnızca depodaki
 * `public/arvoculture-logo-transparent.png` okunuyordu: ikinci bir
 * kiracının paylaşım kartında — WhatsApp'ta, Twitter'da, Slack'te —
 * BİZİM logomuz görünüyordu. Paylaşılan bağlantı geri alınamaz;
 * kart bir kez önbelleklenince platformda öyle kalıyor.
 *
 * Panele yüklenen logo uzak bir adres (Supabase depolama), o yüzden
 * ürün görseliyle aynı yoldan geçiyor. Okunamazsa depodaki dosyaya
 * düşülüyor: logosuz bir kart da çiziliyor ama tanınmaz oluyor.
 */
export type OgLogo = { src: string; en: number; boy: number } | null;

export async function ogLogo(url?: string): Promise<OgLogo> {
  if (url) {
    const uzak = await ogProductImage(url);
    const olcu = uzak && gorselOlcusu(uzak);
    if (uzak && olcu) return { src: uzak, ...olcu };
  }

  /*
    DEPODAKİ DOSYAYA DÜŞÜLMÜYOR (18.10.2026).

    Burada `public/arvoculture-logo-transparent.png` yedeği vardı
    ve logosu olmayan ikinci bir kiracının paylaşım kartında
    ArvoCulture'ın logosu görünüyordu — paylaşılan bağlantı geri
    alınamaz, kart bir kez önbelleklenince platformda öyle kalır.

    `null` dönünce kart mağazanın ADINI yazıyor (cards.ts → logo).
  */
  return null;
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
  const adres = await vitrinAdresi();
  if (!url) return null;

  const absolute = url.startsWith("/") ? `${adres}${url}` : url;
  const candidates =
    canOptimizeImage(url) && !url.startsWith("/")
      ? [
          `${adres}/_next/image?url=${encodeURIComponent(url)}&w=640&q=75`,
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

/*
  MARKA KARTININ MALZEMESİ TEK YERDE.

  İki rota da varsayılan kartı çiziyor (ana sayfa/koleksiyonlar ve
  ürünü bulunamayan adres). Metinleri iki yerde kurmak, birini
  güncelleyip diğerini unutmak demekti; kart metinleri zaten
  panelden geliyor.

  Adres kanonik konaktan ve şema atılıyor: kartın altında
  "https://" göstermek bir adres satırı değil, bağlantı gibi
  görünen bir gürültü.
*/
export async function ogMarka() {
  const [theme, adres] = await Promise.all([getStorefrontTheme(), vitrinAdresi()]);
  const logo = await ogLogo(theme.logo_url);

  return {
    logo,
    storeName: theme.store_name || "Mağaza",
    kart: {
      logo,
      storeName: theme.store_name || "Mağaza",
      eyebrow: theme.hero_eyebrow,
      title: theme.hero_title,
      emphasis: theme.hero_emphasis,
      tagline: theme.footer_tagline,
      host: adres.replace(/^https?:\/\//, "").replace(/\/$/, ""),
    },
  };
}
