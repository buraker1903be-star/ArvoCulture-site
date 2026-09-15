import { ImageResponse } from "next/og";
import { brandCard, productCard, OG_SIZE } from "@/app/_og/cards";
import { ogFonts, ogLogo, ogProductImage } from "@/app/_og/load";
import { getStorefrontProduct } from "@/lib/products";
import { formatPrice } from "@/lib/product-types";

/*
  Ürün paylaşım kartı: ürün görseli, marka, ad ve fiyat.

  Önceden paylaşım görseli ürünün ham fotoğrafıydı (1,17 MB PNG);
  WhatsApp bu boyutta önizlemeyi çoğu zaman göstermiyordu ve fiyat
  görünmüyordu. Kart bir saat önbellekte tutuluyor; fiyat değişirse
  en geç bir saat içinde yenileniyor.
*/
export const alt = "ArvoCulture ürün kartı";
export const size = OG_SIZE;
export const contentType = "image/png";
export const revalidate = 3600;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  /*
    ARC okunamazsa (kesinti, geçersiz anahtar) kart yine çiziliyor:
    marka kartına dönülüyor. Hata fırlatılsaydı rota 500 verir ve
    paylaşılan bağlantıda hiç önizleme çıkmazdı.
  */
  const [product, fonts, logo] = await Promise.all([
    getStorefrontProduct(slug).catch((error) => {
      console.error("Paylaşım kartı için ürün okunamadı:", error);
      return null;
    }),
    ogFonts(),
    ogLogo(),
  ]);

  if (!product) {
    return new ImageResponse(brandCard({ logo }), { ...size, fonts });
  }

  const image = await ogProductImage(product.image);
  const oldPrice =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice
      : undefined;
  const off =
    product.discountPercent ||
    (oldPrice ? Math.round((1 - product.price / oldPrice) * 100) : 0);

  return new ImageResponse(
    productCard({
      logo,
      image,
      brand: product.eyebrow || "ArvoCulture",
      name: product.name,
      priceText: formatPrice(product.price),
      oldPriceText: oldPrice ? formatPrice(oldPrice) : undefined,
      offText: off > 0 && product.available !== false ? `−%${off}` : undefined,
    }),
    { ...size, fonts },
  );
}
