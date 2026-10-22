import { HakkimizdaGovdesi } from "@/components/hakkimizda-govdesi";
import type { Metadata } from "next";
import { getStorefrontProducts } from "@/lib/products";
import { getStorefrontCollections } from "@/lib/collections";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { magazaSayfasi } from "@/lib/magaza-sayfasi-oku";
import { paragraflar } from "@/lib/magaza-sayfasi";
import { konagiAyarla } from "@/lib/konak";

/**
 * Hakkımızda sayfası.
 *
 * Kurumsal metin yığını yerine mağaza diliyle kurulmuştur: her
 * bölüm bir panel, sonunda gerçek ürünlerle biten bir vitrin.
 * Ziyaretçinin sayfayı okuyup çıkmasını değil, okuyup alışverişe
 * dönmesini hedefler.
 *
 * METİN KİRACININ OLABİLİR. Sayfanın başlığı ve giriş metni mağaza
 * panelinden yazılabiliyor (ArvoARC → Ayarlar → Sayfalar). Önceden
 * hepsi kodda sabitti ve ArvoCulture'ın kendi anlatısıydı —
 * "Giyim, kişisel bakım ve koku dünyasını…". İkinci bir kiracı bu
 * sayfayla yayına GİREMEZDİ: müşterisine başka bir markanın
 * hikâyesini gösterirdi.
 *
 * KİRACI YAZDIYSA BİZİM SESİMİZ ÇEKİLİYOR. Aşağıdaki "Nasıl
 * çalışıyoruz" ve "sözü" bölümleri yalnızca kendi metni OLMAYAN
 * mağazada çiziliyor. Sebebi basit: o cümleler bir söz veriyor
 * ("kataloğa ürün eklemiyoruz, seçki kuruyoruz") ve kiracının
 * ağzından böyle bir söz vermek bize düşmez. Kendi metnini yazan
 * mağazanın sayfasında yalnızca kendi cümleleri ve kendi
 * verisinden çıkan rakamlar kalıyor.
 */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ konak: string }>;
}): Promise<Metadata> {
  /* Adres yoldan geliyor; üstveri düzenle aynı anda
     çalışabildiği için burada da bırakılıyor (lib/konak). */
  konagiAyarla((await params).konak);

  const [sayfa, tema] = await Promise.all([
    magazaSayfasi("hakkimizda", "en"),
    getStorefrontTheme(),
  ]);

  /* Açıklama kiracının ilk paragrafından; yoksa mağaza adıyla
     kurulan tek cümle. Sabit bir açıklama, arama sonucunda her
     mağazaya aynı metni yazardı. */
  const girisi = sayfa ? paragraflar(sayfa.govde)[0] : undefined;

  return {
    title: sayfa?.baslik || "About our selection",
    description:
      girisi?.slice(0, 300) ??
      `How ${tema.store_name} builds its selection, how it works and what it promises.`,
    alternates: { canonical: "/en/hakkimizda" },
  };
}

export const dynamic = "force-dynamic";

export default async function AboutEn({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [products, collections, sayfa] = await Promise.all([
    getStorefrontProducts(60),
    getStorefrontCollections(),
    magazaSayfasi("hakkimizda", "en"),
  ]);

  const featured = products
    .filter((product) => product.available !== false)
    .slice(0, 5);

  const categoryCount = new Set(products.map((product) => product.category))
    .size;


  return (
    <HakkimizdaGovdesi
      sayfa={sayfa}
      products={products}
      collections={collections}
      categoryCount={categoryCount}
      featured={featured}
      dil="en"
    />
  );
}
