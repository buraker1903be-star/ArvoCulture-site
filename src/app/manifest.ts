import type { MetadataRoute } from "next";

/**
 * Uygulama bildirimi (PWA manifest).
 *
 * Bu dosya sayesinde site telefona uygulama olarak kurulabiliyor:
 * ana ekrana ikon eklenir, tarayıcı çubuğu olmadan tam ekran
 * açılır ve uygulama listesinde görünür.
 *
 * `display: standalone` adres çubuğunu gizler — asıl "uygulama
 * gibi" hissini veren şey budur.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ArvoCulture",
    short_name: "ArvoCulture",
    description:
      "Giyim, bakım ve gündelik ritüeller için seçilmiş bir yaşam kültürü.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4f3ee",
    theme_color: "#10120f",
    lang: "tr",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
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
