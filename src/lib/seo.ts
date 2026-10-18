import type { Product } from "@/lib/product-types";
import { IADE_GUNU } from "@/lib/iade-penceresi";
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

  ADRES PARAMETRE OLDU. Önceden `env.siteUrl` sabitinden kuruluyordu
  ve iki sorun üretiyordu: ikinci bir kiracının yapısal verisi
  ArvoCulture'ın adresini kendi kimliği ilan ediyordu, ve mağazanın
  iki adresi (kendi alan adı + platform alt alan adı) olduğunda
  kanonik adresle tutmuyordu. Çağıran taraf `vitrinAdresi()`
  veriyor — kanonik adresi çözen tek yer orası.

  BU DOSYA SAF KALIYOR: istemci tarafında da derleniyor, o yüzden
  sunucuya özel okumaları (konak, satıcı) içe almıyor; veri
  parametreyle geliyor.
*/
export const storeId = (siteUrl: string) => `${siteUrl}/#store`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

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
  /** Mağazanın kanonik adresi; `vitrinAdresi()` veriyor. */
  siteUrl: string,
  /** Ürünün kendi markası yoksa kullanılacak mağaza adı. */
  storeName: string,
  rules: SalesRules = DEFAULT_SALES_RULES,
  variants: SchemaVariant[] = [],
) {
  const url = `${siteUrl}/urun/${product.slug}`;

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
    /* Ürünün kendi markası yoksa MAĞAZANIN adı. Önceden
       "ArvoCulture" sabitti: ikinci bir kiracının markasız
       ürünü arama motoruna bizim markamızla bildiriliyordu. */
    brand: { "@type": "Brand", name: product.eyebrow || storeName },
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
      seller: { "@id": storeId(siteUrl) },
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
        merchantReturnDays: IADE_GUNU,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        merchantReturnLink: `${siteUrl}/iptal-iade`,
      },
    },
  };
}

