import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontProducts } from "@/lib/products";
import { getStorefrontCollections } from "@/lib/collections";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { magazaSayfasi } from "@/lib/magaza-sayfasi-oku";
import { paragraflar } from "@/lib/magaza-sayfasi";
import { ProductCard } from "@/components/product-card";

/**
 * Hakkımızda sayfası.
 *
 * Kurumsal metin yığını yerine mağaza diliyle kurulmuştur: her
 * bölüm bir panel, sonunda gerçek ürünlerle biten bir vitrin.
 * Ziyaretçinin sayfayı okuyup çıkmasını değil, okuyup alışverişe
 * dönmesini hedefler.
 *
 * METİN KİRACININ OLABİLİR. Sayfanın başlığı ve giriş metni mağaza
 * panelinden yazılabiliyor (ArvoARC → Ayarlar → Sayfalar). Önceden
 * hepsi kodda sabitti ve ArvoCulture'ın kendi anlatısıydı —
 * "Giyim, kişisel bakım ve koku dünyasını…". İkinci bir kiracı bu
 * sayfayla yayına GİREMEZDİ: müşterisine başka bir markanın
 * hikâyesini gösterirdi.
 *
 * KİRACI YAZDIYSA BİZİM SESİMİZ ÇEKİLİYOR. Aşağıdaki "Nasıl
 * çalışıyoruz" ve "sözü" bölümleri yalnızca kendi metni OLMAYAN
 * mağazada çiziliyor. Sebebi basit: o cümleler bir söz veriyor
 * ("kataloğa ürün eklemiyoruz, seçki kuruyoruz") ve kiracının
 * ağzından böyle bir söz vermek bize düşmez. Kendi metnini yazan
 * mağazanın sayfasında yalnızca kendi cümleleri ve kendi
 * verisinden çıkan rakamlar kalıyor.
 */

const PILLARS = [
  {
    title: "Seçki",
    body: "Kataloğa ürün eklemiyoruz; seçki kuruyoruz. Bir ürün tasarımı, içeriği ve gündelik kullanımdaki karşılığıyla birlikte değerlendirilmeden rafa girmiyor.",
  },
  {
    title: "Şeffaflık",
    body: "Ürün açıklamaları abartılı vaat değil, kullanım bilgisi taşır. Fiyat neyse odur; sepette sürpriz kalem çıkmaz.",
  },
  {
    title: "Özen",
    body: "Sipariş, ilk keşiften teslimata kadar aynı dikkatle ele alınır. Paketleme bir lojistik adımı değil, deneyimin parçası.",
  },
];

const PROMISES = [
  { label: "Orijinal ürün", note: "Yetkili tedarik zinciri" },
  { label: "3D Secure ödeme", note: "Kart bilgisi saklanmaz" },
  { label: "14 gün iade", note: "Kullanılmamış ürünlerde" },
  { label: "Özenli paketleme", note: "Her siparişte" },
];

/* Kendi metni olmayan mağaza için YANSIZ giriş. ArvoCulture'ın
   cümleleri buradan kaldırıldı; onlar artık panele girilen metin. */
const VARSAYILAN_BASLIK = "Seçkimiz hakkında";

export async function generateMetadata(): Promise<Metadata> {
  const [sayfa, tema] = await Promise.all([
    magazaSayfasi("hakkimizda"),
    getStorefrontTheme(),
  ]);

  /* Açıklama kiracının ilk paragrafından; yoksa mağaza adıyla
     kurulan tek cümle. Sabit bir açıklama, arama sonucunda her
     mağazaya aynı metni yazardı. */
  const girisi = sayfa ? paragraflar(sayfa.govde)[0] : undefined;

  return {
    title: sayfa?.baslik || VARSAYILAN_BASLIK,
    description:
      girisi?.slice(0, 300) ??
      `${tema.store_name} seçkisi, çalışma biçimi ve müşterisine verdiği sözler.`,
    alternates: { canonical: "/hakkimizda" },
  };
}

export default async function About() {
  const [products, collections, sayfa] = await Promise.all([
    getStorefrontProducts(60),
    getStorefrontCollections(),
    magazaSayfasi("hakkimizda"),
  ]);

  const featured = products
    .filter((product) => product.available !== false)
    .slice(0, 5);

  const categoryCount = new Set(products.map((product) => product.category))
    .size;

  const kiraciMetni = sayfa ? paragraflar(sayfa.govde) : [];

  return (
    <main className="shell">
      {/* Giriş: manifesto tonunda. Metin kiracınınsa onun cümleleri. */}
      <section className="panel about-hero">
        <p className="about-eyebrow">Hakkımızda</p>
        <h1>{sayfa?.baslik || VARSAYILAN_BASLIK}</h1>
        {kiraciMetni.length > 0 ? (
          kiraciMetni.map((paragraf, sira) => (
            <p key={sira} className={sira === 0 ? "about-lede" : undefined}>
              {paragraf}
            </p>
          ))
        ) : (
          <p className="about-lede">
            Kataloğumuzu bir liste değil, bir seçki olarak kuruyoruz. Aşağıda
            nasıl çalıştığımızı ve her siparişte verdiğimiz sözleri
            bulabilirsiniz.
          </p>
        )}
        <div className="about-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Seçkiyi keşfet
          </Link>
          <Link href="/iletisim">Bize ulaşın</Link>
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
          <small>Seçilmiş ürün</small>
        </div>
        <div>
          <strong>{collections.length}</strong>
          <small>Koleksiyon</small>
        </div>
        <div>
          <strong>{categoryCount}</strong>
          <small>Kategori</small>
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
                <h2>Nasıl çalışıyoruz</h2>
                <p>Üç ilke, her karar noktasında geçerli.</p>
              </div>
            </div>
            <div className="pillar-grid">
              {PILLARS.map((pillar, index) => (
                <article key={pillar.title}>
                  <span className="pillar-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Söz: koyu panel, sayfanın görsel duraklaması. */}
          <section className="panel about-promise">
            <div className="about-promise-body">
              <p className="about-eyebrow">Mağaza sözü</p>
              <h2>Aldığınız şeyin arkasında duruyoruz.</h2>
              <p>
                Her ürün yetkili tedarik zincirinden gelir, her ödeme 3D Secure
                ile korunur, her sipariş aynı özenle paketlenir. Bir şey ters
                giderse tek bir mesaj yeterli.
              </p>
            </div>
            <ul className="promise-list">
              {PROMISES.map((item) => (
                <li key={item.label}>
                  <strong>{item.label}</strong>
                  <small>{item.note}</small>
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
              <h2>Seçkiden</h2>
              <p>Bugün öne çıkardıklarımız.</p>
            </div>
            <Link href="/koleksiyon/tumu">Tüm ürünler</Link>
          </div>
          <div className="grid">
            {featured.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
