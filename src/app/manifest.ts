import type { MetadataRoute } from "next";
import { getStorefrontTheme } from "@/lib/storefront-theme";

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

/**
 * Uygulama bildirimi (PWA manifest).
 *
 * Bu dosya sayesinde site telefona uygulama olarak kurulabiliyor:
 * ana ekrana ikon eklenir, tarayıcı çubuğu olmadan tam ekran
 * açılır ve uygulama listesinde görünür.
 *
 * `display: standalone` adres çubuğunu gizler — asıl "uygulama
 * gibi" hissini veren şey budur.
 *
 * AD, METİN VE RENKLER TEMADAN. Önceden "ArvoCulture" ve bizim
 * tanıtım cümlemiz koda yazılıydı: ikinci bir kiracının müşterisi
 * siteyi telefonuna kurduğunda ana ekranında BİZİM markamızın adı
 * ve ikonu duruyordu. Üstelik geri alınması zor — kurulu uygulamanın
 * adı ancak müşteri yeniden kurduğunda güncelleniyor.
 *
 * İkonlar hâlâ depodaki dosyalar (`public/icon/*`): maskelenebilir
 * ikon, güvenli boşluğu ayarlanmış ayrı bir kesim gerektiriyor ve
 * panele yüklenen logodan otomatik üretilemiyor. Kiracının kendi
 * ikonunu yüklemesi ayrı bir iş; o zamana kadar yüklediği logo
 * `favicon_url` üzerinden sekmede görünüyor.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const theme = await getStorefrontTheme();
  const ad = theme.store_name || "Mağaza";

  return {
    name: ad,
    short_name: ad,
    description: theme.footer_tagline,
    /*
      Uygulamanın kalıcı kimliği. Verilmezse tarayıcı start_url'ü
      kimlik olarak kullanır; ileride açılış sayfası değişirse
      (örneğin kampanya sayfası) kurulu uygulama "başka bir
      uygulama" sayılır ve müşterinin ana ekranındaki ikon
      güncellenmez.
    */
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    /*
      Desteklenmeyen tarayıcıda sessizce düşülecek sıra.
      "minimal-ui" adres çubuğunu gizler ama geri/ileri bırakır;
      standalone'u desteklemeyen tarayıcıda sekmeye düşmekten iyidir.
    */
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    /* Kurulum ekranının ve durum çubuğunun rengi mağazanın
       temasından; sabit değerler başka bir markanın uygulamasına
       bizim paletimizi giydiriyordu. */
    background_color: theme.background_color,
    theme_color: theme.primary_color,
    lang: "tr",
    dir: "ltr",
    categories: ["shopping"],
    icons: [
      {
        src: "/icon/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Android ikonu daire içine kırpıyor; bu sürümde
        // logonun etrafında güvenli boşluk var.
        src: "/icon/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Sepetim",
        url: "/sepet",
      },
      {
        name: "Siparişlerim",
        url: "/hesap",
      },
      {
        name: "İndirimdekiler",
        url: "/koleksiyon/firsatlar",
      },
    ],
  };
}
