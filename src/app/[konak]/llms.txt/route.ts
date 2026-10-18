import { env } from "@/lib/env";
import { getSeller } from "@/lib/seller-source";
import { getStorefrontCollections } from "@/lib/collections";
import { vitrinAdresi } from "@/lib/konak";

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
  const adres = await vitrinAdresi();
  /* Satıcı ve kargo/havale koşulları yasal sayfalarla aynı kaynaktan:
     önceden seller.ts sabitleri okunuyordu (unvan ve tarife dahil). */
  const [collections, SELLER] = await Promise.all([
    getStorefrontCollections(),
    getSeller(),
  ]);

  const koleksiyonSatirlari = collections
    .slice(0, 40)
    .map(
      (collection) =>
        `- [${collection.title}](${adres}/koleksiyon/${collection.slug})`,
    )
    .join("\n");

  const body = `# ${SELLER.brand}

> Giyim, kişisel bakım, kozmetik ve parfüm ürünleri satan
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

- ${SELLER.shippingSentence}
- Cayma hakkı: teslim tarihinden itibaren ${SELLER.withdrawalDays} gün
- Azami teslim süresi: ${SELLER.deliveryDaysMax} gün
${
  SELLER.transferEnabled
    ? `- Ödeme: kredi/banka kartı (3D Secure) veya banka havalesi
- Havale ile ödemede %${SELLER.transferDiscountPercent} indirim`
    : "- Ödeme: kredi/banka kartı (3D Secure)"
}

## Koleksiyonlar

${koleksiyonSatirlari}

## Bilgi sayfaları

- [Hakkımızda](${adres}/hakkimizda)
- [Sıkça Sorulan Sorular](${adres}/sss)
- [İletişim](${adres}/iletisim)
- [Teslimat Politikası](${adres}/teslimat)
- [İptal ve İade](${adres}/iptal-iade)
- [Ön Bilgilendirme Formu](${adres}/on-bilgilendirme-formu)
- [Mesafeli Satış Sözleşmesi](${adres}/mesafeli-satis-sozlesmesi)
- [KVKK Aydınlatma Metni](${adres}/kvkk-aydinlatma-metni)
- [Gizlilik ve Çerez Politikası](${adres}/gizlilik)

## Notlar

- Ürün adresleri: ${adres}/urun/<slug>
- Tam ürün listesi: ${adres}/sitemap.xml
- Sepet, ödeme ve hesap sayfaları kişiye özeldir; taranmaya kapalıdır.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
