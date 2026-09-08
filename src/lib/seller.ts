/**
 * Satıcı bilgileri — tek kaynak.
 *
 * Mesafeli Sözleşmeler Yönetmeliği satıcının unvan, adres,
 * MERSİS ve iletişim bilgilerinin tüketiciye açık şekilde
 * sunulmasını arar. Bu bilgiler birden çok hukuki sayfada
 * geçtiği için tek yerde tutuluyor; değişirse hepsi birden
 * güncelleniyor.
 */
export const SELLER = {
  legalName:
    "ARVOCULTURE GROUP TEKNOLOJİ SANAYİ VE TİCARET LİMİTED ŞİRKETİ",
  shortName: "ArvoCulture",
  brand: "ArvoCulture",

  address:
    "Yakuplu Mah. Hürriyet Bulvarı, Skyport Residence No:1 D:113, 34524 Beylikdüzü / İstanbul",

  taxOffice: "Beylikdüzü Vergi Dairesi",
  taxNumber: "1860785335",
  mersis: "0086178533500001",
  tradeRegistry: "1149259",

  email: "info@arvoculture.com",
  phone: "+90 507 437 05 07",
  phoneLink: "https://wa.me/905074370507",

  website: "https://arvoculture.com",

  /* Teslimat ve iade koşulları. Değişirse SSS ve güvence
     şeridiyle birlikte güncellenmelidir. */
  shippingFee: "120 TL",
  freeShippingThreshold: "2.000 TL",
  withdrawalDays: 14,
  deliveryDaysMax: 30,
} as const;
