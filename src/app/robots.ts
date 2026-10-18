import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { vitrinAdresi } from "@/lib/konak";

/*
  KÖK SÖZLEŞMESİ, KONAĞI KENDİSİ OKUYOR.

  Next'in robots/manifest/sitemap sözleşmeleri yalnızca app
  kökünde tanınıyor; `[konak]` altına taşındıklarında rota
  listesinden düştüler. Bu yüzden kökte duruyorlar ve adres
  `vitrinKonagi()` ile istek başlığından geliyor — dinamik bir
  rotada bu sorun değil. Proxy de bu üç adresi yeniden
  yazmıyor (src/proxy.ts).
*/
export const dynamic = "force-dynamic";

/*
  Sepet, ödeme, hesap ve arama sayfalarının dizine girmesi hem
  anlamsız hem de arama sonuçlarında kalitesiz sonuç üretir.
  Favoriler de kişiye özel; sayfanın kendi meta etiketinde
  `noindex` var, burada da tarama dışı bırakılıyor.
*/
const PRIVATE_PATHS = [
  "/sepet",
  "/odeme",
  "/hesap",
  "/arama",
  "/favoriler",
  "/siparis/",
  "/api/",
];

/**
 * Yapay zekâ tarayıcıları.
 *
 * Bunlar ChatGPT, Claude, Perplexity ve Gemini gibi sistemlerin
 * yanıt üretirken kaynak taradığı botlar. Açıkça izin verilmesi,
 * kataloğun bu yanıtlarda kaynak gösterilebilmesi için gerekiyor —
 * müşteri artık ürünü yalnızca arama motorunda değil, bir sohbet
 * penceresinde de arıyor.
 *
 * Ayrım önemli: bu botların bir kısmı yanıt anında kaynak getirir
 * (OAI-SearchBot, PerplexityBot, ChatGPT-User), bir kısmı model
 * eğitimi için tarar (GPTBot, ClaudeBot, CCBot). İkisi de açık
 * bırakıldı; ticari katalog metni gizlenecek bir varlık değil ve
 * görünürlük kaybı, eğitim verisi endişesinden ağır basıyor.
 * Fikir değişirse eğitim botları buradan ayrı ayrı kapatılabilir.
 */
const AI_AGENTS = [
  /* Yanıt anında kaynak getirenler */
  "OAI-SearchBot",
  "ChatGPT-User",
  "PerplexityBot",
  "Perplexity-User",
  "Claude-User",
  "Claude-SearchBot",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "Bingbot",
  /* Model eğitimi için tarayanlar */
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "CCBot",
  "Meta-ExternalAgent",
  "cohere-ai",
];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const adres = await vitrinAdresi();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PRIVATE_PATHS,
      },
      /*
        Yapay zekâ botlarına aynı kurallar açıkça yazılıyor.
        Yıldız kuralı zaten onları da kapsıyor, ama bazı botlar
        kendi adına yazılmış bir kural bulamazsa temkinli
        davranıyor; açık izin belirsizliği kaldırıyor.
      */
      ...AI_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PRIVATE_PATHS,
      })),
    ],
    sitemap: `${adres}/sitemap.xml`,
    host: adres,
  };
}
