import { env } from "@/lib/env";
import type { Product } from "@/lib/product-types";
import { SELLER } from "@/lib/seller";
import { DEFAULT_SALES_RULES, shippingFor, type SalesRules } from "@/lib/order-quote";

const CURRENCY = "TRY";
const COUNTRY = "TR";
const LANGUAGE = "tr-TR";

/*
  Varlıklara sabit kimlik veriliyor.

  Aynı mağazayı her sayfada yeniden tarif etmek yerine tek bir
  kimliğe bağlamak, arama motorlarının ve yanıt üreten sistemlerin
  sayfalar arasında aynı varlıktan söz edildiğini anlamasını
  sağlar. Dağınık tanımlar zayıf sinyal üretir.
*/
export const STORE_ID = `${env.siteUrl}/#store`;
export const WEBSITE_ID = `${env.siteUrl}/#website`;

/**
 * Product + Offer şeması.
 *
 * Google Alışveriş’in ücretsiz listelemeleri ve zengin sonuçlar bu
 * işaretlemeye bağlıdır; fiyat, para birimi ve stok durumu eksiksiz
 * olmalıdır.
 */
/**
 * Şemadaki varyant bilgisi.
 *
 * Yalnızca gereken alanlar: lib/variants.ts sunucuya özel modülleri
 * (env, arc) çekiyor ve bu dosya istemci tarafında da derleniyor.
 */
export type SchemaVariant = {
  sku: string;
  price: number;
  available: boolean;
};

