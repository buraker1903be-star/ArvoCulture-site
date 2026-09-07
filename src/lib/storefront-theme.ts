import "server-only";
import { cache } from "react";
import { env } from "@/lib/env";
export type StorefrontTheme = {
  announcement: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_emphasis: string;
  hero_description: string;
  hero_image_url?: string;
  primary_cta_label: string;
  primary_cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  featured_eyebrow: string;
  featured_title: string;
  campaign_title: string;
  campaign_description: string;
  campaign_image_url?: string;
  primary_color: string;
  accent_color: string;
  background_color: string;
  typography: string;
  hero_style: string;
  header_layout: string;
  sticky_header: boolean;
  show_search: boolean;
  show_account: boolean;
  product_card_style: string;
  product_image_ratio: string;
  products_per_row: number;
  show_vendor: boolean;
  show_badges: boolean;
  show_quick_add: boolean;
  show_manifest: boolean;
  show_worlds: boolean;
  show_featured: boolean;
  show_campaign: boolean;
  show_values: boolean;
  order_manifest: number;
  order_worlds: number;
  order_featured: number;
  order_campaign: number;
  order_values: number;
  manifest_title: string;
  manifest_description: string;
  apparel_title: string;
  apparel_description: string;
  beauty_title: string;
  beauty_description: string;
  trust_one: string;
  trust_two: string;
  trust_three: string;
  trust_four: string;
  footer_tagline: string;
  instagram_url?: string;
  facebook_url?: string;
  logo_url?: string;
  favicon_url?: string;
  store_name?: string;
};
export const defaultTheme: StorefrontTheme = {
  announcement: "2.000 TL üzeri ücretsiz kargo • İlk alışverişe ARVO10",
  hero_eyebrow: "ARVOCULTURE · APPAREL & BEAUTY",
  hero_title: "Seçtiğin şey,",
  hero_emphasis: "senin hikâyen.",
  hero_description:
    "Tarzını, bakımını ve gündelik ritüellerini tek bir kültürde buluşturan özgün seçkiler.",
  hero_image_url:
    "https://cdn.shopify.com/s/files/1/0995/6740/3322/files/uN9qiyIinOoNTblcW4xwy_xsN8HDzN_00001.png?v=1782830698&width=1920",
  primary_cta_label: "Giyimi keşfet",
  primary_cta_href: "/koleksiyon/giyim",
  secondary_cta_label: "Bakımı keşfet",
  secondary_cta_href: "/koleksiyon/bakim",
  featured_eyebrow: "ÖNE ÇIKANLAR",
  featured_title: "Şimdi keşfet.",
  campaign_title: "İlk seçimine özel.",
  campaign_description: "İlk siparişinde ARVO10 koduyla %10 indirim.",
  primary_color: "#111210",
  accent_color: "#D9FF43",
  background_color: "#F5F2EC",
  typography: "editorial",
  hero_style: "editorial-orbs",
  header_layout: "centered",
  sticky_header: true,
  show_search: true,
  show_account: true,
  product_card_style: "editorial",
  product_image_ratio: "square",
  products_per_row: 4,
  show_vendor: true,
  show_badges: true,
  show_quick_add: true,
  show_manifest: true,
  show_worlds: true,
  show_featured: true,
  show_campaign: true,
  show_values: true,
  order_manifest: 20,
  order_worlds: 30,
  order_featured: 40,
  order_campaign: 50,
  order_values: 60,
  manifest_title: "İki dünya. Tek yaşam kültürü.",
  manifest_description:
    "Giydiğin parçadan günlük bakım ritüeline kadar her seçim, kendini anlatma biçimindir.",
  apparel_title: "Kendini giy.",
  apparel_description: "Zamansız parçalar. Özgün duruşlar.",
  beauty_title: "Kendine iyi bak.",
  beauty_description: "Günlük ritüelin için seçilmiş bakım.",
  trust_one: "Seçilmiş ürünler",
  trust_two: "Güvenli ödeme",
  trust_three: "Özenli paketleme",
  trust_four: "Kolay iade",
  footer_tagline:
    "Giyim, bakım ve gündelik ritüeller için seçilmiş bir yaşam kültürü.",
  store_name: "ArvoCulture",
};
const str = (v: unknown, f: string, max = 360) =>
  typeof v === "string" && v.trim() ? v.trim().slice(0, max) : f;
const bool = (v: unknown, f: boolean) => (typeof v === "boolean" ? v : f);
const num = (v: unknown, f: number, min = 0, max = 100) =>
  typeof v === "number" && Number.isFinite(v)
    ? Math.min(max, Math.max(min, v))
    : f;
const pick = (v: unknown, a: string[], f: string) =>
  a.includes(String(v)) ? String(v) : f;
const color = (v: unknown, f: string) =>
  typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v) ? v : f;
const path = (v: unknown, f: string) =>
  typeof v === "string" && v.startsWith("/") ? v.slice(0, 240) : f;
/**
 * Tema görsel yapılandırmadır. Fiyat verisinden farklı olarak burada
 * varsayılana düşmek güvenlidir; renk hatası satış hatası değildir.
 */
