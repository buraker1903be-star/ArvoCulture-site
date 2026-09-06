import type { Metadata } from "next";
import Link from "next/link";
import { getStorefrontProducts } from "@/lib/products";
import { getStorefrontCollections } from "@/lib/collections";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "ArvoCulture; giyim, kişisel bakım ve koku dünyasını tek bir çağdaş yaşam kültüründe buluşturan bir seçki markasıdır.",
  alternates: { canonical: "/hakkimizda" },
};

/**
 * Hakkımızda sayfası.
 *
 * Kurumsal metin yığını yerine mağaza diliyle kurulmuştur: her
 * bölüm bir panel, sonunda gerçek ürünlerle biten bir vitrin.
 * Ziyaretçinin sayfayı okuyup çıkmasını değil, okuyup alışverişe
 * dönmesini hedefler.
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

export default async function About() {
  const [products, collections] = await Promise.all([
    getStorefrontProducts(60),
    getStorefrontCollections(),
  ]);

  const featured = products
    .filter((product) => product.available !== false)
    .slice(0, 5);

  const categoryCount = new Set(products.map((product) => product.category))
    .size;

  return (
    <main className="shell">
      {/* Giriş: manifesto tonunda, tek cümlelik iddia. */}
      <section className="panel about-hero">
        <p className="about-eyebrow">ArvoCulture dünyası</p>
        <h1>Seçtiğin şey sensin.</h1>
        <p className="about-lede">
          Giyim, kişisel bakım ve koku dünyasını tek bir çağdaş yaşam
          kültüründe buluşturuyoruz. Tarzın yalnızca giydiklerinden, bakımın
          yalnızca kullandığın ürünlerden ibaret olmadığına inanıyoruz.
        </p>
        <div className="about-actions">
          <Link className="btn" href="/koleksiyon/tumu">
            Seçkiyi keşfet
          </Link>
          <Link href="/iletisim">Bize ulaşın</Link>
        </div>
      </section>

      {/* Ölçek: soyut iddiaları somut sayılarla destekler. */}
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
        <div>
          <strong>2026</strong>
          <small>Kuruluş</small>
        </div>
      </section>

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
          <p className="about-eyebrow">ArvoCulture sözü</p>
          <h2>Aldığınız şeyin arkasında duruyoruz.</h2>
          <p>
            Her ürün yetkili tedarik zincirinden gelir, her ödeme 3D Secure ile
            korunur, her sipariş aynı özenle paketlenir. Bir şey ters giderse
            tek bir mesaj yeterli.
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