export function productSchema(
  product: Product,
  rules: SalesRules = DEFAULT_SALES_RULES,
  variants: SchemaVariant[] = [],
) {
  const url = `${env.siteUrl}/urun/${product.slug}`;

  /*
    Fiyat geçerlilik tarihi. Google bu alan yoksa uyarı veriyor.
    Bir yıl ileri veriliyor: kataloğun fiyatları düzenli
    güncelleniyor ve her güncellemede bu tarih de tazeleniyor.
  */
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

  /*
    ÇOK VARYANTLI ÜRÜNDE FİYAT ARALIĞI (17.10.2026).

    Şema tek bir Offer veriyor ve fiyatı kataloğun verdiği EN DÜŞÜK
    fiyat (ArvoARC: min(v.price)). Tonları farklı fiyatlı bir üründe
    bu, arama sonucunda görünen fiyatla sepette ödenen fiyatın
    ayrışması demek — Google'ın ürün listelemelerinde fiyat
    uyuşmazlığı ürünü listeden düşürüyor.

    Tek varyantlı üründe Offer aynı kalıyor (fiyat kesin). Çok
    varyantlıda AggregateOffer veriliyor: alt ve üst fiyat,
    varyant sayısı. Varyant başına ayrı Offer listelemek de
    doğru olurdu ama 60 bedenli bir üründe sayfaya kilobaytlarca
    yineleme eklerdi.
  */
  const tekVaryant = variants.length === 1 ? variants[0] : undefined;
  const fiyatlar = variants.map((varyant) => varyant.price).filter((fiyat) => fiyat > 0);
  const altFiyat = fiyatlar.length ? Math.min(...fiyatlar) : product.price;
  const ustFiyat = fiyatlar.length ? Math.max(...fiyatlar) : product.price;
  const aralikVar = variants.length > 1;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.description || product.subtitle,
    /*
      SKU GERÇEK SKU OLMALI (17.10.2026). Burada ürün slug'ı
      yazılıyordu: Google'ın ürün listelemelerinde satıcı kimliği
      olarak kullanılan alan, mağazanın hiçbir yerinde geçmeyen bir
      değer taşıyordu. Tek varyantlı üründe varyantın SKU'su
      yazılıyor; çok varyantlı üründe tek bir SKU yoktur, o yüzden
      alan hiç verilmiyor (uydurmaktansa boş bırakmak doğru).
    */
    ...(tekVaryant ? { sku: tekVaryant.sku } : {}),
    url,
    inLanguage: LANGUAGE,
    /* Galerinin tamamı veriliyor; tek görsel zengin sonuçlarda
       daha zayıf görünüyor. */
    ...(product.images.length > 0
      ? { image: product.images }
      : product.image
        ? { image: [product.image] }
        : {}),
    brand: { "@type": "Brand", name: product.eyebrow || "ArvoCulture" },
    ...(product.category ? { category: product.category } : {}),
    itemCondition: "https://schema.org/NewCondition",
    offers: {
      ...(aralikVar
        ? {
            "@type": "AggregateOffer",
            offerCount: variants.length,
            lowPrice: altFiyat.toFixed(2),
            highPrice: ustFiyat.toFixed(2),
          }
        : {
            "@type": "Offer",
            price: (tekVaryant?.price ?? product.price).toFixed(2),
          }),
      url,
      priceCurrency: CURRENCY,
      priceValidUntil: priceValidUntil.toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      /*
        Varyant bilgisi varsa ondan okunuyor: ürünün "satılabilir"
        olması, varyantlarından EN AZ BİRİNİN satılabilir olması
        demek (ArvoARC: bool_or(arc_variant_available)). Varyant
        listesi gelmediyse ürünün kendi alanına düşülüyor.
      */
      availability:
        (variants.length ? !variants.some((varyant) => varyant.available) : product.available === false)
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      seller: { "@id": STORE_ID },
      /*
        Kargo. Google'ın ürün listelemeleri bu alan yokken uyarı
        veriyordu. Ücret ürünün kendi fiyatına göre: eşiğin üzerindeki
        tek ürün ücretsiz gönderiliyor. Teslimat süresi verilmiyor —
        mağazanın taahhüt ettiği bir süre yok, uydurulmamalı.
      */
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          /* Eşik tek ürünlük sepete göre: en düşük varyant fiyatı
             eşiği geçmiyorsa kargo ücretli görünür. */
          value: shippingFor(altFiyat, false, rules).toFixed(2),
          currency: CURRENCY,
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: COUNTRY,
        },
      },
      /*
        İade koşulları. Değerler seller.ts’ten geliyor — mağazanın
        hukuki metinleriyle aynı kaynak. Şemada yazan süre ile
        sözleşmede yazan sürenin ayrışması mevzuat açısından risk.

        Mesafeli Sözleşmeler Yönetmeliği’ne göre cayma hakkı 14 gün
        ve iade kargo bedeli tüketiciye ait.
      */
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: COUNTRY,
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: SELLER.withdrawalDays,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        merchantReturnLink: `${env.siteUrl}/iptal-iade`,
      },
    },
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${env.siteUrl}${step.path}`,
    })),
  };
}

/**
 * Koleksiyon sayfası şeması.
 *
 * Listeleme sayfalarının hiçbir işaretlemesi yoktu. ItemList,
 * sayfadaki ürünlerin sırasını ve kimliğini bildirir; hem klasik
 * zengin sonuçlarda hem de yanıt üreten sistemlerin "bu sayfada ne
 * var" sorusunu cevaplamasında kullanılır.
 */
export function collectionSchema({
  title,
  description,
  path,
  products,
}: {
  title: string;
  description: string;
  path: string;
  products: Product[];
}) {
  const url = `${env.siteUrl}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: title,
    description,
    url,
    inLanguage: LANGUAGE,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${env.siteUrl}/urun/${product.slug}`,
        name: product.name,
      })),
    },
  };
}

/**
 * Site şeması ve site içi arama.
 *
 * `SearchAction`, arama motorlarına sitenin kendi aramasını nasıl
 * çağıracağını söyler; sonuç sayfasında arama kutusu çıkabilir.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SELLER.brand,
    url: env.siteUrl,
    inLanguage: LANGUAGE,
    publisher: { "@id": STORE_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${env.siteUrl}/arama?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Mağaza kimliği.
 *
 * Önceden yalnızca ad, adres ve para birimi vardı. Kimlik
 * sinyalleri zayıf olduğu için arama motorları mağazayı gerçek bir
 * işletmeyle ilişkilendirmekte zorlanır. Ticari unvan, vergi
 * kimliği, adres ve iletişim noktası burada tek kaynaktan
 * (seller.ts) besleniyor — hukuki sayfalarla aynı veriden.
 */
export function storeSchema(options: { instagramUrl?: string } = {}) {
  const sameAs = [SELLER.website, options.instagramUrl].filter(
    (value): value is string => Boolean(value),
  );

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": STORE_ID,
    name: SELLER.brand,
    legalName: SELLER.legalName,
    url: env.siteUrl,
    logo: `${env.siteUrl}/arvoculture-logo-transparent.png`,
    image: `${env.siteUrl}/arvoculture-logo-transparent.png`,
    email: SELLER.email,
    telephone: SELLER.phone,
    currenciesAccepted: CURRENCY,
    /* Vergi kimlik numarası; işletmeyi resmî kayıtlara bağlar. */
    taxID: SELLER.taxNumber,
    vatID: SELLER.taxNumber,
    address: {
      "@type": "PostalAddress",
      streetAddress: SELLER.address,
      addressLocality: "Beylikdüzü",
      addressRegion: "İstanbul",
      postalCode: "34524",
      addressCountry: COUNTRY,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SELLER.email,
      telephone: SELLER.phone,
      availableLanguage: ["tr"],
      areaServed: COUNTRY,
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    /** Holding ile varlık bağı. Tek yönlü bağ zayıf sinyal üretir. */
    parentOrganization: {
      "@type": "Organization",
      name: "ArvoCulture Group",
      url: "https://arvoculturegroup.com",
    },
  };
}
