import type { Metadata } from "next";
import { OzetBolumu } from "@/components/hesap-bolumleri";

export const metadata: Metadata = {
  title: "Hesabım",
  description:
    /* Marka adı çıkarıldı: sayfa indekslenmiyor (robots: index false)
       ve ortak dağıtımda her kiracıya ArvoCulture'ı yazardı.
       "Numarasıyla takip" de yazmıyor: vitrinde numarayla
       sorgulanan bir ekran YOK, takip sipariş onayı
       e-postasındaki kişiye özel bağlantıyla yapılıyor. */
    "Sipariş takibi ve hesap işlemleri. Üye olmadan da sipariş verebilir, onay e-postanızdaki bağlantıdan siparişinizi izleyebilirsiniz.",
  alternates: { canonical: "/hesap" },
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

/**
 * Hesabın özet sayfası.
 *
 * Kabuk (karşılama, yan menü, oturum denetimi) `layout.tsx`'te;
 * burada yalnızca bölümün gövdesi var. Üyelik zorunlu değil:
 * misafir alışveriş açık kalır, hesap yalnızca sipariş geçmişi ve
 * hızlı ödeme için bir kolaylıktır.
 */
export default function Hesap() {
  return <OzetBolumu />;
}
