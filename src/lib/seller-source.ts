import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { SELLER as FALLBACK } from "@/lib/seller";

/**
 * Satıcı kimliği — veritabanından.
 *
 * Öncesinde bu bilgiler `seller.ts` içinde sabitti ve
 * ArvoCulture'a özeldi. İkinci bir mağaza açıldığında onun
 * sözleşmelerinde de ArvoCulture'ın unvanı görünürdü.
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
} & Omit<
  typeof FALLBACK,
  | "legalName" | "shortName" | "brand" | "address" | "taxOffice"
  | "taxNumber" | "mersis" | "tradeRegistry" | "email" | "phone"
  | "phoneLink" | "website"
>;

/**
 * Kiracı adı şu an sabit. Vitrin çok kiracılı hâle geldiğinde
 * alan adından çözülecek; fonksiyon zaten parametre alıyor.
 */
const TENANT = process.env.ARC_TENANT_SLUG ?? "arvoculture";

export const getSeller = cache(async (): Promise<Seller> => {
  const rows = await rpcOrEmpty<SellerRow>(
    "get_storefront_seller",
    { p_tenant: TENANT },
    { revalidate: 3600, tags: ["seller"] },
  );

  const row = rows[0];
  if (!row?.legal_name) {
    return { ...FALLBACK, kepAddress: null, etbisVerified: true };
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
