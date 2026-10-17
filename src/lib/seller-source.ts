import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { SELLER as FALLBACK } from "@/lib/seller";
import { getSalesRules } from "@/lib/store-settings";
import { vitrinKonagi } from "@/lib/konak";
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
};

/*
  Alanlar `string` olarak tanımlanıyor: `typeof FALLBACK`
  sabitleri gerçek değere daraltıyor ve veritabanından gelen
  metin atanamıyor.
*/
export type Seller = {
  legalName: string;
  bankName: string;
  iban: string;
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
  /** Havalede paranın gideceği hesabın sahibi; unvandan farklı olabilir. */
  bankAccountHolder: string;
  /** Mağazanın havale için eklediği serbest açıklama; yoksa boş. */
  bankTransferInstructions: string;
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
  | "bankName" | "iban"
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
      { revalidate: 3600, tags: ["seller"] },
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
      bankAccountHolder: FALLBACK.legalName,
      bankTransferInstructions: "",
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

  const phone = row.contact_phone ?? row.whatsapp_number ?? FALLBACK.phone;
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
    bankName: row.bank_name ?? FALLBACK.bankName,
    /* IBAN veritabanında BOŞLUKSUZ duruyor (kısıt: ^TR[0-9]{24}$);
       okunurluk için dörtlü gruplanıyor. Kopyala düğmesi boşlukları
       zaten kaldırıyor (components/bank-details.tsx). */
    iban: ibanBicimi(row.bank_iban) || FALLBACK.iban,
    bankAccountHolder:
      row.bank_account_holder?.trim() || row.legal_name || FALLBACK.legalName,
    bankTransferInstructions: row.bank_transfer_instructions?.trim() ?? "",
  };
});
