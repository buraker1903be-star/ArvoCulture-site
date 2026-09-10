import type { NextConfig } from "next";
import { supabaseHostname } from "./src/lib/env";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    // Host artık ortam değişkeninden türetiliyor; staging ve production
    // farklı ARC projeleri kullanabilir.
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/organization-assets/**",
      },
      {
        protocol: "https",
        hostname: supabaseHostname,
        pathname: "/storage/v1/object/public/arc-product-images/**",
      },
      // Tarzyeri ürün görselleri. Görseller kopyalanmıyor,
      // tedarikçinin CDN'inden sunuluyor.
      {
        protocol: "https",
        hostname: "percdn.com",
      },
    ],
  },
  async headers() {
    return [
      /*
        Servis çalışanı hiçbir zaman önbellekten okunmamalı.
        Tarayıcılar bu dosyayı zaten sınırlı süre saklıyor ama
        araya giren bir CDN katmanı eski sürümü haftalarca
        sunabilir — ve eski servis çalışanı, sitenin geri kalanı
        güncellenmişken eski varlıkları dağıtmaya devam eder.
        Bu, hata ayıklaması en zor sorunlardan biri.
      */
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
