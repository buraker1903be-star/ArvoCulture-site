import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "İletişim",
  description:
    "ArvoCulture müşteri desteği, satıcı bilgileri ve sıkça sorulan sorulara hızlı erişim.",
  alternates: { canonical: "/iletisim" },
};

/**
 * İletişim sayfası.
 *
 * İki iş yapar: müşteriyi doğru kanala yönlendirir ve mesafeli
 * satış mevzuatının aradığı satıcı bilgilerini erişilebilir kılar.
 * Footer'dan ticaret unvanı kaldırıldığı için o bilgi burada
 * bulunmak zorunda.
 */

/* TODO: Telefon ve WhatsApp numarası doğrulanmalı; yoksa ilgili
   kart kaldırılmalı. Erişilemeyen bir numara güveni düşürür. */
const CHANNELS = [
  {
    title: "E-posta",
    value: "info@arvoculture.com",
    href: "mailto:info@arvoculture.com",
    note: "Sipariş, ürün ve iade soruları",
    action: "E-posta gönder",
  },
  {
    title: "Sipariş takibi",
    value: "Sipariş numaranızla",
    href: "mailto:info@arvoculture.com?subject=Sipari%C5%9F%20takibi",
    note: "Sipariş numaranızı yazmanız yeterli",
    action: "Takip talebi oluştur",
  },
];

const QUICK = [
  {
    title: "Kargom ne zaman çıkar?",
    note: "Hazırlık ve teslimat süreleri",
    href: "/teslimat",
  },
  {
    title: "Nasıl iade ederim?",
    note: "14 gün içinde koşulsuz iade",
    href: "/iptal-iade",
  },
  {
    title: "Sıkça sorulan sorular",
    note: "En çok merak edilenler",
    href: "/sss",
  },
  {
    title: "Mesafeli satış sözleşmesi",
    note: "Satış koşulları",
    href: "/mesafeli-satis-sozlesmesi",
  },
];

export default function Contact() {
  return (
    <main className="shell">
      <section className="panel about-hero">
        <p className="about-eyebrow">Bize ulaşın</p>
        <h1>Nasıl yardımcı olabiliriz?</h1>
        <p className="about-lede">
          Ürün, sipariş, teslimat ve iade sorularınız için buradayız.
          Mesajınıza sipariş numaranızı eklerseniz çok daha hızlı dönüş
          yaparız.
        </p>
      </section>

      <section className="panel">
        <div className="head">
          <div>
            <h2>İletişim kanalları</h2>
            <p>Talepler iş günlerinde sırayla değerlendirilir.</p>
          </div>
        </div>
        <div className="channel-grid">
          {CHANNELS.map((channel) => (
            <article key={channel.title}>
              <p className="about-eyebrow">{channel.title}</p>
              <strong>{channel.value}</strong>
              <small>{channel.note}</small>
              <a className="btn btn-ghost" href={channel.href}>
                {channel.action}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="head">
          <div>
            <h2>Belki cevabı burada</h2>
            <p>En sık sorulanların yanıtı hazır bekliyor.</p>
          </div>
        </div>
        <div className="quick-grid">
          {QUICK.map((item) => (
            <Link key={item.href} href={item.href}>
              <strong>{item.title}</strong>
              <small>{item.note}</small>
            </Link>
          ))}
        </div>
      </section>

      {/*
        Satıcı bilgileri. Mesafeli Sözleşmeler Yönetmeliği satıcının
        tam unvanı, adresi ve iletişim bilgilerinin tüketici
        tarafından kolayca erişilebilir olmasını arar.
      */}
      <section className="panel panel-soft seller-info">
        <div className="head">
          <div>
            <h2>Satıcı bilgileri</h2>
            <p>Mesafeli satış mevzuatı kapsamında yayımlanmaktadır.</p>
          </div>
        </div>
        <dl>
          <div>
            <dt>Ticaret unvanı</dt>
            <dd>
              ArvoCulture Group Teknoloji Sanayi ve Ticaret Limited Şirketi
            </dd>
          </div>
          <div>
            <dt>Adres</dt>
            <dd>
              Yakuplu Mah. Hürriyet Bulvarı, Skyport Residence No:1 D:113,
              34524 Beylikdüzü / İstanbul
            </dd>
          </div>
          <div>
            <dt>E-posta</dt>
            <dd>
              <a href="mailto:info@arvoculture.com">info@arvoculture.com</a>
            </dd>
          </div>
          {/* TODO: MERSİS, vergi dairesi ve vergi numarası eklenmeli. */}
          <div>
            <dt>MERSİS</dt>
            <dd>—</dd>
          </div>
          <div>
            <dt>Vergi dairesi / numarası</dt>
            <dd>—</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