export function breadcrumbSchema(
  trail: Array<{ name: string; path: string }>,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: `${siteUrl}${step.path}`,
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
  siteUrl,
}: {
  title: string;
  description: string;
  path: string;
  products: Product[];
  siteUrl: string;
}) {
  const url = `${siteUrl}${path}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    name: title,
    description,
    url,
    inLanguage: LANGUAGE,
    isPartOf: { "@id": websiteId(siteUrl) },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/urun/${product.slug}`,
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
export function websiteSchema({
  brand,
  siteUrl,
}: {
  brand: string;
  siteUrl: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    name: brand,
    url: siteUrl,
    inLanguage: LANGUAGE,
    publisher: { "@id": storeId(siteUrl) },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/arama?q={search_term_string}`,
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
 * kimliği, adres ve iletişim noktası bu yüzden burada.
 *
 * VERİ ARTIK SATICI KAYDINDAN. Hepsi `lib/seller.ts` sabitinden
 * geliyordu, yani ikinci bir kiracının her sayfası arama motoruna
 * "bu işletme ArvoCulture'dır" diyordu: unvan, vergi numarası,
 * adres, e-posta, telefon ve holding bağı. Hukuki sayfalar bir
 * şirketi, yapısal veri BAŞKA bir şirketi gösterirdi — çelişkili
 * bir kimlik sinyali, hem güven hem sıralama açısından kötü.
 *
 * EKSİK ALAN BASILMIYOR. Vergi numarası, telefon ya da üst kuruluş
 * bilgisi olmayan mağazada o alanlar şemaya hiç girmiyor. Yanlış ya
 * da uydurma bir değer basmak, eksik bırakmaktan kötü: geri alınması
 * zor bir varlık bağı kurar.
 *
 * POSTA KODU KALDIRILDI. Önceden "34524", "Beylikdüzü" ve "İstanbul"
 * sabit basılıyordu. İlçe ve il satıcı kaydında var; posta kodu için
 * kolon yok ve schema.org'da zorunlu değil — yanlış posta kodu
 * basmaktansa hiç basmamak.
 */
export type MagazaKimligi = {
  brand: string;
  legalName: string;
  email: string;
  phone: string;
  /**
   * Numaranın bağlantısı: WhatsApp varsa `https://wa.me/…`, yoksa
   * `tel:`.
   *
   * Altbilgideki numara önce `tel:` ile bağlanıyordu ve masaüstünde
   * tıklayınca çoğu tarayıcıda hiçbir şey olmuyordu (ya da bir
   * arama uygulaması seçtiriyordu). Mağazanın hattı zaten WhatsApp
   * hattı; sohbet, müşterinin sipariş numarasını yazabildiği ve
   * yanıtın kayda geçtiği tek kanal.
   */
  phoneLink: string;
  taxNumber: string;
  addressLine: string;
  addressDistrict: string;
  addressCity: string;
  addressCountry: string;
  website: string;
  parentOrganizationName: string;
  parentOrganizationUrl: string;
};

export function storeSchema({
  kimlik,
  siteUrl,
  logoUrl,
  instagramUrl,
}: {
  kimlik: MagazaKimligi;
  siteUrl: string;
  /** Mağazanın logosu; yoksa alan basılmıyor. */
  logoUrl?: string;
  instagramUrl?: string;
}) {
  /*
    sameAs BAŞKA PLATFORMLARDAKİ PROFİLLER İÇİN. Mağazanın kendi
    adresi `url` alanında zaten var; `storefront_url` ona eşitse
    sameAs "ben benim" diyen boş bir atıf olurdu (canlıda böyleydi).
  */
  const sameAs = [
    kimlik.website && kimlik.website.replace(/\/$/, "") !== siteUrl.replace(/\/$/, "")
      ? kimlik.website
      : "",
    instagramUrl,
  ].filter((value): value is string => Boolean(value));

  const adres = [
    kimlik.addressLine && { streetAddress: kimlik.addressLine },
    kimlik.addressDistrict && { addressLocality: kimlik.addressDistrict },
    kimlik.addressCity && { addressRegion: kimlik.addressCity },
  ].filter(Boolean);

  const ustKurulus =
    kimlik.parentOrganizationName && kimlik.parentOrganizationUrl
      ? {
          parentOrganization: {
            "@type": "Organization",
            name: kimlik.parentOrganizationName,
            url: kimlik.parentOrganizationUrl,
          },
        }
      : {};

  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": storeId(siteUrl),
    name: kimlik.brand,
    ...(kimlik.legalName ? { legalName: kimlik.legalName } : {}),
    url: siteUrl,
    ...(logoUrl ? { logo: logoUrl, image: logoUrl } : {}),
    ...(kimlik.email ? { email: kimlik.email } : {}),
    ...(kimlik.phone ? { telephone: kimlik.phone } : {}),
    currenciesAccepted: CURRENCY,
    /* Vergi kimlik numarası; işletmeyi resmî kayıtlara bağlar. */
    ...(kimlik.taxNumber
      ? { taxID: kimlik.taxNumber, vatID: kimlik.taxNumber }
      : {}),
    ...(adres.length > 0
      ? {
          address: Object.assign(
            { "@type": "PostalAddress", addressCountry: COUNTRY },
            ...adres,
          ),
        }
      : {}),
    ...(kimlik.email || kimlik.phone
      ? {
          contactPoint: {
            "@type": "ContactPoint",
            contactType: "customer support",
            ...(kimlik.email ? { email: kimlik.email } : {}),
            ...(kimlik.phone ? { telephone: kimlik.phone } : {}),
            availableLanguage: ["tr"],
            areaServed: COUNTRY,
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    /** Holding ile varlık bağı. Tek yönlü bağ zayıf sinyal üretir. */
    ...ustKurulus,
  };
}

/**
 * Ana sayfadaki kategori şeridinin şeması.
 *
 * Ana sayfanın hiçbir `ItemList`i yoktu: mağaza ve site şeması
 * (storeSchema/websiteSchema) "bu site kimin" sorusunu yanıtlıyor
 * ama "bu sayfada ne var" sorusunu yanıtlayan bir işaretleme
 * bulunmuyordu. Yanıt üreten sistemler bir mağazayı özetlerken
 * önce bu listeye bakıyor; kategori adlarını fotoğrafın üstündeki
 * yazıdan çıkarmaları gerekiyordu.
 *
 * Ürün sayısı da listeye giriyor: kategorinin ne kadar büyük
 * olduğu metinde değil veride duruyor.
 */
export function kategoriListesiSchema(
  items: Array<{ label: string; href: string; urunSayisi?: number }>,
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteUrl}/#kategoriler`,
    name: "Kategoriler",
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      url: `${siteUrl}${item.href}`,
      ...(item.urunSayisi
        ? {
            item: {
              "@type": "CollectionPage",
              name: item.label,
              url: `${siteUrl}${item.href}`,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: item.urunSayisi,
              },
            },
          }
        : {}),
    })),
  };
}
