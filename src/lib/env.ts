/**
 * Ortam değişkenleri tek yerden, doğrulanarak okunur. Eksik değişkende
 * build açık bir hatayla durur — yanlış yapılandırmayla sessizce çalışan
 * bir mağaza, hiç çalışmayan mağazadan daha tehlikelidir.
 */
function required(name: string, value: string | undefined): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `Ortam değişkeni eksik: ${name}. .env.example dosyasına bakın.`,
    );
  }
  return value.trim();
}

export const env = {
  supabaseUrl: required(
    "ARC_SUPABASE_URL",
    process.env.ARC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
  ).replace(/\/$/, ""),

  supabaseKey: required(
    "ARC_SUPABASE_PUBLISHABLE_KEY",
    process.env.ARC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  ),

  /*
    SABİT KURUM KİMLİĞİ KALDIRILDI (17.10.2026). Vitrin çok mağazalı:
    kurum artık adresten çözülüyor (lib/konak → vitrinKurumu).
    Zorunlu bir ARC_ORGANIZATION_ID, ortak dağıtımda her mağazaya
    ArvoCulture'ın temasını ve mağaza durumunu giydirirdi — üstelik
    değişkeni unutan bir kurulum derlemede değil, ilk istekte
    patlardı.
  */

  siteUrl: (
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://arvoculture.com"
  ).replace(/\/$/, ""),
} as const;

/** next.config.ts içindeki görsel allowlist’i için gerekir. */
export const supabaseHostname = new URL(env.supabaseUrl).hostname;
