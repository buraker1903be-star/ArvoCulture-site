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
  /*
    KİMLİK BİLGİSİ BURADA YOK VE OLMAMALI.

    Burada ArvoCulture'ın ticaret unvanı, adresi, vergi dairesi,
    vergi numarası, MERSİS'i, ticaret sicil numarası, e-postası ve
    telefonu duruyordu — hepsi YEDEK olarak: satıcı kaydı
    okunamazsa hukuki sayfalar bu değerlere düşüyordu.

    Banka hesabıyla aynı tuzak (17.10.2026): yanlış satıcı
    göstermek, satıcı göstermemekten KÖTÜ. Okuması geçici olarak
    başarısız olan ikinci bir kiracının mesafeli satış
    sözleşmesinde BAŞKA bir şirketin unvanı ve vergi numarası
    görünür; müşteri kiminle sözleşme yaptığını oradan okuyor ve
    hiçbir yerde hata belirmiyor.

    Alanlar BOŞ: hukuki sayfalar satıcı bilinmiyorken bunu açıkça
    söylüyor (components/satici-bilinmiyor), uydurma bir unvan
    üretmiyor.

    Kurallar (cayma süresi, azami teslim süresi, havale indirimi)
    burada kalıyor: onlar mevzuattan ve varsayılan ayardan gelen
    sayılar, kimlik değil.
  */
  legalName: "",
  shortName: "",
  brand: "",
  address: "",
  taxOffice: "",
  taxNumber: "",
  mersis: "",
  tradeRegistry: "",
  email: "",
  phone: "",
  phoneLink: "",
  website: "",


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
