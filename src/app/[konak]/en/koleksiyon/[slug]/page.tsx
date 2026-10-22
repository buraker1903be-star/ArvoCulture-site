import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KoleksiyonSayfasi } from "@/components/koleksiyon-sayfasi";
import { getStorefrontCollections } from "@/lib/collections";
import { getSalesRules } from "@/lib/store-settings";
import { konagiAyarla } from "@/lib/konak";

/*
  İNGİLİZCE KOLEKSİYON SAYFASI.

  GÖVDE ORTAK (components/koleksiyon-sayfasi): Türkçe rota aynı
  bileşeni `dil="tr"` ile çağırıyor. Süzgeçler, sayfalama ve yüz
  satırlık koleksiyon çözümü iki yerde durursa kaçınılmaz olarak
  ayrışır.

  DİNAMİK, ÇÜNKÜ MOD DEĞİŞEBİLİR: saklanan bir sayfada ayara bağlı
  `notFound()` PİŞİYOR ve mod sonradan açılsa bile 404 kalıyor —
  /en ana sayfasında canlıda ölçüldü (22.10.2026).
*/
export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{ slug: string; konak: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; konak: string }>;
}): Promise<Metadata> {
  const { slug, konak } = await params;
  konagiAyarla(konak);
  const [koleksiyonlar, rules] = await Promise.all([
    getStorefrontCollections(),
    getSalesRules(),
  ]);
  if (!rules.internationalEnabled || !(rules.usdRate ?? 0)) return {};

  /*
    BAŞLIK ÇEVİRİDEN, yoksa Türkçe adıyla. Yedek başlığı
    "Collection" gibi tek tip bir şey yapmak, 118 sayfanın arama
    sonucunda ayırt edilemez olması demekti — bu kusur Türkçe
    tarafta bir kez yaşandı ve başlıkların koleksiyon adından
    gelmesi o yüzden düzeltilmişti.
  */
  const koleksiyon = koleksiyonlar.find((item) => item.slug === slug);
  const baslik = koleksiyon?.title_en || koleksiyon?.title;

  return {
    ...(baslik ? { title: baslik } : {}),
    alternates: {
      canonical: `/en/koleksiyon/${slug}`,
      languages: { "tr-TR": `/koleksiyon/${slug}`, en: `/en/koleksiyon/${slug}` },
    },
  };
}

export default async function IngilizceKoleksiyon(props: Params) {
  const { konak } = await props.params;
  konagiAyarla(konak);
  const rules = await getSalesRules();
  /* Mod kapalıysa sayfa yok — gerçek 404 (`[konak]` kökünde
     loading.tsx yok, yani yumuşak 404 değil). */
  if (!rules.internationalEnabled || !rules.usdRate) notFound();

  return KoleksiyonSayfasi({ ...props, dil: "en" });
}
