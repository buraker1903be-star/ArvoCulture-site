import "server-only";
import { cache } from "react";
import { rpcOrEmpty } from "@/lib/arc";
import { vitrinKonagi } from "@/lib/konak";
import type { Product } from "@/lib/product-types";

/**
 * Ürünlerin İngilizce adı ve açıklaması.
 *
 * ÇEVİRİ VERİTABANINDA, ÇALIŞMA ANINDA ÜRETİLMİYOR: sayfa çizilirken
 * bir çeviri servisine gitmek her istekte ücret, servis düştüğünde
 * yarı Türkçe sayfa ve arama motorunun her taramada farklı metin
 * görmesi demekti (aynı adres, değişen içerik = dizine girmeyen
 * sayfa).
 *
 * BOŞ ÇEVİRİ TÜRKÇEYE DÜŞÜYOR. 3.400 ürünün çevirisi kademeli
 * yürüyor; çevirisi olmayan ürün İngilizce vitrinde Türkçe adıyla
 * görünür. Yarım çeviri, boş bir kart ya da "[untranslated]" gibi
 * bir izden iyi.
 *
 * ÖNBELLEKSİZ DEĞİL AMA KISA: çeviri seyrek değişiyor; otuz saniye,
 * panelden düzeltilen bir adın vitrine inmesi için yeterli.
 */
const yukle = (konak: string, sluglar: string[]) =>
  rpcOrEmpty<{ slug: string; name_en: string | null; description_en: string | null }>(
    "arc_storefront_translations",
    { p_host: konak, p_sluglar: sluglar },
    { revalidate: 30, tags: ["storefront-translations"] },
  );

/**
 * Verilen ürünlerin İngilizce karşılıklarını BİNDİRİR.
 *
 * Slug listesi boşsa sorgu HİÇ yapılmıyor: boş bir dizi için
 * veritabanına gitmek, sayfanın en sık çizilen hâlinde boşa tur
 * demekti.
 */
export const ingilizceBindir = cache(async (urunler: Product[]): Promise<Product[]> => {
  const sluglar = urunler.map((urun) => urun.slug);
  if (sluglar.length === 0) return urunler;

  const satirlar = await yukle(await vitrinKonagi(), sluglar);
  if (satirlar.length === 0) return urunler;

  const ceviri = new Map(satirlar.map((satir) => [satir.slug, satir]));
  return urunler.map((urun) => {
    const en = ceviri.get(urun.slug);
    if (!en?.name_en) return urun;
    return {
      ...urun,
      name: en.name_en,
      /* Açıklama çevirisi yoksa Türkçe açıklama DURUYOR: ürün
         kartında kullanılan alt başlık ondan türetiliyor ve boş
         bırakmak kartı kırpardı. */
      description: en.description_en ?? urun.description,
    };
  });
});