export const getStorefrontTheme = cache(async (): Promise<StorefrontTheme> => {
  const url = env.supabaseUrl;
  const key = env.supabaseKey;
  const id = env.organizationId;
  try {
    const endpoint = new URL("/rest/v1/arc_store_themes", url);
    endpoint.searchParams.set("organization_id", `eq.${id}`);
    endpoint.searchParams.set("mode", "eq.published");
    endpoint.searchParams.set("select", "config");
    endpoint.searchParams.set("limit", "1");
    const response = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60, tags: ["storefront-theme"] },
    });
    if (!response.ok) return defaultTheme;
    const rows = (await response.json()) as Array<{
      config?: Record<string, unknown>;
    }>;
    const c = rows[0]?.config ?? {},
      d = defaultTheme;
    return {
      ...d,
      announcement: str(c.announcement, d.announcement, 180),
      hero_eyebrow: str(c.hero_eyebrow, d.hero_eyebrow, 100),
      hero_title: str(c.hero_title, d.hero_title, 100),
      hero_emphasis: str(c.hero_emphasis, d.hero_emphasis, 100),
      hero_description: str(c.hero_description, d.hero_description),
      hero_image_url:
        typeof c.hero_image_url === "string" && c.hero_image_url.trim()
          ? c.hero_image_url
          : d.hero_image_url,
      primary_cta_label: str(c.primary_cta_label, d.primary_cta_label, 60),
      primary_cta_href: path(c.primary_cta_href, d.primary_cta_href),
      secondary_cta_label: str(
        c.secondary_cta_label,
        d.secondary_cta_label,
        60,
      ),
      secondary_cta_href: path(c.secondary_cta_href, d.secondary_cta_href),
      featured_eyebrow: str(c.featured_eyebrow, d.featured_eyebrow, 80),
      featured_title: str(c.featured_title, d.featured_title, 100),
      campaign_title: str(c.campaign_title, d.campaign_title, 100),
      campaign_description: str(
        c.campaign_description,
        d.campaign_description,
        240,
      ),
      campaign_image_url:
        typeof c.campaign_image_url === "string"
          ? c.campaign_image_url
          : undefined,
      primary_color: color(c.primary_color, d.primary_color),
      accent_color: color(c.accent_color, d.accent_color),
      background_color: color(c.background_color, d.background_color),
      typography: pick(
        c.typography,
        ["editorial", "modern", "minimal"],
        d.typography,
      ),
      hero_style: pick(
        c.hero_style,
        ["editorial-orbs", "split", "minimal"],
        d.hero_style,
      ),
      header_layout: pick(
        c.header_layout,
        ["centered", "logo-left", "minimal"],
        d.header_layout,
      ),
      sticky_header: bool(c.sticky_header, d.sticky_header),
      show_search: bool(c.show_search, d.show_search),
      show_account: bool(c.show_account, d.show_account),
      product_card_style: pick(
        c.product_card_style,
        ["editorial", "bordered", "minimal"],
        d.product_card_style,
      ),
      product_image_ratio: pick(
        c.product_image_ratio,
        ["portrait", "square", "landscape"],
        d.product_image_ratio,
      ),
      products_per_row: num(c.products_per_row, d.products_per_row, 2, 5),
      show_vendor: bool(c.show_vendor, d.show_vendor),
      show_badges: bool(c.show_badges, d.show_badges),
      show_quick_add: bool(c.show_quick_add, d.show_quick_add),
      show_manifest: bool(c.show_manifest, d.show_manifest),
      show_worlds: bool(c.show_worlds, d.show_worlds),
      show_featured: bool(c.show_featured, d.show_featured),
      show_campaign: bool(c.show_campaign, d.show_campaign),
      show_values: bool(c.show_values, d.show_values),
      order_manifest: num(c.order_manifest, d.order_manifest),
      order_worlds: num(c.order_worlds, d.order_worlds),
      order_featured: num(c.order_featured, d.order_featured),
      order_campaign: num(c.order_campaign, d.order_campaign),
      order_values: num(c.order_values, d.order_values),
      manifest_title: str(c.manifest_title, d.manifest_title, 140),
      manifest_description: str(c.manifest_description, d.manifest_description),
      apparel_title: str(c.apparel_title, d.apparel_title, 100),
      apparel_description: str(
        c.apparel_description,
        d.apparel_description,
        180,
      ),
      beauty_title: str(c.beauty_title, d.beauty_title, 100),
      beauty_description: str(c.beauty_description, d.beauty_description, 180),
      trust_one: str(c.trust_one, d.trust_one, 80),
      trust_two: str(c.trust_two, d.trust_two, 80),
      trust_three: str(c.trust_three, d.trust_three, 80),
      trust_four: str(c.trust_four, d.trust_four, 80),
      footer_tagline: str(c.footer_tagline, d.footer_tagline, 240),
      instagram_url:
        typeof c.instagram_url === "string" ? c.instagram_url : undefined,
      facebook_url:
        typeof c.facebook_url === "string" ? c.facebook_url : undefined,
      logo_url: typeof c.logo_url === "string" ? c.logo_url : undefined,
      favicon_url:
        typeof c.favicon_url === "string" ? c.favicon_url : undefined,
      store_name: str(c.store_name, d.store_name ?? "ArvoCulture", 160),
    };
  } catch {
    return defaultTheme;
  }
});
