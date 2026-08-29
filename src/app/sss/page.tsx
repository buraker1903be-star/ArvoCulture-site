import { InfoPage } from "@/components/info-page";
const questions = [
  [
    "Siparişim ne zaman hazırlanır?",
    "Ödeme onayından sonra siparişiniz hazırlanır ve kargoya teslim edildiğinde bilgilendirme yapılır.",
  ],
  [
    "Ürünleri iade edebilir miyim?",
    "Kullanılmamış, yeniden satılabilir durumdaki ürünler yasal cayma hakkı koşullarına göre iade edilebilir. Hijyen kapsamındaki istisnalar ürün niteliğine göre uygulanır.",
  ],
  [
    "Ürünler orijinal mi?",
    "Seçkideki ürünler doğrulanmış tedarik kanalları ve ArvoCulture ürün kayıtları üzerinden satışa sunulur.",
  ],
  [
    "Kargo ücretsiz mi?",
    "2.000 TL ve üzerindeki siparişlerde standart kargo ücretsizdir.",
  ],
  [
    "Nasıl destek alabilirim?",
    "info@arvoculture.com adresine sipariş numaranızla birlikte yazabilirsiniz.",
  ],
];
export default function FAQ() {
  return (
    <InfoPage
      eyebrow="MÜŞTERİ DESTEĞİ"
      title="Sıkça sorulan sorular."
      intro="Alışveriş deneyiminizle ilgili en çok merak edilen konular."
    >
      <div className="faq-list">
        {questions.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
