import { notFound } from "next/navigation";
import { getStorefrontCollections } from "@/lib/collections";
import { SABIT_KOLEKSIYONLAR } from "@/lib/categories";

/*
  TANINMAYAN SLUG BURADA 404 OLUYOR — sayfada ya da üstveride değil.

  Kontrol önce sayfa gövdesindeydi, sonra "üstveri akıştan önce
  çözülür" gerekçesiyle generateMetadata'ya alınmıştı. İkisi de
  çalışmıyor; 01.10.2026'da yerel üretim derlemesinde dört ayrı
  denekle ölçüldü:

    loading.tsx yok  + notFound gövdede        → 404  ✔
    loading.tsx VAR  + notFound gövdede        → 200  ✘
    loading.tsx yok  + notFound üstveride      → 200  ✘
    loading.tsx VAR  + notFound üstveride      → 200  ✘
    loading.tsx VAR  + notFound YERLEŞİMDE     → 404  ✔

  Yani iki ayrı sebep vardı: `loading.tsx`in kurduğu Suspense sınırı
  durum kodunu iskeletle birlikte kilitliyor, ve generateMetadata
  içindeki notFound() durum kodunu hiç kurmuyor. Yerleşim akış
  sınırının ÜSTÜNDE çalıştığı için ikisini birden aşıyor ve iskelet
  de yerinde kalıyor.

  Ölçülen sonuç: /koleksiyon/uydurma-bir-sey 200 dönüyordu, "Tüm
  Ürünler" başlığıyla ve sıfır ürünle — arama motoru için sonsuz
  sayıda sahte sayfa.

  getStorefrontCollections `cache` ile sarılı; sayfa ve üstveri de
  aynı çağrıyı yapıyor, fazladan sorgu doğmuyor.
*/
export default async function KoleksiyonYerlesimi({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (SABIT_KOLEKSIYONLAR[slug]) return <>{children}</>;

  const collections = await getStorefrontCollections();
  if (!collections.some((item) => item.slug === slug)) notFound();

  return <>{children}</>;
}
