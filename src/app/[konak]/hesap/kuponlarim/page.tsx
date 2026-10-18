import type { Metadata } from "next";
import Link from "next/link";
import { HesapYanMenu } from "@/components/hesap-yan-menu";
import { CouponCopy } from "@/components/coupon-strip";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { konagiAyarla } from "@/lib/konak";
import { formatPrice } from "@/lib/product-types";

export const metadata: Metadata = {
  title: "Kuponlarım",
  description: "Şu anda kullanabileceğiniz indirim kodları.",
  alternates: { canonical: "/hesap/kuponlarim" },
  /* Hesap altındaki her sayfa gibi indekslenmiyor. */
  robots: { index: false, follow: true },
};

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
export default async function Kuponlarim({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const indirimler = await getStorefrontDiscounts();
  /* Kodu olmayan kayıtlar otomatik kampanyalar (sepette kendiliğinden
     uygulanıyor); kupon listesinde yerleri yok. */
  const kuponlar = indirimler.filter((indirim) => Boolean(indirim.code));

  return (
    <main className="shell">
      <div className="hesap-duzen">
        <HesapYanMenu />
        <div className="hesap-icerik">
          <section className="panel about-hero detail-hero">
            <p className="about-eyebrow">Kuponlarım</p>
            <h1>Kullanabileceğiniz kodlar.</h1>
            <p className="about-lede">
              Sepete girerken kodu yapıştırın; indirim ödeme adımında
              uygulanır.
            </p>
          </section>

          {kuponlar.length === 0 ? (
            <section className="panel order-result">
              <h2>Şu anda açık bir kupon yok.</h2>
              <p>
                Yeni kampanyalar burada görünür. Bu arada indirimdeki
                ürünlere göz atabilirsiniz.
              </p>
              <div className="order-actions">
                <Link className="btn" href="/koleksiyon/firsatlar">
                  Fırsatlara bakın
                </Link>
              </div>
            </section>
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
                    <strong>{kupon.name}</strong>
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
                      yazsaydı müşterinin gördüğü yere göre farklı bir
                      söz vermiş olurduk.
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

        </div>
      </div>
    </main>
  );
}
