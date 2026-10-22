import { SssGovdesi } from "@/components/sss-govdesi";
import type { Metadata } from "next";
import { getSalesRules } from "@/lib/store-settings";
import { getSeller } from "@/lib/seller-source";
import { magazaSayfasi } from "@/lib/magaza-sayfasi-oku";
import { konagiAyarla } from "@/lib/konak";

/**
 * SSS sayfası.
 *
 * Sorular konuya göre gruplanır; tek uzun liste, aradığını
 * bulmayı zorlaştırıyordu. Ayrıca sayfaya FAQPage şeması
 * ekleniyor: Google sonuçlarında açılır soru olarak görünmesini
 * ve yapay zekâ arama motorlarının yanıtları doğru alıntılamasını
 * sağlar.
 *
 * SORULAR KİRACININ OLABİLİR. Mağaza panelinden kendi soru-cevap
 * listesini yazan kiracının listesi, aşağıdaki varsayılanların
 * YERİNE geçiyor — üstüne eklenmiyor. Birleştirmek, kiracının
 * "yurt dışına gönderim yapıyoruz" yazdığı bir sayfada bizim
 * "yalnızca Türkiye içine gönderiyoruz" varsayılanımızı da
 * gösterirdi: aynı sayfada iki çelişen yanıt.
 *
 * Varsayılan liste bilerek duruyor: sorular her mağaza için
 * geçerli ve kargo yanıtı zaten mağaza ayarlarından üretiliyor.
 */


export async function generateMetadata({
  params,
}: {
  params: Promise<{ konak: string }>;
}): Promise<Metadata> {
  /* Adres yoldan geliyor; üstveri düzenle aynı anda
     çalışabildiği için burada da bırakılıyor (lib/konak). */
  konagiAyarla((await params).konak);

  const sayfa = await magazaSayfasi("sss");
  return {
    title: sayfa?.baslik || "Sıkça Sorulan Sorular",
    description:
      "Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok sorulan soruların yanıtları.",
    alternates: { canonical: "/sss" },
  };
}

export default async function FAQ({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const [rules, seller, sayfa] = await Promise.all([
    getSalesRules(),
    getSeller(),
    magazaSayfasi("sss"),
  ]);

  return <SssGovdesi rules={rules} seller={seller} sayfa={sayfa} dil="tr" />;
}
