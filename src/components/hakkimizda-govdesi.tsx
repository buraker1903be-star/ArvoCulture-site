import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { paragraflar } from "@/lib/magaza-sayfasi";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";
import { dilOneki, type Dil } from "@/lib/dil-onek";
import type { SayfaMetni } from "@/lib/magaza-sayfasi";
import type { Product } from "@/lib/product-types";

/*
  HAKKIMIZDA GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Türkçe (`/hakkimizda`) ve İngilizce (`/en/hakkimizda`) rotaları bu
  bileşeni çağırıyor. Kopyalanmadı: iki kopya kaçınılmaz olarak
  ayrışır ve bu sayfada ayrışan şey MAĞAZANIN SÖZÜ olurdu — iki dilde
  iki farklı iade süresi vaat etmek.

  KİRACI METNİ DİLE GÖRE GELİYOR ve Türkçeye DÜŞMÜYOR: İngilizcesi
  yazılmamışsa sayfa kendi yansız İngilizce varsayılanını çiziyor
  (lib/magaza-sayfasi-oku). İngilizce bir sayfada Türkçe bir
  paragraf, okuyamayan ziyaretçiye hiçbir şey anlatmıyor.

  Kiracı kendi metnini yazdıysa BİZİM sesimiz çekiliyor: "nasıl
  çalışıyoruz" ve "mağaza sözü" blokları çizilmiyor. Kiracının
  ağzından bizim verdiğimiz sözler durmasın.
*/
const PILLARS = [
  { title: "ilkeSeckiBaslik", body: "ilkeSeckiGovde" },
  { title: "ilkeSeffaflikBaslik", body: "ilkeSeffaflikGovde" },
  { title: "ilkeOzenBaslik", body: "ilkeOzenGovde" },
] as const;

const PROMISES = [
  { label: "sozOrijinal", note: "sozOrijinalNot" },
  { label: "sozOdeme", note: "sozOdemeNot" },
  { label: "sozIade", note: "sozIadeNot" },
  { label: "sozPaketleme", note: "sozPaketlemeNot" },
] as const;

export function HakkimizdaGovdesi({
  sayfa,
  products,
  collections,
  categoryCount,
  featured,
  dil,
}: {
  sayfa: SayfaMetni | null;
  products: Product[];
  collections: unknown[];
  categoryCount: number;
  featured: Product[];
  dil: Dil;
}) {
  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);
  const kiraciMetni = sayfa ? paragraflar(sayfa.govde) : [];

  return (
    <main className="shell" lang={dil}>
      {/* Giriş: manifesto tonunda. Metin kiracınınsa onun cümleleri. */}
      <section className="panel about-hero">
        <p className="about-eyebrow">{t("hakkimizdaEyebrow")}</p>
        <h1>{sayfa?.baslik || t("hakkimizdaBaslik")}</h1>
        {kiraciMetni.length > 0 ? (
          kiraciMetni.map((paragraf, sira) => (
            <p key={sira} className={sira === 0 ? "about-lede" : undefined}>
              {paragraf}
            </p>
          ))
        ) : (
<p className="about-lede">{t("hakkimizdaGiris")}</p>
        )}
        <div className="about-actions">
          <Link className="btn" href={`${onek}/koleksiyon/tumu`}>
            {t("seckiyiKesfet")}
          </Link>
          <Link href={`${onek}/iletisim`}>{t("bizeUlasinBag")}</Link>
        </div>
      </section>

      {/*
        Ölçek: soyut iddiaları somut sayılarla destekler. Rakamların
        hepsi mağazanın KENDİ verisinden; önceden dördüncü kutu
        "2026 — Kuruluş" yazıyordu ve bu ArvoCulture'a özel bir
        bilgiydi, başka kiracının sayfasında yanlış olurdu.
      */}
      <section className="panel panel-tight about-figures">
        <div>
          <strong>{products.length}+</strong>
          <small>{t("secilmisUrun")}</small>
        </div>
        <div>
          <strong>{collections.length}</strong>
          <small>{t("koleksiyonSayisi")}</small>
        </div>
        <div>
          <strong>{categoryCount}</strong>
          <small>{t("kategoriSayisi")}</small>
        </div>
      </section>

      {/*
        Bizim sesimiz: yalnızca kiracı kendi metnini yazmadıysa.
        Kendi anlatısı olan mağazanın sayfasında, onun ağzından
        bizim verdiğimiz sözler durmasın.
      */}
      {kiraciMetni.length === 0 && (
        <>
          <section className="panel about-pillars">
            <div className="head">
              <div>
                <h2>{t("nasilCalisiyoruz")}</h2>
                <p>{t("ucIlke")}</p>
              </div>
            </div>
            <div className="pillar-grid">
              {PILLARS.map((pillar, index) => (
                <article key={pillar.title}>
                  <span className="pillar-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{t(pillar.title)}</h3>
                  <p>{t(pillar.body)}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Söz: koyu panel, sayfanın görsel duraklaması. */}
          <section className="panel about-promise">
            <div className="about-promise-body">
              <p className="about-eyebrow">{t("magazaSozu")}</p>
              <h2>{t("magazaSozuBaslik")}</h2>
<p>{t("magazaSozuGovde")}</p>
            </div>
            <ul className="promise-list">
              {PROMISES.map((item) => (
                <li key={item.label}>
                  <strong>{t(item.label)}</strong>
                  <small>{t(item.note)}</small>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Sayfa metinle değil, ürünle biter. */}
      {featured.length > 0 && (
        <section className="panel">
          <div className="head">
            <div>
              <h2>{t("seckiden")}</h2>
              <p>{t("bugunOneCikan")}</p>
            </div>
            <Link href={`${onek}/koleksiyon/tumu`}>{t("tumUrunler")}</Link>
          </div>
          <div className="grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} onek={onek} />
            ))}
          </div>
        </section>
      )}
    </main>
  );

}
