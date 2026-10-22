import type { Metadata } from "next";
import { getStorefrontProduct } from "@/lib/products";
import { konagiAyarla } from "@/lib/konak";
import { getSalesRules } from "@/lib/store-settings";
import { UrunSayfasi } from "@/components/urun-sayfasi";

/**
 * Ürün sayfası altmış saniyeliğine saklanıyor.
 *
 * Ölçüm: sayfa her istekte baştan çiziliyordu (`x-vercel-cache:
 * MISS`, ~355 ms). Sebebi, sayfadaki tüm veri çağrılarının POST
 * olması — Next yalnızca GET isteklerini önbelleğe alıyor, bu
 * yüzden segmentin yenilenme süresi sıfıra düşüyor ve sayfa
 * dinamik sayılıyordu. Buradaki tek satır, `arc.ts` içinde zaten
 * yazılı olan niyeti (`revalidate: 60`) gerçekten uygulanır hâle
 * getiriyor.
 *
 * Bedeli açık: bir fiyat değişikliği müşteriye en geç bir dakika
 * gecikmeyle yansıyor. Bunu kabul edilebilir kılan şey, ödenecek
 * tutarın burada değil ArvoARC'ta hesaplanması — vitrindeki rakam
 * bilgilendirme, sepetteki rakam taahhüt.
 *
 * Süre kısaltılmak istenirse değiştirilecek yer burası.
 */
export const revalidate = 60;

/*
  ADRES YOLDAN GELDİĞİ İÇİN BU SAYFA STATİK ÜRETİLEBİLİYOR.

  Burada bir koruma duruyordu: `VITRIN_KONAGI` tanımsızsa derleme
  durduruluyordu. Sebebi adresin istek başlığından okunmasıydı —
  statik üretimde `headers()` çağırmak DYNAMIC_SERVER_USAGE
  fırlatıyor ve 18.10.2026'da canlıda bütün ürün sayfaları (3.400)
  bu yüzden 500 verdi.

  Artık adres YOLUN parçası: `src/proxy.ts` her isteği
  `/<konak>/...` olarak yeniden yazıyor ve adres `params` ile
  geliyor, başlık okunmuyor. Koruma gereksiz kaldı; üstelik
  çözümün önünü keserdi.

  Kazanç yalnızca hatanın kalkması değil: önbellek anahtarı yolu
  içerdiği için her mağaza KENDİ sayfasını saklıyor ve rota
  önbelleği çok mağazalı kipte de çalışıyor.
*/

/**
 * Boş liste dönüyor ve bu bilinçli.
 *
 * `revalidate` tek başına yetmedi: canlıda ölçtüğümde sayfa hâlâ
 * her istekte baştan çiziliyordu (`x-vercel-cache: MISS`,
 * `cache-control: private, no-store`). Sebebi, `generateStaticParams`
 * bulunmayan dinamik bir segmentin Next tarafından tamamen dinamik
 * sayılması — yenilenme süresi verilmiş olsa bile saklanacak bir
 * sayfa üretilmiyor.
 *
 * Boş liste vermek, "bu yolu önceden üretme ama istendiğinde üret
 * ve sakla" demek. Derleme süresi değişmiyor: 3.429 ürünün hiçbiri
 * önceden çizilmiyor. İlk isteyen müşteri sayfayı üretiyor,
 * sonrakiler uçtan alıyor.
 *
 * `dynamicParams` öntanımlı olarak açık; listede olmayan slug'lar
 * yine çalışıyor, olmayan ürün yine 404 veriyor.
 */
export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ slug: string; konak: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug, konak } = await params;
  /* Adres yoldan geliyor; üstveri düzenle aynı anda çalışabildiği
     için burada da bırakılıyor (lib/konak). */
  konagiAyarla(konak);
  const [product, rules] = await Promise.all([
    getStorefrontProduct(slug),
    /* Yurtdışı modu: kapalıyken /en ağacı 404 ve dil etiketi
       yazılmıyor (aşağıda). */
    getSalesRules(),
  ]);
  const ingilizceAcik = rules.internationalEnabled && (rules.usdRate ?? 0) > 0;

  /* Olmayan ürünün 404'ü layout.tsx'te: üstveriden çağrılan
     notFound() durum kodunu kurmuyor (ölçüldü, gerekçe orada). */
  if (!product) return {};

  const description =
    product.subtitle || product.description.slice(0, 155) || product.name;

  return {
    title: product.name,
    description,
    /*
      KARŞILIKLI DİL ETİKETİ. İngilizce eşi /en/urun/<slug>; etiket
      olmadan arama motoru iki sayfayı birbirinin kopyası sayardı.
      Mod kapalıyken /en ağacı 404 ve etiket yazılmıyor — 404'e
      işaret eden bir hreflang, olmayan sayfayı göstermek olurdu.
    */
    alternates: ingilizceAcik
      ? {
          canonical: `/urun/${product.slug}`,
          languages: {
            "tr-TR": `/urun/${product.slug}`,
            en: `/en/urun/${product.slug}`,
          },
        }
      : { canonical: `/urun/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/urun/${product.slug}`,
      // Görsel: aynı klasördeki opengraph-image.tsx (marka kartı).
    },
    // Tükenmiş ürünü dizine ekletmiyoruz; stok gelince tekrar açılır.
    robots: { index: product.available !== false, follow: true },
  };
}

export default async function ProductPage({ params }: Params) {
  /*
    GÖVDE ORTAK BİLEŞENDE (components/urun-sayfasi).

    İngilizce rota (/en/urun/[slug]) aynı bileşeni `dil="en"` ile
    çağırıyor. Sayfa KOPYALANMADI: 3.400 ürünün sayfası ve iki kopya
    kaçınılmaz olarak ayrışır — bu depoda aynı kalıp (vitrin ile
    ArvoARC'ın hesabı) bir kez müşteriye farklı tutar gösterdi.

    Burada kalanlar rotaya ÖZGÜ olanlar: önbellek süresi, statik
    üretim listesi ve başlık/şema adresleri.
  */
  return UrunSayfasi({ params, dil: "tr" });
}
