import { ImageResponse } from "next/og";
import { brandCard, OG_SIZE } from "@/app/_og/cards";
import { ogFonts, ogLogo } from "@/app/_og/load";

/*
  Varsayılan paylaşım kartı. Ana sayfanın ve koleksiyon sayfalarının
  hiç paylaşım görseli yoktu; WhatsApp'ta bağlantı çıplak metin olarak
  görünüyordu. Alt segmentler (ürün sayfası) kendi kartını veriyor.
*/
export const alt = "ArvoCulture — seçilmiş giyim, bakım ve koku";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, logo] = await Promise.all([ogFonts(), ogLogo()]);
  return new ImageResponse(brandCard({ logo }), { ...size, fonts });
}
