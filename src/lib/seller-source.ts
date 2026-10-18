import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { SELLER as FALLBACK } from "@/lib/seller";
import { getSalesRules } from "@/lib/store-settings";
import { vitrinKonagi } from "@/lib/konak";
import type { MagazaKimligi } from "@/lib/seo";
import { telefonBicimi } from "@/lib/telefon";
import { shippingTerms } from "@/lib/order-quote";

/**
 * Satıcı kimliği — veritabanından.
 *
 * Öncesinde bu bilgiler `seller.ts` içinde sabitti ve
 * ArvoCulture’a özeldi. İkinci bir mağaza açıldığında onun
 * sözleşmelerinde de ArvoCulture’ın unvanı görünürdü.
 *
 * Mevzuat açısından ciddi: mesafeli satış sözleşmesinde satıcı
 * bilgilerinin doğru olması zorunlu.
 *
 * Veritabanı okunamazsa `seller.ts` yedek olarak kullanılıyor;
 * hukuki sayfa boş kalmamalı.
 */
type SellerRow = {
  legal_name: string | null;
  trade_name: string | null;
  mersis_no: string | null;
  tax_office: string | null;
  tax_number: string | null;
  trade_registry_no: string | null;
  address_line: string | null;
  address_district: string | null;
  address_city: string | null;
  address_country: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  kep_address: string | null;
  etbis_verified: boolean | null;
  storefront_url: string | null;
  bank_name: string | null;
  bank_iban: string | null;
  bank_account_holder: string | null;
  bank_transfer_instructions: string | null;
  parent_organization_name: string | null;
  parent_organization_url: string | null;
};

/*
  Alanlar `string` olarak tanımlanıyor: `typeof FALLBACK`
  sabitleri gerçek değere daraltıyor ve veritabanından gelen
  metin atanamıyor.
*/
export type Seller = {
  legalName: string;
  shortName: string;
  brand: string;
  address: string;
  taxOffice: string;
  taxNumber: string;
  mersis: string;
  tradeRegistry: string;
  email: string;
  phone: string;
  phoneLink: string;
  website: string;
  kepAddress: string | null;
  etbisVerified: boolean;
  /* Kargo ve havale: mağaza panelinden (getSalesRules). */
  shippingFee: string;
  freeShippingThreshold: string;
  /** Kargo koşulunun tam cümlesi; ücret ya da eşik sıfırsa "ücretsiz". */
  shippingSentence: string;
  /** Ücret ya da eşik sıfır: "X TL ve üzeri" cümlesi kurulmaz. */
  shippingAlwaysFree: boolean;
  transferEnabled: boolean;
  transferDiscountPercent: number;
} & Omit<
  typeof FALLBACK,
  | "legalName" | "shortName" | "brand" | "address" | "taxOffice"
  | "taxNumber" | "mersis" | "tradeRegistry" | "email" | "phone"
  | "phoneLink" | "website"
  | "shippingFee" | "freeShippingThreshold" | "transferDiscountPercent"
>;

/*
  SATICI ADRESTEN ÇÖZÜLÜYOR.

  Burada şu duruyordu: `const TENANT = process.env.ARC_TENANT_SLUG ??
  "arvoculture"` ve okuma `get_storefront_seller(p_tenant)` ile
  yapılıyordu — yani KİRACI ADI SABİT. Ortak dağıtımda ikinci bir
  kiracının /iletisim sayfasında, mesafeli satış sözleşmesinde ve ön
  bilgilendirme formunda ArvoCulture'ın ticaret unvanı, adresi, vergi
  numarası, MERSİS'i ve IBAN'ı görünüyordu.

  Sessiz bir kusurdu: fonksiyon hata vermiyor, bir satır döndürüyor —
  yalnızca BAŞKA mağazanın satırını. Mesafeli Sözleşmeler Yönetmeliği
  satıcı bilgilerinin doğru olmasını arıyor; yanlış olan bir dizgi
  değil, sözleşmenin tarafıydı.

  Yeni okuma `arc_storefront_seller(p_host)`: kurumu adresten
  çözüyor, yani doğrulanmamış alan adı da kendiliğinden eleniyor.
*/

