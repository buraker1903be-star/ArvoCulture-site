import { NextResponse } from "next/server";
import { getProductVariants } from "@/lib/variants";
import { varyantOzeti } from "@/lib/varyant-ozeti";

/**
 * Bir ürünün varyant özeti: kaç tane var ve tek ise hangisi.
 *
 * Koleksiyon kartındaki hızlı ekleme bunu kullanıyor. Kart verisi
 * varyant taşımıyor (katalog fonksiyonu yalnızca en düşük fiyatı ve
 * stokta olan bedenleri veriyor), kartla birlikte her ürünün
 * varyantlarını çekmek de listeyi şişirirdi — o yüzden yalnızca
 * müşteri düğmeye bastığında, tek ürün için sorulur.
 *
 * Neden gerekti: kart, kategorisi "Giyim" olmayan her ürünü SKU'suz
 * sepete atıyordu; altı tonlu ruj da öyle. Ayrıntı
 * lib/varyant-ozeti.ts içinde.
 */
export async function GET(request: Request) {
  const slug = new URL(request.url).searchParams.get("slug")?.trim() ?? "";

  /* ArvoARC'ın fonksiyonu da aynı kalıbı istiyor; buradan geçmeyen
     bir slug için sorgu atmanın anlamı yok. */
  if (!/^[a-z0-9][a-z0-9-]{0,199}$/.test(slug)) {
    return NextResponse.json({ error: "Geçersiz slug." }, { status: 400 });
  }

  const { varyantlar, okunamadi } = await getProductVariants(slug);

  /*
    OKUNAMADIYSA 503. Boş özet dönmek, kartın "tek varyant" sanıp
    yanlış SKU yazmasına değil ama müşteriyi sessizce ürün sayfasına
    göndermesine yol açardı; istemci yine ürün sayfasına gidiyor,
    fakat nedenini biliyor ve kullanıcıya söyleyebiliyor.
  */
  if (okunamadi) {
    return NextResponse.json({ error: "Seçenekler okunamadı." }, { status: 503 });
  }

  return NextResponse.json(varyantOzeti(varyantlar));
}
