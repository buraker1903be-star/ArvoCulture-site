import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oahshpkgdzrraqdzjqau.supabase.co",
        pathname: "/storage/v1/object/public/organization-assets/**",
      },
      {
        protocol: "https",
        hostname: "oahshpkgdzrraqdzjqau.supabase.co",
        pathname: "/storage/v1/object/public/arc-product-images/**",
      },
    ],
  },
};
export default nextConfig;
