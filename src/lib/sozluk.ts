/**
 * İki dilli arayüz metinleri.
 *
 * DİL PARA BİRİMİNE BAĞLI, ayrı bir seçeneğe değil: başlıktaki düğme
 * "TR ₺ / EN $" diyor ve bu bilinçli. İki ayrı seçim (dil ve para
 * birimi) dört bileşim üretirdi — İngilizce + lira, Türkçe + dolar —
 * ve ikisinin de müşterisi yok; karşılığı iki kat metin ve iki kat
 * sınanmamış hâl.
 *
 * KAPSAM TİCARİ YÜZEYLER: satın alma kutusu, sepet, ödeme ve sipariş
 * onayı. Buraya girmeyen metinler VERİTABANI İÇERİĞİ (ürün adı,
 * açıklama, koleksiyon başlığı) ya da uzun hukuki metinler. İkisi de
 * çeviriyle değil, içerikle çözülür: ürün adını kodda çevirmek,
 * panelden girilen adın yanında ikinci bir gerçek üretirdi.
 *
 * ÇEVİRİ YOKSA TÜRKÇE BASILIYOR (aşağıdaki `ceviri`): eksik bir
 * anahtar boş metin bırakmıyor. Boş bir düğme, yabancı dildeki bir
 * düğmeden kötü.
 */

export type Dil = "tr" | "en";

