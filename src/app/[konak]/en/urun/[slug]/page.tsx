import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UrunSayfasi } from "@/components/urun-sayfasi";
import { getStorefrontProduct } from "@/lib/products";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";

/*
  İNGİLİZCE ÜRÜN SAYFASI.

  GÖVDE ORTAK (components/urun-sayfasi): Türkçe rota aynı bileşeni
  `dil="tr"` ile çağırıyor. Sayfa KOPYALANMADI — 3.400 ürünün sayfası
  ve iki kopya kaçınılmaz olarak ayrışır; bu depoda aynı kalıp
  (vitrin ile ArvoARC'ın hesabı) bir kez müşteriye farklı tutar
  gösterdi.

  NEDEN AYRI ADRES: dil seçimi tarayıcıda ve çerez okuyan bir sayfa
  Next'te dinamikleşiyor (o değişiklik bu depoda 3.400 ürün sayfasını
  bir kez 500'e düşürdü). Ayrı adresin önbellek anahtarı da ayrı:
  sayfa saklanabiliyor ve arama motoru İngilizce sayfayı AYRICA
  dizine alabiliyor — asıl kazanç bu, yoksa İngilizce içerik hiç
  bulunmazdı.

  DİNAMİK, ÇÜNKÜ MOD DEĞİŞEBİLİR. `/en` ana sayfasında ölçüldü
  (22.10.2026): saklanan bir sayfada ayara bağlı `notFound()` PİŞİYOR
  ve mod sonradan açılsa bile 404 kalıyor. `generateStaticParams` da
  bilerek YOK: 3.400 İngilizce sayfayı derleme anında üretmek, çoğu
  henüz çevirisi olmayan sayfalar için boşa iş.
*/
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ konak: string; slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, konak } = await params;
  konagiAyarla(konak);
  const [product, rules] = await Promise.all([getStorefrontProduct(slug), getSalesRules()]);
  if (!product) return {};
  if (!rules.internationalEnabled || !(rules.usdRate ?? 0)) return {};

  return {
    title: product.name,
    alternates: {
      canonical: `/en/urun/${product.slug}`,
      languages: { "tr-TR": `/urun/${product.slug}`, en: `/en/urun/${product.slug}` },
    },
    /* Tükenmiş ürünü dizine ekletmiyoruz; Türkçe rotayla aynı kural. */
    robots: { index: product.available !== false, follow: true },
  };
}

export default async function IngilizceUrunSayfasi({ params }: Params) {
  const { konak } = await params;
  konagiAyarla(konak);
  const rules = await getSalesRules();
  /*
    MOD KAPALIYSA SAYFA YOK — gerçek 404 ( `[konak]` kökünde
    loading.tsx yok, yani yumuşak 404 değil). Kapalı modda kur da
    gelmiyor, yani sayfa İngilizce metinle TL fiyat gösterirdi.
  */
  if (!rules.internationalEnabled || !rules.usdRate) notFound();

  return UrunSayfasi({ params, dil: "en" });
}
