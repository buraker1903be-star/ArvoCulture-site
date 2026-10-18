import type { StorefrontDiscount } from "@/lib/discounts";
import { toKurus } from "@/lib/order-quote";

/**
 * Kupon değerlendirmesi — yalnızca gösterim içindir.
 *
 * Gerçek indirim ArvoARC’ta, veritabanındaki kayıttan hesaplanır ve
 * PayTR’a giden tutar odur. Burada aynı kuralları uygulayıp
 * müşteriye anında geri bildirim veriyoruz; iki taraf ayrıldığında
 * sunucu kazanır.
 */
export type CouponResult =
  | { ok: true; amount: number; freeShipping: boolean; label: string }
  | { ok: false; reason: string };

/**
 * Kupona TABİ ara toplam: indirimli satırlar dışarıda.
 *
 * "İndirimdeki ürünlerde geçerli değildir" kuralı panelde VARDI ama
 * hiçbir yerde uygulanmıyordu: ArvoARC'ta indirim kaydının
 * `combinable` alanı ve panelde "Diğer indirimlerle birleştirilebilir"
 * kutusu duruyor, kutu işaretsizken detay ekranı "Tek başına
 * uygulanır" yazıyordu — ama `arc_create_order` kuponu her zaman
 * ara toplamın TAMAMINA uyguluyordu. Yani panel bir şey vaat edip
 * başka şey yapıyordu ve bu sessizdi.
 *
 * Satırın indirimli sayılması `oldPrice` ile: ürün kartındaki üstü
 * çizili fiyat da aynı alandan geliyor (ArvoARC'ta
 * `compare_at_price`). Alan yoksa satır indirimsiz sayılıyor —
 * müşterinin tarayıcısında DURAN eski sepetlerde bu alan yok ve
 * bilinmeyeni "indirimli" saymak, hak ettiği indirimi vermemek
 * olurdu. Tersi yönde yanılmak müşterinin lehine.
 */
export function kuponaTabiToplam(
  items: Array<{ price: number; oldPrice?: number; quantity: number }>,
): number {
  return items.reduce(
    (toplam, satir) =>
      satir.oldPrice && satir.oldPrice > satir.price
        ? toplam
        : toplam + satir.price * satir.quantity,
    0,
  );
}

export function evaluateCoupon(
  discounts: StorefrontDiscount[],
  code: string,
  subtotal: number,
  /**
   * İndirimli satırlar çıkarılmış ara toplam (`kuponaTabiToplam`).
   *
   * Zorunlu ve varsayılanı YOK: varsayılan `subtotal` olsaydı yeni
   * bir çağrı yerini unuttuğunda kural sessizce kapanırdı — tam da
   * bu kuralın bugüne kadar uygulanmamış olmasının sebebi.
   */
  indirimsizAraToplam: number,
): CouponResult {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, reason: "Kod girin." };

  const found = discounts.find(
    (discount) => (discount.code ?? "").toUpperCase() === normalized,
  );

  if (!found) {
    return { ok: false, reason: "Bu kod geçerli değil." };
  }

  // Tutarlar ArvoARC’ta kuruş cinsinden tutulur; karşılaştırma ve hesap da
  // kuruşta yapılır ki kayan nokta farkı sınırda sonucu değiştirmesin.
  const subtotalKurus = toKurus(subtotal);
  const minimum = (found.minimum_subtotal ?? 0) / 100;
  if (subtotalKurus < (found.minimum_subtotal ?? 0)) {
    return {
      ok: false,
      reason: `Bu kod ${new Intl.NumberFormat("tr-TR", {
        style: "currency",
        currency: "TRY",
      }).format(minimum)} ve üzeri sepetlerde geçerli.`,
    };
  }

  /*
    Kuponun uygulanacağı taban: birleşebilir kuponda sepetin tamamı,
    değilse yalnızca indirimsiz satırlar. ArvoARC'ın sipariş
    fonksiyonu da aynı ayrımı yapıyor (migration
    20261018_kupon_indirimli_urunde_gecmez); ikisi ayrılırsa
    müşteri ödemede başka tutar görür.
  */
  const taban = found.combinable ? subtotal : indirimsizAraToplam;

  if (found.discount_type === "free_shipping") {
    return {
      ok: true,
      amount: 0,
      freeShipping: true,
      label: "Kargo ücretsiz",
    };
  }

  /*
    Sepetin tamamı indirimliyse taban sıfır: "0 TL indirim" yazan bir
    kutu müşteriye kodun ÇALIŞTIĞINI düşündürür, sonra toplam
    değişmeyince kodu tekrar tekrar dener. Sebebi söylemek gerekiyor.
  */
  const tabanKurus = toKurus(taban);
  if (tabanKurus <= 0) {
    return {
      ok: false,
      reason: "Bu kod indirimdeki ürünlerde geçerli değil.",
    };
  }

  // ArvoARC sipariş fonksiyonuyla aynı: yüzde indirim kuruşta yuvarlanır,
  // sabit indirim (value kuruş) tabanı aşamaz.
  const amountKurus =
    found.discount_type === "percentage"
      ? Math.round((tabanKurus * found.value) / 100)
      : Math.min(found.value, tabanKurus);
  const amount = amountKurus / 100;

  /*
    Kupon sepetin TAMAMINA uygulanmadıysa bunu satırın kendisi
    söylüyor. Koşul kampanya bandında ve kupon şeridinde yazıyor
    ama müşteri sepete geldiğinde onlar ekranda değil; burada
    gördüğü tek şey beklediğinden küçük bir indirim olurdu.
  */
  const kismi = taban < subtotal;
  const temel =
    found.discount_type === "percentage" ? `%${found.value} indirim` : "İndirim";

  return {
    ok: true,
    amount,
    freeShipping: false,
    label: kismi ? `${temel} (indirimliler hariç)` : temel,
  };
}
