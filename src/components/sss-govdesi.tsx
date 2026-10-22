import Link from "next/link";
import { JsonLd } from "@/components/json-ld";
import { sssBloklari } from "@/lib/magaza-sayfasi";
import { sssVarsayilanlari, KARGO_YERI, EPOSTA_YERI } from "@/lib/sss-icerik";
import { shippingTerms } from "@/lib/order-quote";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";
import { dilOneki, type Dil } from "@/lib/dil-onek";
import type { SayfaMetni } from "@/lib/magaza-sayfasi";

/*
  SSS GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Türkçe (`/sss`) ve İngilizce (`/en/sss`) rotaları bu bileşeni
  çağırıyor. İçerik ayrı dosyada (lib/sss-icerik) ve arayüz metinleri
  sözlükte; burada kalan tek şey düzen.

  KİRACININ LİSTESİ VARSA VARSAYILANLARIN YERİNE GEÇİYOR, üstüne
  eklenmiyor: birleştirmek, kiracının "yurt dışına gönderiyoruz"
  yazdığı sayfada bizim varsayılanımızı da göstermek olurdu — aynı
  sayfada iki çelişen yanıt.

  Kargo yanıtı ve e-posta YER TUTUCU: tarife mağaza panelinden,
  adres satıcı kaydından doldurulur. Sabit yazılsaydı tarife
  değişince SSS sepetle çelişirdi.
*/
export function SssGovdesi({
  rules,
  seller,
  sayfa,
  dil,
}: {
  rules: Parameters<typeof shippingTerms>[0];
  seller: { email: string; phone: string; phoneLink: string };
  sayfa: SayfaMetni | null;
  dil: Dil;
}) {
  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);

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
      : sssVarsayilanlari(dil).map((group) => ({
          ...group,
          items: group.items.map(([question, answer]) => {
            const metin =
              answer === KARGO_YERI
                ? shipping
                : answer.replaceAll(EPOSTA_YERI, seller.email);
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
    <main className="shell" lang={dil}>
      <section className="panel about-hero">
        <p className="about-eyebrow">Müşteri desteği</p>
        <h1>{sayfa?.baslik || t("sssVarsayilanBaslik")}</h1>
        <p className="about-lede">{t("sssVarsayilanGiris")}</p>
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
          <h2>{t("cevabiniBulamadiniz")}</h2>
          <p>{t("bizeYazinDonelim")}</p>
        </div>
        <div className="faq-cta-actions">
          {seller.phoneLink ? (
            <a className="btn" href={seller.phoneLink} rel="noopener">
              {t("whatsapptanYaz")}
            </a>
          ) : (
            <a className="btn" href={`mailto:${seller.email}`}>
              {t("epostaGonder")}
            </a>
          )}
          <Link href={`${onek}/iletisim`}>{t("tumIletisimKanallari")}</Link>
        </div>
      </section>

      <JsonLd data={schema} />
    </main>
  );

}
