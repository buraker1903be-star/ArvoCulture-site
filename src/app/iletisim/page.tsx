import type { Metadata } from "next";
import Link from "next/link";
import { getSeller } from "@/lib/seller-source";
import { magazaSayfasi } from "@/lib/magaza-sayfasi-oku";
import { paragraflar } from "@/lib/magaza-sayfasi";

/**
 * İletişim sayfası.
 *
 * İki iş yapar: müşteriyi doğru kanala yönlendirir ve mesafeli
 * satış mevzuatının aradığı satıcı bilgilerini erişilebilir kılar.
 * Footer’dan ticaret unvanı kaldırıldığı için o bilgi burada
 * bulunmak zorunda.
 *
 * BİLGİLER SATICI KAYDINDAN. Önceden ticaret unvanı, adres, e-posta
 * ve WhatsApp numarası bu dosyada yazılıydı; ikinci bir kiracının
 * iletişim sayfası ARVOCULTURE'IN şirketini ve hattını gösterirdi.
 * Mevzuat açısından ciddi: müşteri satıcının kim olduğunu buradan
 * öğreniyor.
 *
 * Giriş metni panelden yazılabiliyor (ArvoARC → Ayarlar →
 * Sayfalar); kanallar ve satıcı bilgileri yazılamıyor, çünkü onlar
 * metin değil KAYIT — serbest metne çevirmek, iletişim kanalını
 * yazım hatasıyla bozulabilir hâle getirirdi.
 */

const VARSAYILAN_BASLIK = "Nasıl yardımcı olabiliriz?";

export async function generateMetadata(): Promise<Metadata> {
  const [sayfa, seller] = await Promise.all([
    magazaSayfasi("iletisim"),
    getSeller(),
  ]);
  const girisi = sayfa ? paragraflar(sayfa.govde)[0] : undefined;

  return {
    title: sayfa?.baslik || "İletişim",
    description:
      girisi?.slice(0, 300) ??
      `${seller.brand} müşteri desteği, satıcı bilgileri ve sıkça sorulan sorulara hızlı erişim.`,
    alternates: { canonical: "/iletisim" },
  };
}

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

export default async function Contact() {
  const [seller, sayfa] = await Promise.all([
    getSeller(),
    magazaSayfasi("iletisim"),
  ]);

  const kiraciMetni = sayfa ? paragraflar(sayfa.govde) : [];
  const takipKonusu = encodeURIComponent("Sipariş takibi");

  /*
    Kanal listesi kayıttan kuruluyor. WhatsApp hattı olmayan mağazada
    o kutu HİÇ çizilmiyor: çalışmayan bir "WhatsApp'tan yaz" düğmesi,
    müşteriyi boş bir sayfaya göndermek olurdu.
  */
  const channels = [
    seller.phoneLink
      ? {
          title: "WhatsApp",
          value: seller.phone,
          href: seller.phoneLink,
          note: "Kurumsal hat — en hızlı yanıt",
          action: "WhatsApp’tan yaz",
        }
      : null,
    {
      title: "E-posta",
      value: seller.email,
      href: `mailto:${seller.email}`,
      note: "Sipariş, ürün ve iade soruları",
      action: "E-posta gönder",
    },
    {
      title: "Sipariş takibi",
      value: "Sipariş numaranızla",
      href: `mailto:${seller.email}?subject=${takipKonusu}`,
      note: "Sipariş numaranızı yazmanız yeterli",
      action: "Takip talebi oluştur",
    },
  ].filter((kanal): kanal is NonNullable<typeof kanal> => kanal !== null);

  return (
    <main className="shell">
      <section className="panel about-hero">
        <p className="about-eyebrow">Bize ulaşın</p>
        <h1>{sayfa?.baslik || VARSAYILAN_BASLIK}</h1>
        {kiraciMetni.length > 0 ? (
          kiraciMetni.map((paragraf, sira) => (
            <p key={sira} className={sira === 0 ? "about-lede" : undefined}>
              {paragraf}
            </p>
          ))
        ) : (
          <p className="about-lede">
            Ürün, sipariş, teslimat ve iade sorularınız için buradayız.
            Mesajınıza sipariş numaranızı eklerseniz çok daha hızlı dönüş
            yaparız.
          </p>
        )}
      </section>

      <section className="panel">
        <div className="head">
          <div>
            <h2>İletişim kanalları</h2>
            <p>Talepler iş günlerinde sırayla değerlendirilir.</p>
          </div>
        </div>
        <div className="channel-grid">
          {channels.map((channel) => (
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
        Satıcı bilgileri. Ödeme kuruluşlarının üye iş yeri kuralları
        adresin iletişim sayfasında yayımlanmasını istiyor. Vergi, MERSİS
        ve ticaret sicil bilgileri burada değil; mesafeli satış
        sözleşmesinde yer alıyor.
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
            <dd>{seller.legalName}</dd>
          </div>
          <div>
            <dt>Adres</dt>
            <dd>{seller.address}</dd>
          </div>
          <div>
            <dt>E-posta</dt>
            <dd>
              <a href={`mailto:${seller.email}`}>{seller.email}</a>
            </dd>
          </div>
          {seller.phoneLink && (
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={seller.phoneLink} rel="noopener">
                  {seller.phone}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </main>
  );
}
