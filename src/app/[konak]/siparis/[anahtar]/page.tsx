import { konagiAyarla } from "@/lib/konak";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArcError } from "@/lib/arc";
import { getSiparisDurumu } from "@/lib/siparis-durumu-oku";
import {
  durumAnahtari,
  indirimTutari,
  liraYazisi,
  odemeAnahtari,
} from "@/lib/siparis-durumu";
import { Metin, Tarih } from "@/components/para-birimi";

export const metadata = {
  title: "Sipariş durumu",
  /* Bağlantı kişiye özel; arama motoruna girmemeli. */
  robots: { index: false, follow: false },
};

/*
  Sipariş durumu ANINDA doğru olmalı: "kargoya verildi" mesajını alıp
  bağlantıya basan müşteriye saklanmış bir sayfa göstermek bildirimin
  kendisini yalanlar. force-dynamic, içerideki `onbelleksiz` okumayla
  da çelişmiyor (ürün sayfasında bu ikisi çakışıp 500 üretmişti:
  rota `revalidate` ile saklanırken fetch `no-store` diyordu).
*/
export const dynamic = "force-dynamic";

export default async function SiparisDurumSayfasi({
  params,
}: {
  params: Promise<{ anahtar: string; konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  konagiAyarla((await params).konak);

  const { anahtar } = await params;

  let siparis;
  try {
    siparis = await getSiparisDurumu(anahtar);
  } catch (hata) {
    /*
      "Sipariş yok" ile "okuyamadım" AYNI ŞEY DEĞİL. İkisini de 404
      göstermek, veritabanı düştüğünde müşteriye "siparişiniz
      bulunamadı" dedirtir — destek çağrısı üretir ve yanlıştır.
    */
    if (hata instanceof ArcError) console.error(hata);
    throw hata;
  }

  if (!siparis) notFound();

  /* Durum ve ödeme metni sözlükten (İngilizce vitrinde tarayıcıda
     çevriliyor); tanınmayan kod boş geçiliyor. */
  const durum = durumAnahtari(siparis.durum);
  const odeme = odemeAnahtari(siparis.odeme_durumu);
  const gonderiler = siparis.gonderiler.filter((g) => g.takip_no || g.firma);

  const indirim = indirimTutari(siparis);

  return (
    <main className="shell">
      <section className="panel order-status">
        <p className="about-eyebrow"><Metin anahtar="siparisDurumu" /></p>
        <h1><Metin anahtar={durum ?? "siparisiniz"} /></h1>

        <p className="order-number">
          <small><Metin anahtar="siparisNumarasi" /></small>
          <b>{siparis.siparis_no}</b>
        </p>

        <dl className="order-status-meta">
          <div>
            <dt><Metin anahtar="siparisTarihi" /></dt>
            <dd><Tarih iso={siparis.tarih} /></dd>
          </div>
          {odeme && (
            <div>
              <dt><Metin anahtar="odeme" /></dt>
              <dd><Metin anahtar={odeme} /></dd>
            </div>
          )}
          {siparis.musteri && (
            <div>
              <dt><Metin anahtar="alici" /></dt>
              <dd>{siparis.musteri}</dd>
            </div>
          )}
        </dl>

        {gonderiler.length > 0 && (
          <div className="order-status-kargo">
            <h2><Metin anahtar="kargo" /></h2>
            {gonderiler.map((g, i) => (
              <p key={`${g.takip_no ?? "gonderi"}-${i}`}>
                {g.firma && <strong>{g.firma}</strong>}
                {g.takip_no && (
                  <>
                    {" · "}
                    {g.takip_adresi ? (
                      /* Dış bağlantı; kargo firmasının sitesi bizim denetimimizde değil. */
                      <a href={g.takip_adresi} target="_blank" rel="noopener noreferrer nofollow">
                        {g.takip_no}
                      </a>
                    ) : (
                      g.takip_no
                    )}
                  </>
                )}
                {g.teslim && <> · <Metin anahtar="teslimEdildiTarih" />: <Tarih iso={g.teslim} /></>}
              </p>
            ))}
          </div>
        )}

        <h2><Metin anahtar="siparisiniz" /></h2>
        <ul className="order-status-kalemler">
          {siparis.kalemler.map((k, i) => (
            <li key={`${k.sku ?? k.ad}-${i}`}>
              <span className="ad">
                {k.ad}
                {k.adet > 1 && <small> × {k.adet}</small>}
              </span>
              <span className="tutar">{liraYazisi(k.tutar)}</span>
            </li>
          ))}
        </ul>

        <dl className="order-status-toplam">
          {/* Tutarlar LİRA, İngilizce vitrinde de: tahsilat lira
              üzerinden yapıldı ve siparişin gerçek tutarı bu. Dolara
              çevirmek, o günkü kurla ödenenden farklı bir sayı yazmak
              olurdu. Ödeme adımı da bunu söylüyor (tahsilatLira). */}
          <div>
            <dt><Metin anahtar="araToplam" /></dt>
            <dd>{liraYazisi(siparis.ara_toplam)}</dd>
          </div>
          <div>
            <dt><Metin anahtar="kargo" /></dt>
            <dd>{siparis.kargo > 0 ? liraYazisi(siparis.kargo) : <Metin anahtar="ucretsiz" />}</dd>
          </div>
          {indirim > 0 && (
            <div>
              <dt><Metin anahtar="indirim" /></dt>
              <dd>−{liraYazisi(indirim)}</dd>
            </div>
          )}
          <div className="buyuk">
            <dt><Metin anahtar="toplam" /></dt>
            <dd>{liraYazisi(siparis.toplam)}</dd>
          </div>
          {/*
            KDV TOPLAMA EKLENMİYOR, bilgi olarak yazılıyor: ArvoARC'ta
            `tax` fiyatın içinden çıkarılan vergi (arc_extract_vat),
            üzerine eklenen bir kalem değil. Toplamın ALTINDA ve soluk
            duruyor ki satırlar toplanırken sayılmasın.
          */}
          {siparis.vergi > 0 && (
            <div className="dahil">
              <dt><Metin anahtar="kdvDahil" /></dt>
              <dd>{liraYazisi(siparis.vergi)}</dd>
            </div>
          )}
        </dl>

        <p className="order-status-not">
          <Metin anahtar="takipSayfaNotu" />{" "}
          <Link href="/iletisim"><Metin anahtar="bizeUlasinKucuk" /></Link>.
        </p>
      </section>
    </main>
  );
}
