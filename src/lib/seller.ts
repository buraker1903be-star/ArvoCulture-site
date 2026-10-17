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

  /*
    BANKA BİLGİSİ BURADA YOK VE OLMAMALI.

    Burada `bankName` ve `iban` duruyordu ve bir YEDEK olarak
    kullanılıyordu: veritabanı okunamazsa bu değerler gösteriliyordu.
    17.10.2026'da görüldü ki paneldeki IBAN ile buradaki sabit AYRI
    HESAPLARDI ve ödeme formu (bir istemci bileşeni) sabiti doğrudan
    okuduğu için müşteriye aylarca buradaki hesap gösterildi.

    Yanlış IBAN göstermek, IBAN göstermemekten KÖTÜ: müşteri parayı
    gönderir, sipariş "ödeme bekliyor"da kalır ve kimse hata görmez.
    O yüzden yedek yok — hesap bilgisi yoksa havale seçeneği hiç
    gösterilmiyor (lib/seller-source → getSellerBank).

    Havale İNDİRİMİ burada kalıyor: o bir kural, hesap bilgisi değil;
    yanlış olması kimseyi yanlış hesaba yöneltmez.
  */
  transferDiscountPercent: 3,

  /* Teslimat ve iade koşulları. Kargo alanları yalnızca yedek:
     getSeller() bunları mağaza ayarlarından yeniden yazar. */
  shippingFee: "120 TL",
  freeShippingThreshold: "2.000 TL",
  withdrawalDays: 14,
  deliveryDaysMax: 30,
} as const;
