import type { Dil } from "@/lib/dil-onek";

/*
  SSS'İN VARSAYILAN SORU-CEVAPLARI — İKİ DİL, TEK YER.

  Kiracı panelden kendi listesini yazarsa bunların YERİNE geçiyor,
  üstüne eklenmiyor: birleştirmek, kiracının "yurt dışına gönderim
  yapıyoruz" yazdığı sayfada bizim varsayılanımızı da göstermek,
  yani aynı sayfada iki çelişen yanıt olurdu.

  SAYFADAN AYRI DOSYADA: iki rota (tr ve /en) aynı listeyi kullanıyor
  ve 27 soru-cevabı sayfa dosyasında tutmak, gövdeyi içerikle
  boğuyordu. Sözlüğe de konmadı — `sozluk.ts` arayüz metinleri için;
  sayfa içeriği oraya girerse sözlük okunamaz hâle gelir.

  İNGİLİZCESİ ÇEVİRİ DEĞİL, KARŞILIK. Yurtdışı müşterisinin soruları
  başka: gümrük, para birimi ve iade kargosunu kimin ödediği Türkçe
  listede hiç yok, çünkü yurt içinde böyle bir soru yok.

  İKİ YER DOLDURULUYOR: `__kargo__` mağaza panelindeki tarifeyle,
  `__eposta__` satıcı kaydındaki adresle. Sabit yazılsaydı tarife
  değişince SSS sepetle çelişir, e-posta da ikinci bir kiracının
  müşterisini bizim adresimize yönlendirirdi.
*/
export const KARGO_YERI = "__kargo__";
export const EPOSTA_YERI = "__eposta__";

export type SssGrubu = { title: string; items: Array<[string, string]> };

const TR: SssGrubu[] = [
  {
    title: "Sipariş ve kargo",
    items: [
      [
        "Siparişim ne zaman hazırlanır?",
        "Ödemeniz onaylandıktan sonra siparişiniz hazırlanır. Kargoya teslim edildiğinde e-posta ile bilgilendirilirsiniz.",
      ],
      ["Kargo ücreti ne kadar?", KARGO_YERI],
      [
        "Siparişimi nasıl takip ederim?",
        "Kargoya verildiğinde takip numaranız e-posta ile gönderilir. Dilerseniz sipariş numaranızla WhatsApp hattımızdan da sorabilirsiniz.",
      ],
      [
        "Yurt dışına gönderim yapıyor musunuz?",
        /*
          ÖNCEDEN "Şu anda yalnızca Türkiye içine gönderim
          yapıyoruz" yazıyordu ve yurtdışı satışı açıldığından beri
          YANLIŞTI: İngilizce ana sayfa "ships worldwide" derken SSS
          gönderim yapmadığımızı söylüyordu.
        */
        "Evet. Kargo ücreti ülkenize ve sepetinizin ağırlığına göre ödeme adımında hesaplanır; kataloğun bir bölümü yurt dışına gönderilemiyor ve İngilizce sayfalarda hiç listelenmiyor.",
      ],
    ],
  },
  {
    title: "İade ve değişim",
    items: [
      [
        "Ürünleri iade edebilir miyim?",
        "Kullanılmamış ve yeniden satılabilir durumdaki ürünler, teslimattan itibaren 14 gün içinde cayma hakkı kapsamında iade edilebilir.",
      ],
      [
        "Hangi ürünler iade edilemez?",
        "Ambalajı açılmış kozmetik ve kişisel bakım ürünleri hijyen gerekçesiyle iade kapsamı dışındadır. Bu istisna ürün niteliğine göre uygulanır.",
      ],
      [
        "İade süreci nasıl işliyor?",
        `${EPOSTA_YERI} adresine sipariş numaranızla yazmanız yeterli. Yönlendirme ve kargo bilgisi tarafımızdan iletilir.`,
      ],
      [
        "Bedeni değiştirebilir miyim?",
        "Giyim ürünlerinde beden değişimi mümkündür. Ürünün etiketli ve kullanılmamış olması gerekir.",
      ],
    ],
  },
  {
    title: "Ödeme",
    items: [
      [
        "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        "Visa, Mastercard, Troy, Maestro ve American Express kartlarıyla ödeme yapabilirsiniz. Ödemeler 3D Secure korumalı ödeme altyapısı üzerinden alınır.",
      ],
      [
        "Kart bilgilerim güvende mi?",
        "Ödeme sayfası lisanslı ödeme kuruluşumuz tarafından sunulur ve 3D Secure ile korunur. Kart bilgileriniz mağazamıza hiçbir aşamada iletilmez ve sunucularımızda saklanmaz.",
      ],
      [
        "İndirim kodunu nerede kullanabilirim?",
        "Kodu sepet ya da ödeme adımında ilgili alana girmeniz yeterli. İndirim toplam tutara anında yansır.",
      ],
      [
        "Fatura nasıl gönderiliyor?",
        "Faturanız siparişinizle birlikte hazırlanır ve e-posta adresinize iletilir.",
      ],
    ],
  },
  {
    title: "Ürünler",
    items: [
      [
        "Ürünler orijinal mi?",
        "Seçkideki tüm ürünler yetkili tedarik kanallarından temin edilir.",
      ],
      [
        "Ürün stokta yoksa ne yapabilirim?",
        `Stoğa girdiğinde haber almak için ${EPOSTA_YERI} adresine ürün adıyla yazabilirsiniz.`,
      ],
      [
        "Hangi ürünün bana uygun olduğunu nasıl anlarım?",
        "Kategori sayfalarımızda ihtiyaca göre filtrelenmiş koleksiyonlar bulunur. Emin olamazsanız bize yazabilirsiniz.",
      ],
    ],
  },
];