/*
  Anahtarlar ANLAMA göre, Türkçe metne göre değil: "Sepete ekle"
  metnini anahtar yapmak, metni düzelten her değişikliğin çeviriyi
  sessizce düşürmesi demekti.
*/
export const SOZLUK = {
  /* --- Satın alma kutusu --- */
  sepeteEkle: ["Sepete ekle", "Add to cart"],
  sepeteEklendi: ["Sepete eklendi", "Added to cart"],
  tukendi: ["Tükendi", "Sold out"],
  /* Karttan hızlı ekleme: İngilizce sayfada bu üç metin Türkçe
     sabitti ve kart "Beden seç" diyordu (22.10.2026, canlıda
     görüldü) — İngilizce bir sayfanın yarısını Türkçe bırakmak. */
  bedenSecKisa: ["Beden seç", "Choose size"],
  ozenliPaketleme: ["ÖZENLİ PAKETLEME", "CAREFUL PACKAGING"],
  /*
    İSKELET METİNLERİ — başlık, altbilgi, alt gezinme. Bunlar HER
    sayfada görünüyor ve İngilizce rotalarda Türkçe duruyordu; sayfa
    gövdesi İngilizceyken çerçevenin Türkçe kalması, çevirinin
    yarıda kalmış olduğunu söylüyor.
  */
  menuEtiketi: ["MENÜ", "MENU"],
  tumunuGor: ["Tümünü gör", "See all"],
  /*
    SİMGE VE ALT ÇUBUK ETİKETLERİ. Çoğu yalnızca ekran okuyucuya
    görünüyor ve gözle fark edilmiyor — İngilizce sayfada aylarca
    Türkçe kalabilirdi (23.10.2026'da canlıda DOM taranarak bulundu).
  */
  begendiklerim: ["Beğendiklerim", "Favourites"],
  hesabim: ["Hesabım", "My account"],
  katalogEtiketi: ["Katalog", "Catalogue"],
  sepetEtiketi: ["Sepet", "Basket"],
  anaSayfaEtiketi: ["Ana sayfa", "Home"],
  aramaEtiketi: ["Arama", "Search"],
  favorilereEkle: ["Favorilere ekle", "Add to favourites"],
  favorilerdenCikar: ["Favorilerden çıkar", "Remove from favourites"],
  yeniCokSatan: ["Yeni & Çok Satan", "New & bestsellers"],
  /*
    HAKKIMIZDA VE SSS'İN YANSIZ VARSAYILANLARI.

    Kiracı panelden kendi metnini yazmadıysa sayfa bunları çiziyor.
    İngilizce karşılık Türkçenin çevirisi değil, aynı şeyi İngilizce
    söylemek — ArvoCulture'ın cümleleri değil, herhangi bir kiracının
    sayfasında doğru duracak yansız metin.
  */
  hakkimizdaEyebrow: ["Hakkımızda", "About us"],
  musteriDestegi: ["Müşteri desteği", "Customer support"],
  sssVarsayilanBaslik: ["Sıkça sorulan sorular.", "Frequently asked questions."],
  /*
    YURTDIŞI KARGO CÜMLESİ. Tek rakam verilmiyor: ücret ülkeye VE
    sepetin ağırlığına bağlı. `{taban}` en düşük bölge ücretiyle
    doldurulur (lib/kargo-bolgesi → enDusukKargoSenti).
  */
  yurtdisiKargoYaniti: [
    "Yurt dışı kargo ücreti {taban} tutarından başlar; kesin tutar ülkenize ve sepetinizin ağırlığına göre ödeme adımında hesaplanır.",
    "International shipping starts at {taban}; the exact amount is calculated at checkout from your country and the weight of your basket.",
  ],
  yurtdisiKargoTarifesiz: [
    "Kargo ücreti ülkenize ve sepetinizin ağırlığına göre ödeme adımında hesaplanır.",
    "Shipping is calculated at checkout from your country and the weight of your basket.",
  ],
  sssVarsayilanGiris: [
    "Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok merak edilenler. Aradığınızı bulamazsanız bize yazın.",
    "The questions we are asked most about orders, shipping, returns, payment and the products. If yours is not here, write to us.",
  ],
  cevabiniBulamadiniz: ["Cevabını bulamadınız mı?", "Did not find your answer?"],
  bizeYazinDonelim: [
    "Bize yazın, en kısa sürede dönüş yapalım.",
    "Write to us and we will come back to you shortly.",
  ],
  whatsapptanYaz: ["WhatsApp’tan yaz", "Message on WhatsApp"],
  epostaGonder: ["E-posta gönder", "Send an e-mail"],
  tumIletisimKanallari: ["Tüm iletişim kanalları", "All contact channels"],
  hakkimizdaBaslik: ["Seçkimiz hakkında", "About our selection"],
  hakkimizdaGiris: [
    "Kataloğumuzu bir liste değil, bir seçki olarak kuruyoruz. Aşağıda nasıl çalıştığımızı ve her siparişte verdiğimiz sözleri bulabilirsiniz.",
    "We build our catalogue as a selection, not a list. Below is how we work and what we promise with every order.",
  ],
  seckiyiKesfet: ["Seçkiyi keşfet", "Browse the selection"],
  bizeUlasinBag: ["Bize ulaşın", "Get in touch"],
  secilmisUrun: ["Seçilmiş ürün", "Selected products"],
  koleksiyonSayisi: ["Koleksiyon", "Collections"],
  kategoriSayisi: ["Kategori", "Categories"],
  nasilCalisiyoruz: ["Nasıl çalışıyoruz", "How we work"],
  ucIlke: ["Üç ilke, her karar noktasında geçerli.", "Three principles, applied at every decision."],
  ilkeSeckiBaslik: ["Seçki", "Selection"],
  ilkeSeckiGovde: [
    "Kataloğa ürün eklemiyoruz; seçki kuruyoruz. Bir ürün tasarımı, içeriği ve gündelik kullanımdaki karşılığıyla birlikte değerlendirilmeden rafa girmiyor.",
    "We do not add products to a catalogue; we build a selection. Nothing reaches the shelf until its design, its materials and how it behaves in daily use have all been weighed together.",
  ],
  ilkeSeffaflikBaslik: ["Şeffaflık", "Transparency"],
  ilkeSeffaflikGovde: [
    "Ürün açıklamaları abartılı vaat değil, kullanım bilgisi taşır. Fiyat neyse odur; sepette sürpriz kalem çıkmaz.",
    "Product descriptions carry usage information, not inflated promises. The price is the price; no surprise line appears in your basket.",
  ],
  ilkeOzenBaslik: ["Özen", "Care"],
  ilkeOzenGovde: [
    "Sipariş, ilk keşiften teslimata kadar aynı dikkatle ele alınır. Paketleme bir lojistik adımı değil, deneyimin parçası.",
    "An order is handled with the same attention from the first click to the doorstep. Packaging is part of the experience, not a logistics step.",
  ],
  magazaSozu: ["Mağaza sözü", "Our promise"],
  magazaSozuBaslik: [
    "Aldığınız şeyin arkasında duruyoruz.",
    "We stand behind what you buy.",
  ],
  magazaSozuGovde: [
    "Her ürün yetkili tedarik zincirinden gelir, her ödeme 3D Secure ile korunur, her sipariş aynı özenle paketlenir. Bir şey ters giderse tek bir mesaj yeterli.",
    "Every item comes through an authorised supply chain, every payment is 3D Secure protected and every order is packed with the same care. If something goes wrong, one message is enough.",
  ],
  sozOrijinal: ["Orijinal ürün", "Genuine products"],
  sozOrijinalNot: ["Yetkili tedarik zinciri", "Authorised supply chain"],
  sozOdeme: ["3D Secure ödeme", "3D Secure payment"],
  sozOdemeNot: ["Kart bilgisi saklanmaz", "Card details are never stored"],
  sozIade: ["14 gün iade", "14-day returns"],
  sozIadeNot: ["Kullanılmamış ürünlerde", "On unused items"],
  sozPaketleme: ["Özenli paketleme", "Careful packaging"],
  sozPaketlemeNot: ["Her siparişte", "With every order"],
  seckiden: ["Seçkiden", "From the selection"],
  bugunOneCikan: ["Bugün öne çıkardıklarımız.", "What we are highlighting today."],
  alisverisseDevam: ["Alışverişe devam et", "Continue shopping"],
  ucretsizKargoyaKalan: [
    "{tutar} daha ekleyin, kargo ücretsiz olsun.",
    "Add {tutar} more for free shipping.",
  ],
  anaMenu: ["Ana menü", "Main menu"],
  menuyuAc: ["Menüyü aç", "Open menu"],
  menuyuKapat: ["Menüyü kapat", "Close menu"],
  magazaDuyurulari: ["Mağaza duyuruları", "Store announcements"],
  anaGezinme: ["Ana gezinme", "Main navigation"],
  anaSayfaBaglantisi: ["ana sayfa", "home"],
  hakkimizdaBag: ["Hakkımızda", "About us"],
  iletisimBag: ["İletişim", "Contact"],
  sssBag: ["Sık Sorulan Sorular", "Frequently asked questions"],
  musteriHizmetleri: ["Müşteri Hizmetleri", "Customer service"],
  teslimatPolitikasi: ["Teslimat Politikası", "Delivery policy"],
  iptalIadeBag: ["İptal ve İade", "Cancellation & returns"],
  yasalBaslik: ["Yasal", "Legal"],
  gizlilikCerez: ["Gizlilik ve Çerez Politikası", "Privacy & cookie policy"],
  uyelikSozlesmesi: ["Üyelik Sözleşmesi", "Membership agreement"],
  kullanimKosullari: ["Kullanım Koşulları", "Terms of use"],
  yasalBildirim: ["Yasal Bildirim", "Legal notice"],
  ticariIleti: ["Ticari Elektronik İleti", "Commercial electronic messages"],
  veriSilme: ["Hesap ve Veri Silme", "Account & data deletion"],
  /*
    YASAL BELGELER TÜRKÇE KALIYOR ve bunu SÖYLÜYORUZ. Mesafeli satış
    sözleşmesi, KVKK metni ve üyelik sözleşmesi Türk hukukuna göre
    yazılmış belgeler; makine çevirisi bağlayıcı metni değiştirmek
    olurdu. Bağlantı İngilizce adlandırılıyor, belgenin dili
    belirtiliyor — tıklayınca Türkçe bir sayfayla karşılaşmak,
    önceden söylenmediğinde kusur gibi görünüyor.
  */
  yasalBelgeDili: ["Bu belgeler Türkçedir.", "These documents are in Turkish."],
  etbisKayit: ["ETBİS’e kayıtlıdır", "Registered with ETBİS"],
  etbisAciklama: [
    "Elektronik Ticaret Bilgi Sistemi",
    "Turkish e-commerce registry",
  ],
  lrIsOrtagi: ["bağımsız iş ortağıdır", "independent partner"],
  odemeGuvenligi: [
    "Ödemeler 3D Secure korumalı ödeme altyapısı üzerinden alınır. Kart bilgileriniz mağazamıza iletilmez.",
    "Payments are taken through a 3D Secure protected provider. Your card details are never passed to us.",
  ],
  kabulEdilenKartlar: ["Kabul edilen kartlar", "Accepted cards"],
  tumHaklariSakli: ["Tüm hakları saklıdır.", "All rights reserved."],
  grupKunyesi: [
    "Bir ArvoCulture Group markasıdır.",
    "An ArvoCulture Group brand.",
  ],
  magazaKapali: ["Mağazamız şu anda kapalı", "Our store is currently closed"],
  magazaKapaliAlt: [
    "Kısa süre içinde tekrar hizmetinizdeyiz. İlginiz için teşekkür ederiz.",
    "We will be back shortly. Thank you for your interest.",
  ],
  guvenliOdemeSerit: ["GÜVENLİ ÖDEME", "SECURE PAYMENT"],
  ekleniyor: ["Ekleniyor…", "Adding…"],
  stoktaYok: ["Şu anda stokta yok", "Currently out of stock"],
  secenekYuklenemedi: ["Seçenekler yüklenemedi", "Options unavailable"],
  secenekYuklenemediAciklama: [
    "Ürün seçenekleri şu anda alınamadı. Sayfayı yenileyin; sürerse bize yazın.",
    "Product options could not be loaded. Refresh the page; if it persists, contact us.",
  ],
  adet: ["Adet", "Quantity"],
  renk: ["Renk", "Colour"],
  beden: ["Beden", "Size"],
  /*
    ÜÇ AYRI CÜMLE, PARÇA BİRLEŞTİRMESİ DEĞİL. Önce "Sepete eklemeden
    önce {ne} seçin" diye tek kalıp düşünüldü ama İngilizcede özne
    ve sayı uyumu değişiyor ("a colour" / "a colour and a size") ve
    kalıp doldurmak Türkçeye uyan, İngilizceye uymayan cümleler
    üretirdi.
  */
  renkSec: [
    "Sepete eklemeden önce bir renk seçin.",
    "Please choose a colour before adding to cart.",
  ],
  bedenSec: [
    "Sepete eklemeden önce bir beden seçin.",
    "Please choose a size before adding to cart.",
  ],
  renkBedenSec: [
    "Sepete eklemeden önce renk ve beden seçin.",
    "Please choose a colour and a size before adding to cart.",
  ],
  bedenTukendi: ["Bu beden tükendi", "This size is sold out"],
  tonTukendi: ["Bu ton tükendi", "This colour is sold out"],
  stokta: ["Stokta", "In stock"],
  /* {n} yerine sayı giriyor: dilde sayının yeri değişiyor
     ("Son 3 adet" / "Only 3 left") ve cümleyi parçalara bölmek
     İngilizcede ters sıraya düşerdi. */
  sonAdet: ["Son {n} adet", "Only {n} left"],
  fiyat: ["Fiyat", "Price"],
  artir: ["Artır", "Increase"],
  azalt: ["Azalt", "Decrease"],
  eklendi: ["Eklendi ✓", "Added ✓"],
  yurtdisinaGonderilemez: [
    "Yurtdışına gönderilemiyor",
    "Not available for international shipping",
  ],
  yurtdisinaGonderilemezAciklama: [
    "Bu ürün yalnızca Türkiye içine gönderilebiliyor. Teslimat adresiniz Türkiye'deyse ₺ seçeneğine geçin.",
    "This product can only be shipped within Türkiye. Switch to ₺ if your delivery address is in Türkiye.",
  ],

  /* --- Sepet --- */
  sepet: ["Sepet", "Cart"],
  sepetBos: ["Sepetiniz boş", "Your cart is empty"],
  araToplam: ["Ara toplam", "Subtotal"],
  kargo: ["Kargo", "Shipping"],
  ucretsiz: ["Ücretsiz", "Free"],
  odemeAdiminda: ["Ödeme adımında", "Calculated at checkout"],
  toplam: ["Toplam", "Total"],
  indirim: ["İndirim", "Discount"],
  odemeyeGec: ["Ödemeye geç", "Checkout"],
  sepetDetayi: ["Sepet detayına git", "View cart"],
  sepetBosBaslik: ["Sepetiniz boş.", "Your cart is empty."],
  sepetBosAciklama: [
    "Seçkimize göz atın; beğendiğiniz ürünleri buradan tamamlayabilirsiniz.",
    "Browse our selection; you can complete your order from here.",
  ],
  indirimdekiUrunler: ["İndirimdeki ürünler", "On sale"],
  secimleriTamamla: ["Seçimlerinizi tamamlayın.", "Review your selection."],
  urunler: ["Ürünler", "Items"],
  /* "{c} çeşit · {a} adet": İngilizcede "line" ve "item" ayrımı
     anlaşılmıyor, "products" ve "items" daha okunur. */
  cesitAdet: ["{c} çeşit · {a} adet", "{c} products · {a} items"],
  siparisNotu: ["Sipariş notu", "Order note"],
  siparisNotuAciklama: [
    "Teslimatla ilgili iletmek istediğiniz bir şey var mı?",
    "Anything you would like us to know about the delivery?",
  ],
  siparisNotuOrnek: [
    "Örneğin: Kapıcıya teslim edilebilir, öğleden sonra evdeyim…",
    "For example: leave with the concierge, I am home in the afternoon…",
  ],
  notuKaydet: ["Notu kaydet", "Save note"],
  notKaydedildi: ["Not kaydedildi ✓", "Note saved ✓"],
  ozet: ["Özet", "Summary"],
  uygula: ["Uygula", "Apply"],
  kontrolEdiliyor: ["Kontrol ediliyor…", "Checking…"],
  kodUygulandi: ["Kod uygulandı.", "Code applied."],
  kodUygulandiIndirim: [
    "Kod uygulandı · {tutar} indirim",
    "Code applied · {tutar} off",
  ],
  kodGecersiz: ["Bu kod geçerli değil.", "This code is not valid."],
  kodDogrulanamadi: [
    "Kod şu anda doğrulanamıyor. Tekrar deneyin.",
    "The code cannot be verified right now. Please try again.",
  ],
  kuponHaricTutuldu: [
    "İndirimdeki ürünler kupona dahil değil; kupon {tutar} üzerinden uygulandı.",
    "Discounted items are excluded; the code applied to {tutar}.",
  ],
  alisverisiSurdur: ["Alışverişe devam et", "Continue shopping"],
  kaldir: ["Kaldır", "Remove"],
  birimFiyat: ["/ adet", "each"],
  kargonuzUcretsiz: ["Kargonuz ücretsiz.", "Your shipping is free."],
  sepetim: ["Sepetim", "My cart"],
  kapat: ["Kapat", "Close"],
  sepetiKapat: ["Sepeti kapat", "Close cart"],
  alisverisBasla: ["Alışverişe başla", "Start shopping"],
  /* {n} ürün: İngilizcede tekil/çoğul ayrı ("1 item" / "2 items"),
     bu yüzden iki anahtar. Tek bir kalıpla "1 items" yazmak,
     çevirinin makineyle yapıldığını söyleyen en kısa cümle olurdu. */
  urunSayisi: ["{n} ürün", "{n} items"],
  urunSayisiTek: ["{n} ürün", "{n} item"],
  indirimKodu: ["İndirim kodu", "Discount code"],
  sil: ["Sil", "Clear"],
  kuponUygulandi: ["{kod} uygulandı.", "{kod} applied."],

  /* --- Ödeme --- */
  teslimatBilgileri: ["Teslimat bilgileri", "Delivery details"],
  adSoyad: ["Ad soyad", "Full name"],
  eposta: ["E-posta", "Email"],
  telefon: ["Telefon", "Phone"],
  ulke: ["Ülke", "Country"],
  sehir: ["Şehir", "City"],
  il: ["İl", "Province"],
  ilce: ["İlçe", "District"],
  eyalet: ["Eyalet / bölge (varsa)", "State / region (if any)"],
  postaKodu: ["Posta kodu", "Postal code"],
  acikAdres: ["Açık adres", "Street address"],
  siparisOzeti: ["Sipariş özeti", "Order summary"],
  tahsilatLira: [
    "Tahsilat Türk lirası olarak yapılır.",
    "You will be charged in Turkish lira.",
  ],
  yaklasik: ["Yaklaşık", "Approximately"],

  /* --- Ürün sayfası (sunucuda çiziliyor: `ceviri()` doğrudan çağrılıyor,
         kanca kullanılmıyor) --- */
  anaSayfa: ["Ana sayfa", "Home"],
  konum: ["Konum", "Breadcrumb"],
  cokSatanRozet: ["Çok satan", "Bestseller"],
  tasarrufEki: ["tasarruf", "saved"],
  urunAciklamasi: ["Ürün açıklaması", "Product description"],
  urunOzellikleri: ["Ürün özellikleri", "Specifications"],
  bedenTablosu: ["Beden tablosu", "Size guide"],
  teslimatBaslik: ["Teslimat", "Delivery"],
  teslimatMetni: [
    "Siparişiniz ödeme onayının ardından hazırlanır ve kargoya verildiğinde e-posta ile bilgilendirilirsiniz.",
    "Your order is prepared once the payment is confirmed; we email you when it ships.",
  ],
  iadeKosullari: ["İade koşulları", "Returns"],
  iadeMetni: [
    "Kullanılmamış ve yeniden satılabilir durumdaki ürünler teslimattan itibaren 14 gün içinde iade edilebilir. Ambalajı açılmış kozmetik ve kişisel bakım ürünleri hijyen gerekçesiyle iade kapsamı dışındadır.",
    "Unused items in resalable condition can be returned within 14 days of delivery. Opened cosmetics and personal care products are excluded for hygiene reasons.",
  ],
  iadeGunu: ["14 gün içinde iade", "14-day returns"],
  guvenliOdeme3d: ["3D Secure ile güvenli ödeme", "Secure payment with 3D Secure"],
  benzerUrunler: ["Benzer ürünler", "You may also like"],
  benzerUrunlerAlt: [
    "{kategori} kategorisinden seçtiklerimiz.",
    "Our picks from {kategori}.",
  ],
  tumUrunler: ["Tüm ürünler", "All products"],

  /* --- Koleksiyon sayfası --- */
  koleksiyonSeckisi: ["{magaza} SEÇKİSİ", "{magaza} SELECTION"],
  koleksiyonAciklama: [
    "Kendine ait olanı keşfet. Her ürün; tasarım, nitelik ve kullanım deneyimi gözetilerek seçildi.",
    "Find what is yours. Every piece is chosen for its design, quality and everyday wear.",
  ],
  secimBos: ["Bu seçimle ürün bulunamadı.", "No products match this selection."],
  /*
    Yasal sayfalar İngilizce vitrinde de TÜRKÇE açılıyor ve bu bilinçli
    (sözleşmeyi makineyle çevirip "okudum" dedirtmek olmazdı). Uyarı
    ödeme adımındaki onay satırlarında duruyor — orada hukuki olarak
    gerekiyor. Burada ayrı bir anahtar YOK: bilerek boş bırakılmış bir
    karşılık "çeviri" değil ve sözlüğün testi onu haklı olarak
    reddediyor.
  */
  odeme: ["Ödeme", "Payment"],
  odemeBosSepet: [
    "Ödeme adımına geçmek için sepetinize ürün ekleyin.",
    "Add an item to your cart to continue to checkout.",
  ],
  kartBilgileri: [
    "Kart bilgileriniz doğrudan ödeme kuruluşuna iletilir.",
    "Your card details go directly to the payment provider.",
  ],
  guvenliOdeme: ["Güvenli ödeme", "Secure payment"],
  /* Bağlantı cümlenin İÇİNDE: "bu bağlantıdan" ve "this link" cümlede
     ayrı yerlere düşüyor, bu yüzden iki parça halinde. */
  odemeYuklenmezse: ["Ödeme sayfası yüklenmezse", "If the payment page does not load,"],
  buBaglantidan: ["bu bağlantıdan", "use this link"],
  devamEdebilirsiniz: ["devam edebilirsiniz.", "to continue."],
  teslimatVeOdeme: ["Teslimat ve ödeme", "Delivery and payment"],
  uyeOlmadan: [
    "Üye olmadan devam edebilirsiniz. Sipariş takibi, e-posta adresinize gönderilen sipariş numarasıyla yapılır.",
    "You can continue without an account. Track your order with the order number sent to your email.",
  ],
  kurumsalFatura: ["Kurumsal fatura", "Company invoice"],
  yeniAdres: ["Yeni adres", "New address"],
  elleGir: ["Elle girmek istiyorum", "I will enter it manually"],
  telefonYurtdisiUyari: [
    "Numarayı ülke koduyla yazın (örn. +49 171 1234567).",
    "Enter the number with its country code (e.g. +49 171 1234567).",
  ],
  telefonTrUyari: [
    "Cep telefonu 5 ile başlayan 10 haneli olmalı.",
    "A Turkish mobile number has 10 digits and starts with 5.",
  ],
  onaylar: ["Onaylar", "Consents"],
  sozlesmeOnaylari: ["Sözleşme onayları", "Consents"],
  sepetteUrunYok: ["Sepetinizde ürün yok", "Your cart is empty"],
  gecerliEposta: ["Geçerli bir e-posta adresi", "A valid email address"],
  gecerliTelefon: ["Geçerli bir telefon numarası", "A valid phone number"],
  /*
    HUKUKİ METİNLER TÜRKÇE KALIYOR ve bu cümlede SÖYLENİYOR.
    Sözleşmeyi makineyle çevirip "okudum ve kabul ediyorum"
    dedirtmek, müşteriye okumadığı bir metni onaylatmak olurdu;
    hukuki metnin çevirisi kod işi değil.
  */
  onBilgilendirme: ["Ön Bilgilendirme Formu", "Pre-Information Form"],
  mesafeliSatis: ["Mesafeli Satış Sözleşmesi", "Distance Sales Agreement"],
  kvkk: ["KVKK Aydınlatma Metni", "Privacy Notice"],
  okudumOnayliyorum: [
    "’nu okudum ve onaylıyorum.",
    " (in Turkish) — I have read and approve it.",
  ],
  okudumKabul: [
    "’ni okudum ve kabul ediyorum.",
    " (in Turkish) — I have read and accept it.",
  ],
  okudum: ["’ni okudum.", " (in Turkish) — I have read it."],
  bildirimNotu: [
    "Siparişinizin durumunu WhatsApp ve e-posta ile bildiririz. Yalnızca siparişinizle ilgili bildirimler gönderilir; tanıtım mesajı gönderilmez.",
    "We will notify you about your order by WhatsApp and email. Only order-related messages are sent; no marketing.",
  ],
  odemeYontemi: ["Ödeme yöntemi", "Payment method"],
  kartOdemesi: ["Kredi / banka kartı", "Credit / debit card"],
  kartGuvence: ["3D Secure ile güvenli ödeme", "Secure payment with 3D Secure"],
  havale: ["Banka havalesi / EFT", "Bank transfer"],
  havaleIndirimi: ["%{oran} indirim", "{oran}% off"],
  tasarruf: ["tasarruf", "saved"],
  havaleAciklama: [
    "Siparişinizi tamamladıktan sonra aşağıdaki hesaba havale veya EFT yapın. Açıklama kısmına sipariş numaranızı yazın; ödemeniz onaylandığında siparişiniz hazırlanmaya başlar.",
    "After completing your order, transfer the amount to the account below. Write your order number in the reference field; we start preparing your order once the payment is confirmed.",
  ],
  /* --- Adımlar --- */
  adimSepet: ["Sepet", "Cart"],
  adimTeslimat: ["Teslimat", "Delivery"],
  adimOdeme: ["Ödeme", "Payment"],
  siparisAdimlari: ["Sipariş adımları", "Checkout steps"],
  toplamdanDusulecek: ["Toplamdan düşülecek", "Will be deducted from the total"],
  yonlendiriliyor: ["Yönlendiriliyor…", "Redirecting…"],
  kuponGecersizOldu: [
    "İndirim kodunuz artık geçerli değil. Sepetinizi kontrol edin.",
    "Your discount code is no longer valid. Please check your cart.",
  ],
  odemeBaslatilamadi: [
    "Ödeme başlatılamadı. Lütfen birkaç dakika sonra tekrar deneyin.",
    "Payment could not be started. Please try again in a few minutes.",
  ],
  baglantiKurulamadi: [
    "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edin.",
    "Could not connect. Please check your internet connection.",
  ],
  secenekEksik: [
    "\"{urun}\" için seçeneğini (ton/beden) belirtmeniz gerekiyor. Ürün sayfasından seçip sepete yeniden ekleyin.",
    "Please choose an option (colour/size) for \"{urun}\". Select it on the product page and add it to your cart again.",
  ],
  kodIndirimiNotu: [
    "Kod indirimi, siparişiniz oluşturulurken toplamdan düşülür.",
    "The code discount is applied to the total when your order is created.",
  ],
  /* --- Yurtdışı kargo engelleri --- */
  engelMod: [
    "Şu anda yalnızca Türkiye'ye gönderim yapıyoruz.",
    "We currently ship within Türkiye only.",
  ],
  engelKur: [
    "Yurtdışı gönderim ücreti şu anda hesaplanamıyor. Kısa süre sonra tekrar deneyin ya da bizimle iletişime geçin.",
    "International shipping cannot be calculated right now. Please try again shortly or contact us.",
  ],
  engelBolge: [
    "Seçtiğiniz ülkeye henüz gönderim yapamıyoruz. Başka bir ülke seçebilir ya da bizimle iletişime geçebilirsiniz.",
    "We cannot ship to the country you selected yet. You can choose another country or contact us.",
  ],

  /*
    --- Sipariş sonrası: onay, ödeme hatası, sipariş takibi ---
    Bu sayfalar SUNUCUDA çiziliyor; metinler <Metin> ile tarayıcıda
    çevriliyor (components/para-birimi). Tutarlar burada da LİRA:
    tahsilat lira üzerinden yapıldı, siparişin gerçek tutarı o.
  */
  tesekkurler: ["Teşekkür ederiz", "Thank you"],
  siparisAlindiBaslik: ["Siparişiniz alındı.", "Your order has been received."],
  siparisNumarasi: ["Sipariş numarası", "Order number"],
  siparisAlindiAciklama: [
    "Ödemeniz onaylandığında sipariş özetiniz e-posta adresinize gönderilecek. Siparişinizle ilgili sorularınız için sipariş numaranızla bize ulaşabilirsiniz.",
    "Once your payment is confirmed, your order summary will be sent to your email address. For any questions about your order, contact us with your order number.",
  ],
  havaleTalimati: [
    "Aşağıdaki hesaba havale veya EFT yaptığınızda siparişiniz hazırlanmaya başlanacak. Açıklama kısmına sipariş numaranızı yazın.",
    "Your order will be prepared once you transfer the amount to the account below. Please write your order number in the transfer description.",
  ],
  bizeUlasin: ["Bize ulaşın", "Contact us"],
  odemeTamamlanamadi: ["Ödeme tamamlanamadı.", "Payment could not be completed."],
  odemeHataAciklama: [
    "İşlem sırasında bir sorun oluştu ve ödemeniz alınamadı. Kartınızdan herhangi bir tutar çekilmediyse endişelenmeyin; provizyon alındıysa bankanız tarafından iade edilir.",
    "Something went wrong and your payment was not taken. If no amount was charged to your card, there is nothing to worry about; if a pre-authorisation was placed, your bank will release it.",
  ],
  ilgiliSiparisNo: ["İlgili sipariş numarası", "Related order number"],
  sepetDuruyor: [
    "Sepetiniz duruyor. Tekrar denemek isterseniz ödeme adımından devam edebilirsiniz.",
    "Your cart is still saved. If you would like to try again, you can continue from the payment step.",
  ],
  tekrarDene: ["Tekrar dene", "Try again"],
  yardimAlin: ["Yardım alın", "Get help"],
  siparisDurumu: ["Sipariş durumu", "Order status"],
  siparisiniz: ["Siparişiniz", "Your order"],
  siparisTarihi: ["Sipariş tarihi", "Order date"],
  alici: ["Alıcı", "Recipient"],
  teslimEdildiTarih: ["Teslim edildi", "Delivered"],
  kdvDahil: ["Fiyatlara dahil KDV", "VAT included in prices"],
  takipSayfaNotu: [
    "Bu sayfa siparişinizin güncel durumunu gösterir; bağlantıyı saklayabilirsiniz. Sorularınız için sipariş numaranızla",
    "This page shows the current status of your order; you can keep the link. For questions, quote your order number and",
  ],
  bizeUlasinKucuk: ["bize ulaşın", "contact us"],
  /* Sipariş ve ödeme durumları (lib/siparis-durumu'daki kodlar). */
  durumPending: ["Siparişiniz alındı", "Order received"],
  durumConfirmed: ["Siparişiniz onaylandı", "Order confirmed"],
  durumProcessing: ["Hazırlanıyor", "Being prepared"],
  durumFulfilled: ["Kargoya verildi", "Shipped"],
  durumCancelled: ["İptal edildi", "Cancelled"],
  durumRefunded: ["İade edildi", "Refunded"],
  odemePending: ["Ödeme bekleniyor", "Awaiting payment"],
  odemeAuthorized: ["Ödeme onaylandı", "Payment authorised"],
  odemePaid: ["Ödendi", "Paid"],
  odemePartiallyRefunded: ["Kısmen iade edildi", "Partially refunded"],
  odemeRefunded: ["İade edildi", "Refunded"],
  odemeFailed: ["Ödeme alınamadı", "Payment failed"],

  /* --- Havale bilgisi kutusu (components/bank-details) --- */
  aliciUnvani: ["ALICI UNVANI", "ACCOUNT HOLDER"],
  banka: ["BANKA", "BANK"],
  kopyala: ["Kopyala", "Copy"],
  kopyalandi: ["Kopyalandı ✓", "Copied ✓"],
  ibanNotu: [
    "IBAN kopyalandığında boşluklar kaldırılır. Havale ücreti bankanıza aittir.",
    "Spaces are removed when the IBAN is copied. Any transfer fee is charged by your bank.",
  ],
} as const;

export type SozlukAnahtari = keyof typeof SOZLUK;

/**
 * Çeviri. Anahtar yoksa anahtarın kendisi DEĞİL Türkçe karşılığı
 * dönüyor; tip denetimi zaten olmayan anahtarı yakalıyor, bu yalnızca
 * çalışma anındaki son çare.
 */
export function ceviri(anahtar: SozlukAnahtari, dil: Dil): string {
  const satir = SOZLUK[anahtar];
  if (!satir) return anahtar;
  return (dil === "en" ? satir[1] : satir[0]) || satir[0];
}
