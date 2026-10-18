import { notFound } from "next/navigation";
import { getStorefrontProduct } from "@/lib/products";

/*
  OLMAYAN ÜRÜN BURADA 404 OLUYOR — sayfada ya da üstveride değil.

  Kontrol üstverideydi ve "üstveri akış başlamadan çözülür, buradan
  çağrılan notFound() gerçek 404 üretir" yazıyordu. Ölçüldüğünde
  öyle olmadığı görüldü: /urun/olmayan-bir-urun-123 HTTP 200
  dönüyordu (01.10.2026). Gerekçesi ayrıntılı olarak koleksiyon
  yerleşiminde yazılı.

  getStorefrontProduct `cache` ile sarılı; sayfa gövdesi ve üstveri
  aynı çağrıyı yapıyor, fazladan sorgu doğmuyor.
*/
export default async function UrunYerlesimi({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!(await getStorefrontProduct(slug))) notFound();
  return <>{children}</>;
}
