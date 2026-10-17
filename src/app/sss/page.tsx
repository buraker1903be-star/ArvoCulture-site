import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { getSalesRules } from "@/lib/store-settings";
import { getSeller } from "@/lib/seller-source";
import { shippingTerms } from "@/lib/order-quote";
import { magazaSayfasi } from "@/lib/magaza-sayfasi-oku";
import { sssBloklari } from "@/lib/magaza-sayfasi";

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

/* Kargo yanıtı sabit değil: tarife ArvoARC'ta mağaza panelinden değişiyor.
   Önceden "120 TL / 2.000 TL" yazılıydı; tarife değişince SSS ve arama
   motoru şeması sepetle çelişecekti. */
const SHIPPING_ANSWER = "__kargo__";
/* İletişim adresi de sabit değil: satıcı kaydından geliyor. Önceden
   "info@arvoculture.com" üç yanıtta yazılıydı ve ikinci bir kiracının
   SSS sayfası müşterisini BİZİM posta adresimize yönlendirirdi. */
const EPOSTA = "__eposta__";

const GROUPS = [
  {
    title: "Sipariş ve kargo",
    items: [
      [
        "Siparişim ne zaman hazırlanır?",
        "Ödemeniz onaylandıktan sonra siparişiniz hazırlanır. Kargoya teslim edildiğinde e-posta ile bilgilendirilirsiniz.",
      ],
      [
        "Kargo ücreti ne kadar?",
        // Mağaza panelindeki tarifeyle doldurulur (FAQ içinde).
        SHIPPING_ANSWER,
      ],
      [
        "Siparişimi nasıl takip ederim?",
        "Kargoya verildiğinde takip numaranız e-posta ile gönderilir. Dilerseniz sipariş numaranızla WhatsApp hattımızdan da sorabilirsiniz.",
      ],
      [
        "Yurt dışına gönderim yapıyor musunuz?",
        "Şu anda yalnızca Türkiye içine gönderim yapıyoruz.",
      ],
    ],
  },
  {
    title: "İade ve değişim",
    items: [
      [
        "Ürünleri iade edebilir miyim?",
        "Kullanılmamış ve yeniden satılabilir durumdaki ürünler, teslimattan itibaren 14 gün içinde cayma hakkı kapsamında iade edilebilir.",
      ],
      [
        "Hangi ürünler iade edilemez?",
        "Ambalajı açılmış kozmetik ve kişisel bakım ürünleri hijyen gerekçesiyle iade kapsamı dışındadır. Bu istisna ürün niteliğine göre uygulanır.",
      ],
      [
        "İade süreci nasıl işliyor?",
        `${EPOSTA} adresine sipariş numaranızla yazmanız yeterli. Yönlendirme ve kargo bilgisi tarafımızdan iletilir.`,
      ],
      [
        "Bedeni değiştirebilir miyim?",
        "Giyim ürünlerinde beden değişimi mümkündür. Ürünün etiketli ve kullanılmamış olması gerekir.",
      ],
    ],
  },
  {
    title: "Ödeme",
    items: [
      [
        "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
        "Visa, Mastercard, Troy, Maestro ve American Express kartlarıyla ödeme yapabilirsiniz. Ödemeler 3D Secure korumalı ödeme altyapısı üzerinden alınır.",
      ],
      [
        "Kart bilgilerim güvende mi?",
        "Ödeme sayfası lisanslı ödeme kuruluşumuz tarafından sunulur ve 3D Secure ile korunur. Kart bilgileriniz mağazamıza hiçbir aşamada iletilmez ve sunucularımızda saklanmaz.",
      ],
      [
        "İndirim kodunu nerede kullanabilirim?",
        "Kodu sepet ya da ödeme adımında ilgili alana girmeniz yeterli. İndirim toplam tutara anında yansır.",
      ],
      [
        "Fatura nasıl gönderiliyor?",
        "Faturanız siparişinizle birlikte hazırlanır ve e-posta adresinize iletilir.",
      ],
    ],
  },
  {
    title: "Ürünler",
    items: [
      [
        "Ürünler orijinal mi?",
        /* "LR Health & Beauty bağımsız iş ortağıdır" cümlesi
           kaldırıldı: ArvoCulture'a özel bir ticari ilişki ve başka
           bir mağazanın SSS sayfasında doğru değil. ArvoCulture bu
           bilgiyi kendi SSS metnine yazıyor. */
        "Seçkideki tüm ürünler yetkili tedarik kanallarından temin edilir.",
      ],
      [
        "Ürün stokta yoksa ne yapabilirim?",
        `Stoğa girdiğinde haber almak için ${EPOSTA} adresine ürün adıyla yazabilirsiniz.`,
      ],
      [
        "Hangi ürünün bana uygun olduğunu nasıl anlarım?",
        "Kategori sayfalarımızda ihtiyaca göre filtrelenmiş koleksiyonlar bulunur. Emin olamazsanız bize yazabilirsiniz.",
      ],
    ],
  },
];

