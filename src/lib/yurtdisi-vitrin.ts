import type { Product } from "@/lib/product-types";

/*
  İNGİLİZCE VİTRİNİN RAF SEÇİMİ — SAF.

  AYRI DOSYA, çünkü kural bir sayfanın içinde gömülü kalmamalı:
  "çok satan" rafı yedeklere düşerken katalog sırasına ASLA
  düşmemeli. Türkçe ana sayfada bu kural yorumla korunuyordu ("hiç
  satılmamış ürünü çok satan diye göstermek güveni zedeler");
  burada testle korunuyor.
*/

/**
 * Yurtdışına gönderilebilen ve stokta olan ürünler.
 *
 * Tükenen ürün de atılıyor: müşteriyi satın alamayacağı bir sayfaya
 * götürmek en pahalı terk noktası (Türkçe ana sayfada da öyle).
 */
export function gonderilebilir(urunler: Product[], engelli: Set<string>): Product[] {
  return urunler.filter(
    (urun) => urun.available !== false && !engelli.has(urun.slug),
  );
}

/**
 * "Çok satanlar" rafı: koleksiyon → işaretli ürün → BOŞ.
 *
 * ÜÇÜNCÜ ADIM KATALOG SIRASI DEĞİL, BOŞ. Katalog sırasına düşmek,
 * tedarikçiden yeni gelmiş ve hiç satılmamış ürünü "en çok tercih
 * edilen" diye göstermek olurdu. Boş dönünce sayfa bölümü hiç
 * çizmiyor — eksik bir raf, yanlış bir raftan iyidir.
 */
export function enCokTercihEdilen(
  koleksiyon: Product[],
  isaretliler: Product[],
  engelli: Set<string>,
  kac = 10,
): Product[] {
  const koleksiyondan = gonderilebilir(koleksiyon, engelli);
  if (koleksiyondan.length > 0) return koleksiyondan.slice(0, kac);

  const isaretli = gonderilebilir(isaretliler, engelli).filter((u) => u.bestSeller);
  return isaretli.slice(0, kac);
}
