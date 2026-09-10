import { env } from "@/lib/env";
import { SELLER } from "@/lib/seller";
import { getStorefrontCollections } from "@/lib/collections";

/**
 * llms.txt
 *
 * Yanıt üreten sistemlerin siteyi hızlıca anlaması için sade bir
 * özet. Beklentiyi doğru kurmakta fayda var: bu dosya henüz bir
 * standart değil, Google desteklemediğini açıkça söyledi ve
 * botların çoğu istemiyor bile. Buna rağmen koyuyoruz çünkü
 * maliyeti neredeyse sıfır ve ileride yaygınlaşırsa hazır oluyoruz.
 *
 * Asıl görünürlük işi bu dosyada değil: kataloğun taranabilir
 * olmasında, sayfaların hızlı açılmasında ve yapılandırılmış
 * verinin doğru olmasında. Onlar zaten yapıldı.
 *
 * İçerik veritabanından üretiliyor; koleksiyonlar değiştikçe bu
 * dosya da kendiliğinden güncelleniyor. Elle tutulan bir liste
 * kaçınılmaz olarak eskir.
 */

export const revalidate = 3600;

export async function GET() {
  const collections = await getStorefrontCollections();

  const koleksiyonSatirlari = collections
    .slice(0, 40)
    .map(
      (collection) =>
        `- [${collection.title}](${env.siteUrl}/koleksiyon/${collection.slug})`,
    )
    .join("\n");

  const body = `# ${SELLER.brand}

> Giyim, kişisel bakım, kozmetik, parfüm ve takviye ürünleri satan
> Türkiye merkezli çevrim içi mağaza. Ürünler ${SELLER.brand} kendi
> seçkisi ile LR Health & Beauty ürün hattından oluşuyor.

## Mağaza bilgileri

- Ticari unvan: ${SELLER.legalName}
- Adres: ${SELLER.address}
- Vergi dairesi / numarası: ${SELLER.taxOffice} / ${SELLER.taxNumber}
- MERSİS: ${SELLER.mersis}
- E-posta: ${SELLER.email}
- Telefon: ${SELLER.phone}
- Para birimi: TRY (Türk lirası)
- Teslimat bölgesi: Türkiye

## Alışveriş koşulları

- Kargo ücreti: ${SELLER.shippingFee}
- ${SELLER.freeShippingThreshold} ve üzeri siparişlerde kargo ücretsiz
- Cayma hakkı: teslim tarihinden itibaren ${SELLER.withdrawalDays} gün
- Azami teslim süresi: ${SELLER.deliveryDaysMax} gün
- Ödeme: kredi/banka kartı (PayTR, 3D Secure) veya banka havalesi
- Havale ile ödemede %${SELLER.transferDiscountPercent} indirim

## Koleksiyonlar

${koleksiyonSatirlari}

## Bilgi sayfaları

- [Hakkımızda](${env.siteUrl}/hakkimizda)
- [Sıkça Sorulan Sorular](${env.siteUrl}/sss)
- [İletişim](${env.siteUrl}/iletisim)
- [Teslimat Politikası](${env.siteUrl}/teslimat)
- [İptal ve İade](${env.siteUrl}/iptal-iade)
- [Ön Bilgilendirme Formu](${env.siteUrl}/on-bilgilendirme-formu)
- [Mesafeli Satış Sözleşmesi](${env.siteUrl}/mesafeli-satis-sozlesmesi)
- [KVKK Aydınlatma Metni](${env.siteUrl}/kvkk-aydinlatma-metni)
- [Gizlilik ve Çerez Politikası](${env.siteUrl}/gizlilik)

## Notlar

- Ürün adresleri: ${env.siteUrl}/urun/<slug>
- Tam ürün listesi: ${env.siteUrl}/sitemap.xml
- Sepet, ödeme ve hesap sayfaları kişiye özeldir; taranmaya kapalıdır.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
