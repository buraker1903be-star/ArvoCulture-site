import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/json-ld";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description:
    "Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok sorulan soruların yanıtları.",
  alternates: { canonical: "/sss" },
};

/**
 * SSS sayfası.
 *
 * Sorular konuya göre gruplanır; tek uzun liste, aradığını
 * bulmayı zorlaştırıyordu. Ayrıca sayfaya FAQPage şeması
 * ekleniyor: Google sonuçlarında açılır soru olarak görünmesini
 * ve yapay zekâ arama motorlarının yanıtları doğru alıntılamasını
 * sağlar.
 */

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
        "Kargo ücreti 120 TL'dir. 2.000 TL ve üzerindeki siparişlerde kargo ücretsizdir.",
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
        "Ambalajı açılmış kozmetik, kişisel bakım ve takviye ürünleri hijyen gerekçesiyle iade kapsamı dışındadır. Bu istisna ürün niteliğine göre uygulanır.",
      ],
      [
        "İade süreci nasıl işliyor?",
        "info@arvoculture.com adresine sipariş numaranızla yazmanız yeterli. Yönlendirme ve kargo bilgisi tarafımızdan iletilir.",
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
        "Visa, Mastercard, Troy, Maestro ve American Express kartlarıyla ödeme yapabilirsiniz. Ödemeler PayTR altyapısı üzerinden alınır.",
      ],
      [
        "Kart bilgilerim güvende mi?",
        "Ödeme sayfası PayTR tarafından sunulur ve 3D Secure ile korunur. Kart bilgileriniz mağazamıza hiçbir aşamada iletilmez ve sunucularımızda saklanmaz.",
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
        "Seçkideki tüm ürünler yetkili tedarik kanallarından temin edilir. ArvoCulture, LR Health & Beauty bağımsız iş ortağıdır.",
      ],
      [
        "Ürün stokta yoksa ne yapabilirim?",
        "Stoğa girdiğinde haber almak için info@arvoculture.com adresine ürün adıyla yazabilirsiniz.",
      ],
      [
        "Hangi ürünün bana uygun olduğunu nasıl anlarım?",
        "Kategori sayfalarımızda ihtiyaca göre (kuru cilt, akne, yaşlanma karşıtı gibi) filtrelenmiş koleksiyonlar bulunur. Emin olamazsanız WhatsApp hattımızdan sorabilirsiniz.",
      ],
    ],
  },
];

export default function FAQ() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: GROUPS.flatMap((group) =>
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
        <h1>Sıkça sorulan sorular.</h1>
        <p className="about-lede">
          Sipariş, kargo, iade, ödeme ve ürünlerle ilgili en çok merak
          edilenler. Aradığınızı bulamazsanız bize yazın.
        </p>
      </section>

      {GROUPS.map((group) => (
        <section key={group.title} className="panel">
          <div className="head">
            <h2>{group.title}</h2>
          </div>
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

      <section className="panel panel-soft faq-cta">
        <div>
          <h2>Cevabını bulamadınız mı?</h2>
          <p>WhatsApp hattımızdan yazın, aynı gün dönüş yapalım.</p>
        </div>
        <div className="faq-cta-actions">
          <a className="btn" href="https://wa.me/905074370507" rel="noopener">
            WhatsApp&apos;tan yaz
          </a>
          <Link href="/iletisim">Tüm iletişim kanalları</Link>
        </div>
      </section>

      <JsonLd data={schema} />
    </main>
  );
}