const EN: SssGrubu[] = [
  {
    title: "Orders and shipping",
    items: [
      [
        "When is my order prepared?",
        "Your order is prepared once payment is confirmed. You are notified by e-mail when it is handed to the carrier.",
      ],
      ["How much is shipping?", KARGO_YERI],
      [
        "Which countries do you ship to?",
        "We ship worldwide. Your country decides the zone and the starting fee; the exact amount is calculated at checkout from your country and the weight of your basket.",
      ],
      [
        "Will I pay customs or import duty?",
        /*
          TÜRKÇE LİSTEDE KARŞILIĞI YOK ve olmamalı: yurt içinde
          böyle bir soru yok. Yurtdışında ise faturayı belirleyen
          asıl kalem ve söylenmezse müşteri kapıda öğreniyor.
        */
        "Possibly. Shipments leave from Türkiye, so any customs duty, import VAT or handling fee charged by your own country is payable by you and is not included in the price. Limits differ by country; your local customs authority is the only reliable source.",
      ],
      [
        "How do I track my order?",
        "Your tracking number is e-mailed when the parcel is handed to the carrier. You can also ask on our WhatsApp line with your order number.",
      ],
      [
        "Why is part of the catalogue missing?",
        "Some items cannot be sent abroad. They are not listed on the English pages at all, so you never reach checkout with something we cannot ship.",
      ],
    ],
  },
  {
    title: "Returns and exchanges",
    items: [
      [
        "Can I return an item?",
        "Unused items in a resaleable condition can be returned within 14 days of delivery under the right of withdrawal.",
      ],
      [
        "What cannot be returned?",
        "Cosmetics and personal care products whose packaging has been opened are outside the scope for hygiene reasons. The exception follows the nature of the item.",
      ],
      [
        "Who pays the return shipping?",
        /*
          TÜRKÇESİNDEN AYRILAN YANIT. Yurt içinde anlaşmalı kargoyla
          ücretsiz; yurtdışında anlaşmalı firmamız YOK. Türkçeyi
          çevirmek, olmayan bir imkânı vaat etmek olurdu.
        */
        "For international orders you arrange and pay the return shipping; we do not have a contracted carrier outside Türkiye, so we cannot send a prepaid label. If the item is faulty, wrong or incomplete, we pay every shipping cost in both directions.",
      ],
      [
        "How does a return work?",
        `Write to ${EPOSTA_YERI} with your order number. We send you a return code and tell you where to send the parcel.`,
      ],
      [
        "Can I exchange for another size?",
        "Yes for clothing, as long as the item is unworn and the labels are still attached.",
      ],
    ],
  },
  {
    title: "Payment",
    items: [
      [
        "Which cards do you accept?",
        "Visa, Mastercard, Troy, Maestro and American Express. Payments are taken through a 3D Secure protected provider.",
      ],
      [
        "Which currency am I charged in?",
        /*
          DEĞİŞMEZİN MÜŞTERİYE ANLATIMI: gösterilen dolar = tahsil
          edilen TL ÷ kur. Söylenmezse müşteri ekstrede ₺ görünce
          yanlış tutar sanıyor.
        */
        "Prices are shown in US dollars but the payment is taken in Turkish lira, so your statement shows a ₺ amount and your bank applies its own conversion. The dollar figure you see is that lira amount at our current rate.",
      ],
      [
        "Are my card details safe?",
        "The payment page is served by our licensed payment institution and protected by 3D Secure. Your card details never reach us and are never stored on our servers.",
      ],
      [
        "Where do I enter a discount code?",
        "In the field on the basket or checkout step. The discount is applied to the total immediately.",
      ],
      [
        "How do I get an invoice?",
        "Your invoice is prepared with your order and sent to your e-mail address.",
      ],
    ],
  },
  {
    title: "Products",
    items: [
      [
        "Are the products genuine?",
        "Everything in the selection is sourced through authorised supply channels.",
      ],
      [
        "Are the product descriptions in English?",
        /*
          DÜRÜST OLMAK: çeviri kademeli yürüyor ve bazı ürünler
          Türkçe adıyla görünüyor. Sormadan söylemek, müşterinin
          "site bozuk mu" diye düşünmesini önlüyor.
        */
        "Most of them. Translation is still running across the catalogue, so a few items may still show their Turkish name. The price, the size chart and the stock are the same either way.",
      ],
      [
        "What if something is out of stock?",
        `Write to ${EPOSTA_YERI} with the product name and we will tell you when it is back.`,
      ],
      [
        "How do I know which one suits me?",
        "The category pages group the selection by need. If you are unsure, write to us.",
      ],
    ],
  },
];