/*
  Kargo ücreti, ücretsiz kargo eşiği ve havale indirimi yasal metinlerde
  (mesafeli satış sözleşmesi, ön bilgilendirme formu) ve teslimat
  sayfasında geçiyor. Önceden `seller.ts`'teki sabit metinlerden
  ("120 TL", "2.000 TL", %3) okunuyordu; mağaza panelinden tarife
  değişince sepet yeni tutarı, sözleşme eskisini gösterecekti — müşteriye
  sözleşmede yazandan farklı kargo ücreti alınmış olurdu. Ayarlar
  okunamazsa getSalesRules bugünkü sabitlere düşer.
*/
/*
  IBAN GÖSTERİM BİÇİMİ. Veritabanı boşluksuz tutuyor; ekranda
  dörtlü gruplar hem okunur hem de müşterinin elle karşılaştırmasını
  kolaylaştırıyor. Boş değer boş metin döner ki çağıran taraf
  yedeğe düşebilsin.
*/
function ibanBicimi(ham: string | null): string {
  const temiz = (ham ?? "").replace(/\s/g, "").toUpperCase();
  if (!temiz) return "";
  return temiz.replace(/(.{4})/g, "$1 ").trim();
}

async function salesFields() {
  const rules = await getSalesRules();
  const terms = shippingTerms(rules);
  return {
    shippingFee: terms.fee,
    freeShippingThreshold: terms.freeOver,
    shippingSentence: terms.sentence,
    shippingAlwaysFree: terms.alwaysFree,
    transferEnabled: rules.transferEnabled,
    transferDiscountPercent: rules.transferDiscountPercent,
  };
}

export const getSeller = cache(async (): Promise<Seller> => {
  const [rows, sales] = await Promise.all([
    rpcOrEmpty<SellerRow>(
      "arc_storefront_seller",
      { p_host: await vitrinKonagi() },
      /* BEŞ DAKİKA, BİR SAAT DEĞİL.

         Satıcı kimliği yavaş değişiyor ama bir saatlik önbellek iki
         kez somut olarak canlıyı geride bıraktı (17–18.10.2026):
         fonksiyon yeni alan döndürmeye başladığında (banka
         bilgileri, üst kuruluş) saklanan yanıt o alanları
         taşımıyordu ve sayfa, veritabanı doğru olduğu hâlde eksik
         basıyordu. Bir saatlik bayatlığın karşılığı yok — çağrı
         tek satırlık bir RPC.

         Hesap bilgisi buradan DEĞİL okunuyor: o önbelleksiz
         (getSellerBank). */
      { revalidate: 300, tags: ["seller"] },
    ),
    salesFields(),
  ]);

  const row = rows[0];
  if (!row?.legal_name) {
    return {
      ...FALLBACK,
      ...sales,
      kepAddress: null,
      etbisVerified: true,
    };
  }

  /* Adres parçaları tek satırda birleştiriliyor: hukuki
     metinler tam adres bekliyor. */
  const address = [
    row.address_line,
    row.address_district,
    row.address_city,
  ]
    .filter(Boolean)
    .join(", ");

  const phone =
    telefonBicimi(row.contact_phone ?? row.whatsapp_number) || FALLBACK.phone;
  const whatsapp = (row.whatsapp_number ?? "").replace(/\D/g, "");

  return {
    ...FALLBACK,
    ...sales,
    legalName: row.legal_name,
    shortName: row.trade_name ?? FALLBACK.shortName,
    brand: row.trade_name ?? FALLBACK.brand,
    address: address || FALLBACK.address,
    taxOffice: row.tax_office ?? FALLBACK.taxOffice,
    taxNumber: row.tax_number ?? FALLBACK.taxNumber,
    mersis: row.mersis_no ?? FALLBACK.mersis,
    tradeRegistry: row.trade_registry_no ?? FALLBACK.tradeRegistry,
    email: row.contact_email ?? FALLBACK.email,
    phone,
    phoneLink: whatsapp ? `https://wa.me/${whatsapp}` : FALLBACK.phoneLink,
    website: row.storefront_url ?? FALLBACK.website,
    kepAddress: row.kep_address,
    etbisVerified: row.etbis_verified ?? false,
  };
});

