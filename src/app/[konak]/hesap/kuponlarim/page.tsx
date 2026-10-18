import type { Metadata } from "next";
import { CouponCopy } from "@/components/coupon-strip";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { formatPrice } from "@/lib/product-types";

export const metadata: Metadata = {
  title: "Kuponlarım",
  description: "Şu anda kullanabileceğiniz indirim kodları.",
  alternates: { canonical: "/hesap/kuponlarim" },
  /* Hesap altındaki her sayfa gibi indekslenmiyor. */
  robots: { index: false, follow: true },
};

/* Kabuk (düzen) oturuma bakıyor; rota saklanmamalı. */
export const dynamic = "force-dynamic";

/**
 * Kuponlarım.
 *
 * ArvoARC'ta kupon KİŞİYE BAĞLI DEĞİL: `arc_discounts` kaydı bir
 * kod, bir koşul ve bir kullanım hakkı tutuyor; "şu müşteriye
 * verildi" diye bir alan yok. Bu yüzden sayfa, uydurma bir
 * kişiselleştirme yapmak yerine doğruyu gösteriyor: şu anda açık
 * olan kodlar ve koşulları.
 *
 * Kullanım hakkının gerçekten dolup dolmadığını yalnızca sunucu
 * bilir (`arc_check_coupon`, kişi başı sınırı siparişlerden
 * sayıyor). Burada "kullanabilirsin" demiyoruz; kodu ve koşulu
 * veriyoruz, kararı sepet veriyor. Önceden bu ekran hiç yoktu ve
 * müşteri kodu yalnızca ana sayfadaki şeritte görebiliyordu —
 * oradan ayrılınca kod da kayboluyordu.
 */
export default async function Kuponlarim() {
  const indirimler = await getStorefrontDiscounts();
  /* Kodu olmayan kayıtlar otomatik kampanyalar (sepette kendiliğinden
     uygulanıyor); kupon listesinde yerleri yok. */
  const kuponlar = indirimler.filter((indirim) => Boolean(indirim.code));

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h1>Kuponlarım</h1>
          <p>
            Sepete girerken kodu yapıştırın; indirim ödeme adımında
            uygulanır.
          </p>
        </div>
      </div>

      {kuponlar.length === 0 ? (
        <p className="hint">
          Şu anda açık bir kupon yok. Yeni kampanyalar burada görünür.
        </p>
      ) : (
        <ul className="kupon-izgara">
          {kuponlar.map((kupon) => (
            <li key={kupon.id} className="kupon-kart">
              <div className="kupon-kart-ust">
                <span className="kupon-deger">
                  {kupon.discount_type === "percentage"
                    ? `%${kupon.value}`
                    : kupon.discount_type === "free_shipping"
                      ? "Ücretsiz kargo"
                      : formatPrice(kupon.value / 100)}
                </span>
                {/*
                  Kampanyanın adı KODLA AYNIYSA yazılmıyor:
                  "ARVO10" başlığının altında ikinci kez "ARVO10"
                  yazan bir kutu, müşteriye iki ayrı şey varmış gibi
                  geliyordu.
                */}
                {kupon.name &&
                  kupon.name.toUpperCase() !==
                    (kupon.code ?? "").toUpperCase() && (
                    <strong>{kupon.name}</strong>
                  )}
              </div>

              <ul className="kupon-kosul">
                {kupon.minimum_subtotal > 0 && (
                  <li>
                    {formatPrice(kupon.minimum_subtotal / 100)} ve üzeri
                    sepetlerde
                  </li>
                )}
                {/*
                  Koşul ana sayfadaki şeritle AYNI cümle: kod iki
                  yerde duyuruluyor ve koşul yalnızca birinde
                  yazsaydı müşterinin gördüğü yere göre farklı bir söz
                  vermiş olurduk.
                */}
                <li>
                  {kupon.combinable
                    ? "Diğer indirimlerle birlikte kullanılabilir"
                    : "İndirimdeki ürünlerde geçerli değildir"}
                </li>
              </ul>

              <CouponCopy code={kupon.code as string} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
