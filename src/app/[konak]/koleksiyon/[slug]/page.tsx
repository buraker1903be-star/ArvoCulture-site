import type { Metadata } from "next";
import { KoleksiyonSayfasi } from "@/components/koleksiyon-sayfasi";
import { getStorefrontCollections } from "@/lib/collections";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";
import { SABIT_KOLEKSIYONLAR } from "@/lib/categories";
import { MERGED_INTO } from "@/lib/koleksiyon-kapsami";

/* Sabit koleksiyon adları: ArvoARC'ta karşılığı olmayan slug'lar
   için yedek başlık. */
const labels = SABIT_KOLEKSIYONLAR;

/*
  KOLEKSİYON ROTASI — Türkçe.

  Gövde ortak bileşende (components/koleksiyon-sayfasi); İngilizce
  rota (/en/koleksiyon/[slug]) aynı bileşeni `dil="en"` ile çağırıyor.
  Kopyalanmadı: süzgeçler, sayfalama ve yüz satırlık koleksiyon
  çözümü iki yerde durursa kaçınılmaz olarak ayrışır.

  Burada kalan tek şey rotaya ÖZGÜ olan: başlık ve dil etiketi.
*/

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; konak: string }>;
}): Promise<Metadata> {
  const { slug, konak } = await params;
  /* Adres yoldan geliyor; üstveri düzenle aynı anda çalışabildiği
     için burada da bırakılıyor (lib/konak). */
  konagiAyarla(konak);

  /*
    Başlık ArvoARC'taki koleksiyon adından geliyor.

    Önceden yalnızca aşağıdaki altı sabit slug'a bakılıyordu ve
    geri kalan her şey "Koleksiyon" oluyordu. Site haritasındaki
    118 kategori sayfasının tamamı aynı başlığı ve aynı açıklamayı
    taşıyordu: "Koleksiyon | ArvoCulture". Sayfanın kendi H1'i
    doğruydu ("Erkek T-Shirt"), yalnızca <title> yanlıştı — yani
    müşteri doğru sayfayı görüyor ama arama sonucunda hepsi aynı
    isimle sıralanıyordu.

    getStorefrontCollections React'in cache'iyle sarılı; aynı
    istekte sayfanın gövdesi de onu çağırıyor, bu yüzden burada
    ikinci bir veritabanı sorgusu doğmuyor.
  */
  const [collections, rules] = await Promise.all([
    getStorefrontCollections(),
    /* Yurtdışı modu: kapalıyken /en ağacı 404 ve dil etiketi
       yazılmıyor (aşağıda). */
    getSalesRules(),
  ]);
  const ingilizceAcik = rules.internationalEnabled && (rules.usdRate ?? 0) > 0;
  const collection = collections.find((item) => item.slug === slug);

  /* Tanınmayan slug'ın 404'ü layout.tsx'te: üstveriden çağrılan
     notFound() durum kodunu kurmuyor (ölçüldü, gerekçe orada). */

  const label = collection?.title ?? labels[slug] ?? "Koleksiyon";

  /* ArvoARC'taki açıklama varsa o kullanılıyor; arama sonucunda
     görünen metin kategoriye özel olmalı. */
  const ownDescription = collection?.description?.trim();
  const description =
    ownDescription && ownDescription.length > 40
      ? ownDescription.slice(0, 155)
      : /* Marka adı temadan: sabit "ArvoCulture", ikinci bir
           kiracının arama sonucuna bizim markamızı yazardı. */
        `${(await getStorefrontTheme()).store_name} ${label} seçkisi. ` +
        "Güncel ürünler, fiyatlar ve stok durumu.";

  /*
    Birleştirmede yutulan koleksiyon, içeriğini artık hedef sayfada
    da gösteriyor. İkisi de kendi başına dizine girerse aynı ürünler
    iki adreste görünür ve arama motoru hangisini göstereceğini
    bilemez. Kanonik adres hedefi işaret ediyor; sayfa erişilebilir
    kalıyor ama sıralamada tek bir adres yarışıyor.
  */
  const canonicalSlug = MERGED_INTO.get(slug) ?? slug;

  return {
    title: label,
    description,
    // Sayfalama parametresi (?sayfa=2) kanonik adresi bölmesin.
    /*
      KARŞILIKLI DİL ETİKETİ. Mod kapalıyken /en ağacı 404 ve etiket
      yazılmıyor — 404'e işaret eden bir hreflang, arama motoruna
      olmayan bir sayfayı göstermek olurdu.

      Kanonik adres BİRLEŞTİRİLMİŞ slug'a bakıyor (MERGED_INTO) ama
      dil etiketi istenen slug'a: ikisi farklı sorular ve kanoniği
      İngilizceye taşımak, birleştirmeyi iki dilde iki kez çözmek
      demekti.
    */
    alternates: ingilizceAcik
      ? {
          canonical: `/koleksiyon/${canonicalSlug}`,
          languages: {
            "tr-TR": `/koleksiyon/${slug}`,
            en: `/en/koleksiyon/${slug}`,
          },
        }
      : { canonical: `/koleksiyon/${canonicalSlug}` },
    openGraph: { url: `/koleksiyon/${slug}`, title: label, description },
  };
}

export default async function Collection(props: {
  params: Promise<{ slug: string; konak: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return KoleksiyonSayfasi({ ...props, dil: "tr" });
}