const VARSAYILAN_BASLIK = "Sıkça sorulan sorular.";
const VARSAYILAN_GIRIS =
  "Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok merak edilenler. Aradığınızı bulamazsanız bize yazın.";

export async function generateMetadata(): Promise<Metadata> {
  const sayfa = await magazaSayfasi("sss");
  return {
    title: sayfa?.baslik || "Sıkça Sorulan Sorular",
    description:
      "Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok sorulan soruların yanıtları.",
    alternates: { canonical: "/sss" },
  };
}

export default async function FAQ() {
  const [rules, seller, sayfa] = await Promise.all([
    getSalesRules(),
    getSeller(),
    magazaSayfasi("sss"),
  ]);

  const shipping = shippingTerms(rules).sentence;
  const kiraci = sayfa ? sssBloklari(sayfa.govde) : [];

  /*
    Kiracı kendi listesini yazdıysa tek grup olarak çiziliyor:
    gruplandırma bizim editoryal kararımız ve kiracıdan konu başlığı
    istemek, düz metin kutusunu biçim diline çevirmek olurdu.
  */
  const groups =
    kiraci.length > 0
      ? [{ title: "", items: kiraci.map((b) => [b.soru, b.cevap] as const) }]
      : GROUPS.map((group) => ({
          ...group,
          items: group.items.map(([question, answer]) => {
            const metin =
              answer === SHIPPING_ANSWER
                ? shipping
                : answer.replaceAll(EPOSTA, seller.email);
            return [question, metin] as const;
          }),
        }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: groups.flatMap((group) =>
      group.items.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    ),
  };

  return (
    <main className="shell">
      <section className="panel about-hero">
        <p className="about-eyebrow">Müşteri desteği</p>
        <h1>{sayfa?.baslik || VARSAYILAN_BASLIK}</h1>
        <p className="about-lede">{VARSAYILAN_GIRIS}</p>
      </section>

      {groups.map((group) => (
        <section key={group.title || "sorular"} className="panel">
          {group.title && (
            <div className="head">
              <h2>{group.title}</h2>
            </div>
          )}
          <div className="faq-list">
            {group.items.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  <span>{question}</span>
                  <i aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      {/* Yardım kanalı: numara satıcı kaydından. Önceden ArvoCulture'ın
          WhatsApp bağlantısı koda yazılıydı. */}
      <section className="panel panel-soft faq-cta">
        <div>
          <h2>Cevabını bulamadınız mı?</h2>
          <p>Bize yazın, en kısa sürede dönüş yapalım.</p>
        </div>
        <div className="faq-cta-actions">
          {seller.phoneLink ? (
            <a className="btn" href={seller.phoneLink} rel="noopener">
              WhatsApp’tan yaz
            </a>
          ) : (
            <a className="btn" href={`mailto:${seller.email}`}>
              E-posta gönder
            </a>
          )}
          <Link href="/iletisim">Tüm iletişim kanalları</Link>
        </div>
      </section>

      <JsonLd data={schema} />
    </main>
  );
}
