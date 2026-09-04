export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://arvoculture.com";

/** Sayfa anahtarı -> her dildeki yol. Menü ve hreflang buradan üretilir. */
export const routes = {
  home: { tr: "/", en: "/en" },
  brands: { tr: "/markalar", en: "/en/brands" },
  about: { tr: "/hakkimizda", en: "/en/about" },
  sustainability: { tr: "/surdurulebilirlik", en: "/en/sustainability" },
  future: { tr: "/gelecek", en: "/en/future" },
  careers: { tr: "/kariyer", en: "/en/careers" },
  contact: { tr: "/iletisim", en: "/en/contact" },
} as const;

export type RouteKey = keyof typeof routes;

export function path(key: RouteKey, locale: Locale) {
  return routes[key][locale];
}

export function brandPath(slug: string, locale: Locale) {
  return `${routes.brands[locale]}/${slug}`;
}

export function alternatesFor(key: RouteKey, locale: Locale) {
  return {
    canonical: routes[key][locale],
    languages: { tr: routes[key].tr, en: routes[key].en },
  };
}

export function brandAlternates(slug: string, locale: Locale) {
  return {
    canonical: brandPath(slug, locale),
    languages: {
      tr: brandPath(slug, "tr"),
      en: brandPath(slug, "en"),
    },
  };
}

export const organization = {
  name: "ArvoCulture Group",
  legalName: "ArvoCulture Group Teknoloji Sanayi ve Ticaret Limited Şirketi",
  email: "info@arvoculture.com",
  phone: "+90 506 000 94 99",
  address: {
    street: "Yakuplu Mah. Hürriyet Bulvarı, Skyport Residence No:1 D:113",
    district: "Beylikdüzü",
    city: "İstanbul",
    postalCode: "34524",
    country: "TR",
  },
  /** TODO: Yayına almadan önce doldurun. */
  registry: {
    mersis: "",
    taxOffice: "",
    taxId: "",
    tradeRegistryNo: "",
  },
} as const;

export type BrandStatus = "live" | "development";

type Localized = Record<Locale, string>;
type LocalizedList = Record<Locale, string[]>;

export type Brand = {
  slug: string;
  name: string;
  status: BrandStatus;
  url?: string;
  founded?: string;
  discipline: Localized;
  intro: Localized;
  distinction: Localized;
  offerings: LocalizedList;
};

export const brands: Brand[] = [
  {
    slug: "akademik-merkez",
    name: "Akademik Merkez",
    status: "live",
    url: "https://akademikmerkez.com",
    founded: "2025",
    discipline: { tr: "Akademik danışmanlık", en: "Academic consulting" },
    intro: {
      tr: "Lisans tezinden doçentlik başvurusuna kadar araştırma süreçlerinde yöntem, analiz, literatür ve dil danışmanlığı verir. Araştırmacının yerine geçmeden, süreci öğretici ve izlenebilir hâle getirir.",
      en: "Advises researchers on methodology, analysis, literature and language — from undergraduate theses through associate professorship applications. It makes the process teachable and traceable without standing in for the researcher.",
    },
    distinction: {
      tr: "Özgün çalışma araştırmacıya aittir. Bu bir pazarlama söylemi değil, hizmet kapsamının sınırıdır: Akademik Merkez yöntem kurar, veriyi yorumlar ve dili düzenler; metni araştırmacının yerine yazmaz.",
      en: "The original work belongs to the researcher. This is not marketing language but the boundary of the service: Akademik Merkez designs method, interprets data and edits language. It does not write the text on the researcher's behalf.",
    },
    offerings: {
      tr: [
        "Tez ve makale yöntem danışmanlığı",
        "İstatistiksel analiz danışmanlığı",
        "Literatür tarama danışmanlığı",
        "Anket tasarımı ve raporlama",
        "Akademik dil ve imla editörlüğü",
        "Akademik çeviri",
      ],
      en: [
        "Thesis and article methodology consulting",
        "Statistical analysis consulting",
        "Literature review consulting",
        "Survey design and reporting",
        "Academic language and copy editing",
        "Academic translation",
      ],
    },
  },
  {
    slug: "arvo",
    name: "Arvo",
    status: "live",
    url: "https://arvo-os.com",
    founded: "2025",
    discipline: { tr: "Yazılım ürünleri", en: "Software products" },
    intro: {
      tr: "Kurumların ve araştırma ekiplerinin dağınık süreçlerini tek bir çalışma düzenine bağlayan ürün ailesi. İki ürünle başladı, üçüncüsü geliştirme aşamasında.",
      en: "A product family that connects the scattered processes of companies and research teams into a single working order. It began with two products; a third is in development.",
    },
    distinction: {
      tr: "Düşük karbon ayak izi bir pazarlama etiketi değil, altyapı kararı: bölge seçimi, kaynak kullanımı ve ölçekleme politikası buna göre kurgulanır.",
      en: "A low carbon footprint is an infrastructure decision rather than a label: region selection, resource allocation and scaling policy are shaped around it.",
    },
    offerings: {
      tr: [
        "ArvoOS — CRM, teklif, sözleşme ve finans yönetimi",
        "ArvoLab — literatür, akademik yazım ve veri analizi çalışma alanı",
        "Kurumsal web ve e-ticaret yazılımı",
      ],
      en: [
        "ArvoOS — CRM, quotes, contracts and finance management",
        "ArvoLab — a workspace for literature, academic writing and data analysis",
        "Corporate web and e-commerce software",
      ],
    },
  },
  {
    slug: "perakende",
    name: "Perakende markası",
    status: "development",
    discipline: { tr: "Kozmetik ve hazır giyim", en: "Cosmetics and apparel" },
    intro: {
      tr: "Beauty & Apparel işi yeni marka kimliğiyle yeniden kuruluyor. Ürün altyapısı ve mağaza yazılımı hazır; marka adı ve lansman takvimi netleştiğinde duyurulacak.",
      en: "The beauty and apparel business is being rebuilt under a new brand identity. The product infrastructure and store software are ready; the name and launch date will be announced once settled.",
    },
    distinction: {
      tr: "Mağaza altyapısı Arvo'nun e-ticaret yazılımı üzerinde çalışır — grup içinde geliştirilen bir ürünün ilk saha uygulaması.",
      en: "The storefront runs on Arvo's e-commerce software — the first field deployment of a product built inside the group.",
    },
    offerings: {
      tr: ["Kozmetik ve kişisel bakım", "Hazır giyim"],
      en: ["Cosmetics and personal care", "Apparel"],
    },
  },
];

export function getBrand(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}