/*
  KARGO YANITI DİLE GÖRE BAŞKA KAYNAKTAN — ÇEVİRİ DEĞİL.

  CANLIDA YANLIŞ YAZIYORDU (23.10.2026): İngilizce SSS'te kargo
  yanıtı yurt içi cümlesiydi — "Kargo ücreti 120 TL'dir. 2.000 TL ve
  üzeri siparişlerde kargo ücretsizdir." Hem Türkçe hem de YURT İÇİ
  tarifesi: yurtdışı müşterisine 2.000 TL (≈41 $) üzeri ücretsiz
  kargo vaat ediyordu, oysa gerçek eşik bölgeye göre 250–500 $.

  Çeviri bunu ÇÖZMEZDİ: cümlenin rakamları yanlıştı, dili değil.

  Yurt içinde tek bir tarife var ve cümle `shippingTerms`'ten
  geliyor; yurtdışında ücret ülkeye VE ağırlığa bağlı, o yüzden tek
  rakam verilmiyor — yalnızca başlangıç ücreti söyleniyor.
*/
export function kargoYaniti({
  dil,
  yurtIciCumle,
  tabanSent,
  kaliplar,
}: {
  dil: Dil;
  yurtIciCumle: string;
  tabanSent: number | null;
  kaliplar: { tarifeli: string; tarifesiz: string };
}): string {
  if (dil !== "en") return yurtIciCumle;
  if (!tabanSent) return kaliplar.tarifesiz;
  return kaliplar.tarifeli.replace("{taban}", `$${(tabanSent / 100).toFixed(2)}`);
}

/** Varsayılan soru-cevaplar; kiracının kendi listesi varsa o geçerli. */
export function sssVarsayilanlari(dil: Dil): SssGrubu[] {
  return dil === "en" ? EN : TR;
}
