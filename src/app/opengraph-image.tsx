import { ImageResponse } from "next/og";
import { brandCard, OG_SIZE } from "@/app/_og/cards";
import { ogFonts, ogMarka } from "@/app/_og/load";

/*
  Varsayılan paylaşım kartı. Ana sayfanın ve koleksiyon sayfalarının
  hiç paylaşım görseli yoktu; WhatsApp'ta bağlantı çıplak metin olarak
  görünüyordu. Alt segmentler (ürün sayfası) kendi kartını veriyor.

  Kartın metinleri ve logosu mağazanın temasından (ogMarka):
  önceden ArvoCulture'ın cümleleri ve logosu koda yazılıydı ve
  ikinci bir kiracının paylaştığı bağlantıda bizim markamız
  görünüyordu.

  `alt` STATİK OLMAK ZORUNDA (Next bu değeri derlemede okuyor), bu
  yüzden mağaza adı yazamıyoruz. Önceden "ArvoCulture — seçilmiş
  giyim, bakım ve koku" yazıyordu; yansız bir açıklama, başka bir
  markanın kartına bizim adımızı yazmaktan iyi.
*/
export const alt = "Mağaza paylaşım kartı";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [fonts, marka] = await Promise.all([ogFonts(), ogMarka()]);
  return new ImageResponse(brandCard(marka.kart), { ...size, fonts });
}
