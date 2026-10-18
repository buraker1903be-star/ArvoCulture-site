/*
  TEMANIN SÖZLEŞMESİ VE YANSIZ VARSAYILANI.

  Ayrı dosyada çünkü SAF: `storefront-theme.ts` okuma yapıyor ve
  `lib/konak` üzerinden `next/headers`'a bağlı, o yüzden testten
  import edilemiyordu. Varsayılanın yansız kaldığını sabitleyen
  testler bu dosyaya bakıyor (`tests/varsayilan-tema.test.ts`).
*/

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

/*
  VARSAYILAN TEMA YANSIZ OLMAK ZORUNDA.

  Burada ArvoCulture'ın pazarlama metni duruyordu ve tema okuması
  ANAHTAR BAŞINA yedeğe düştüğü için teması olmayan her mağaza
  onu gösteriyordu. En ağır üçü:

  - duyuru şeridinde "2.000 TL üzeri ücretsiz kargo • İlk
    alışverişe ARVO10" — BAŞKA bir mağazanın kupon kodu ve kargo
    eşiği, müşteriye vaat olarak;
  - kampanya bloğunda yine ARVO10;
  - kapak görseli ArvoCulture'ın Shopify CDN'indeki dosyası.

  Ayrıca düğmeler `/koleksiyon/giyim` ve `/koleksiyon/bakim`
  adreslerine gidiyordu; o koleksiyonlar başka mağazada yok, yani
  ana sayfanın iki düğmesi de 404'e çıkıyordu.

  Yeni varsayılanlar: her mağaza için DOĞRU olan en az şey. Boş
  bırakılan alanlar çizilmiyor (duyuru şeridi, ikinci düğme,
  kampanya bloğu); uydurma bir vaat üretmektense o bölümü hiç
  göstermemek.

  ArvoCulture'ın bu alanların hepsi kendi tema kaydında; kapak
  görseli ve altbilgi cümlesi de 20261018100856 ile oraya taşındı.
*/
export const defaultTheme: StorefrontTheme = {
  announcement: "",
  hero_eyebrow: "",
  hero_title: "Seçkimiz",
  hero_emphasis: "",
  hero_description: "",
  hero_image_url: undefined,
  primary_cta_label: "Tüm ürünler",
  /* "tumu" her mağazada var; kategori adresleri yoktu ve 404
     veriyordu. */
  primary_cta_href: "/koleksiyon/tumu",
  secondary_cta_label: "",
  secondary_cta_href: "",
  featured_eyebrow: "ÖNE ÇIKANLAR",
  featured_title: "Şimdi keşfet.",
  campaign_title: "",
  campaign_description: "",
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
  /*
    BU ALTI ALAN VİTRİNDE HİÇ ÇİZİLMİYOR (18.10.2026'da arandı:
    tipte ve burada duruyorlar, hiçbir bileşen okumuyor). Tipten
    silmedim çünkü ArvoARC paneli bunları düzenliyor olabilir ve
    sözleşmeyi tek taraflı daraltmak panelde sessiz bir hataya
    dönerdi. Metin yine de yansız: bir gün çizilirlerse başka bir
    markanın anlatısını basmasınlar.
  */
  manifest_title: "",
  manifest_description: "",
  apparel_title: "",
  apparel_description: "",
  beauty_title: "",
  beauty_description: "",
  trust_one: "Seçilmiş ürünler",
  trust_two: "Güvenli ödeme",
  trust_three: "Özenli paketleme",
  trust_four: "Kolay iade",
  /* Altbilgi cümlesi: yansız. ArvoCulture'ınki kendi kaydında. */
  footer_tagline: "",
  /*
    VARSAYILAN AD YANSIZ. Önceden "ArvoCulture" yazıyordu ve tek
    mağazalıyken doğruydu. Çok mağazalı vitrinde tema okunamadığında
    ya da adres hiçbir mağazaya ait olmadığında bu ad YABANCI BİR
    ADRESTE görünüyor: başka bir markanın sayfasına ArvoCulture'ın
    adı düşüyordu (17.10.2026, deneme.shop.arvo-os.com).
  */
  store_name: "Mağaza",
};