/*
  HAVALE HESABI: AYRI VE ÖNBELLEKSİZ OKUNUYOR.

  Üç karar var ve üçü de aynı olaydan çıkıyor (17.10.2026).

  1. YEDEK YOK. Eskiden hesap bilgisi okunamazsa `seller.ts`'teki
     sabite düşülüyordu. O sabit ile paneldeki IBAN AYRI HESAPLARDI
     ve ödeme formu (istemci bileşeni) sabiti doğrudan okuduğu için
     müşteriye aylarca yanlış hesap gösterildi. Yanlış IBAN, IBAN
     göstermemekten kötü: müşteri parayı gönderir, sipariş "ödeme
     bekliyor"da kalır, kimse hata görmez. Hesap bilgisi yoksa
     `null` dönüyor ve havale seçeneği hiç gösterilmiyor.

  2. ÖNBELLEKSİZ. `getSeller()` bir saat saklanıyor; unvan ve adres
     için doğru, hesap bilgisi için değil. Panelden IBAN'ı düzelten
     mağaza, bir saat boyunca müşterisine eski hesabı göstermeye
     devam ederdi — tam bu dosyanın düzelttiği hatanın küçük hâli.
     AGENTS.md'deki kural zaten bunu söylüyor: para verisi önbelleğe
     girmez.

     Bu çağrıyı barındıran iki sayfa (ödeme, sipariş onayı) rota
     önbelleği olmayan dinamik sayfalar, yani `cache: "no-store"`
     burada güvenli. Ürün sayfasında aynı şey rotayı çizilemez
     yapıyordu; o yüzden hukuki sayfalar `getSeller()` ile devam
     ediyor.

  3. IBAN BİÇİMİ BURADA. Veritabanı boşluksuz tutuyor
     (kısıt: ^TR[0-9]{24}$); ekranda dörtlü gruplanıyor, kopyala
     düğmesi boşlukları yine kaldırıyor.
*/
export type HavaleHesabi = {
  bankName: string;
  iban: string;
  accountHolder: string;
  transferInstructions: string;
};

export const getSellerBank = cache(async (): Promise<HavaleHesabi | null> => {
  const rows = await rpcOrEmpty<SellerRow>(
    "arc_storefront_seller",
    { p_host: await vitrinKonagi() },
    { onbelleksiz: true },
  );

  const row = rows[0];
  const iban = ibanBicimi(row?.bank_iban ?? null);
  /* IBAN yoksa hesap bilgisi yok sayılıyor: banka adı tek başına
     müşteriye ödeme yaptırmaz. */
  if (!iban) return null;

  return {
    bankName: row.bank_name?.trim() ?? "",
    iban,
    accountHolder:
      row.bank_account_holder?.trim() || row.legal_name?.trim() || "",
    transferInstructions: row.bank_transfer_instructions?.trim() ?? "",
  };
});

/*
  YAPISAL VERİ İÇİN MAĞAZA KİMLİĞİ.

  `lib/seo.ts` istemci tarafında da derleniyor, o yüzden satıcı
  kaydını kendisi okuyamıyor; kimliği burada kuruyoruz ve oraya
  parametre olarak geçiyoruz.

  EKSİK ALAN BOŞ METİN. `seo.ts` boş alanı şemaya hiç yazmıyor.
  Yedek sabitlere düşmek burada YANLIŞ olurdu: hukuki sayfada bir
  şirket, yapısal veride başka bir şirket görünmesi çelişkili bir
  kimlik sinyali üretir — tam bu dosyanın düzelttiği hata.
*/
export const getStoreIdentity = cache(async (): Promise<MagazaKimligi> => {
  const rows = await rpcOrEmpty<SellerRow>(
    "arc_storefront_seller",
    { p_host: await vitrinKonagi() },
    /* Beş dakika: gerekçe yukarıda (getSeller). */
    { revalidate: 300, tags: ["seller"] },
  );

  const row = rows[0];
  const metin = (deger: string | null | undefined) => deger?.trim() ?? "";

  return {
    brand: metin(row?.trade_name) || metin(row?.legal_name),
    legalName: metin(row?.legal_name),
    email: metin(row?.contact_email),
    phone: telefonBicimi(row?.contact_phone ?? row?.whatsapp_number),
    taxNumber: metin(row?.tax_number),
    addressLine: metin(row?.address_line),
    addressDistrict: metin(row?.address_district),
    addressCity: metin(row?.address_city),
    addressCountry: metin(row?.address_country),
    website: metin(row?.storefront_url),
    parentOrganizationName: metin(row?.parent_organization_name),
    parentOrganizationUrl: metin(row?.parent_organization_url),
  };
});
