import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { konagiAyarla, vitrinAdresi } from "@/lib/konak";
import { canOptimizeImage } from "@/lib/image-hosts";
import { ProductBlock } from "@/components/home-blocks";
import { Reveal } from "@/components/reveal";
import { DolarZorla } from "@/components/para-birimi-koprusu";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import {
  getStorefrontCollectionProducts,
  getStorefrontDeals,
  getStorefrontProducts,
} from "@/lib/products";
import { getBlockedProducts } from "@/lib/engelli-urunler";
import { getShippingZones } from "@/lib/kargo-bolgeleri";
import { getSalesRules } from "@/lib/store-settings";
import { bolgeBul } from "@/lib/kargo-bolgesi";
import { dolarYazisi } from "@/lib/dolar";
import { enCokTercihEdilen, gonderilebilir } from "@/lib/yurtdisi-vitrin";

/*
  İNGİLİZCE VİTRİN — AYRI ADRES, AYRI İÇERİK.

  Türkçe ana sayfanın dolar modundaki hâli BOŞ görünüyordu: kartlar
  CSS ile gizleniyor ama rafların başlıkları yerinde kalıyordu ve
  ana sayfanın rafları tam o gizlenen ürünlerden kuruluydu ("çok
  satan cilt bakım" koleksiyonu, indirimdekiler ve tedarikçiden yeni
  gelenler yurtdışına gönderilemeyen LR kataloğu). Boşluk hangi
  ürünlerin rafta olduğundan geliyor, yani istemcide çözülemiyordu.

  Burada süzgeç SUNUCUDA: raflar yalnızca yurtdışına
  gönderilebilecek ürünlerden kuruluyor, boş raf hiç çizilmiyor.

  NEDEN AYRI ADRES: dil seçimi tarayıcıda (çerez okuyan bir sayfa
  Next'te dinamikleşiyor ve bu depoda rota önbelleğini düşüren bir
  değişiklik 3.400 ürün sayfasını 500'e düşürmüştü). Ayrı adresin
  önbellek anahtarı da ayrı; sayfa saklanabiliyor ve arama motoru
  İngilizce sayfayı ayrıca dizine alabiliyor.

  METİN MARKA ANLATISI TAŞIMAZ. Mağaza adı temadan geliyor
  (`store_name`); kalan cümleler her kiracı için doğru olan yansız
  cümleler. Panelin Türkçe tanıtım metni makineyle çevrilmiyor —
  kiracının sesini uydurmak olurdu. Kiracı kendi İngilizce metnini
  yazmak isterse tema alanı eklenmesi gerekir; bugün yok.
*/

/*
  KANONİK ADRES METADATA'DA, gövdede değil: gövdeye yazılan bir
  <link> etiketi Next'in başlık yönetiminin dışında kalıyor ve
  İngilizce sayfa Türkçe sayfanın kopyası sayılabilirdi. Karşılıklı
  `alternates` ile iki sayfa birbirini gösteriyor (Türkçe sayfadaki
  eşi kendi generateMetadata'sında).
*/
/*
  ALTMIŞ SANİYE — VE BU ZORUNLU, SÜSLEME DEĞİL.

  `[konak]` düzeninde `generateStaticParams` var, yani bu sayfa da
  saklanıyor. Süre yazılmasaydı sayfa BİR KEZ üretilip öyle kalırdı
  ve aşağıdaki `notFound()` kalıcı olurdu: yurtdışı modu kapalıyken
  yapılan bir dağıtımdan sonra kurum sahibi modu panelden açsa bile
  /en hâlâ 404 verirdi — ve sebebi hiçbir ekranda görünmezdi.

  Altmış saniye ürün sayfasıyla aynı ve aynı gerekçeyle: raflardaki
  fiyat o kadar bayat olabilir, taahhüt eden rakam zaten sepet ve
  ödeme sayfalarında (onlar dinamik).
*/
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ konak: string }>;
}): Promise<Metadata> {
  konagiAyarla((await params).konak);
  const adres = await vitrinAdresi();
  return {
    title: "International shopping",
    description: "Shop and ship worldwide. Prices in USD, charged in Turkish lira.",
    alternates: {
      canonical: `${adres}/en`,
      languages: { "tr-TR": `${adres}/`, en: `${adres}/en` },
    },
  };
}

export default async function IngilizceAnaSayfa({
  params,
}: {
  params: Promise<{ konak: string }>;
}) {
  konagiAyarla((await params).konak);

  const [theme, products, deals, curated, engelliListe, bolgeler, rules] =
    await Promise.all([
      getStorefrontTheme(),
      getStorefrontProducts(200),
      getStorefrontDeals(40),
      getStorefrontCollectionProducts({
        collectionSlug: "cok-satan-cilt-bakim-urunleri",
      }),
      getBlockedProducts(),
      getShippingZones(),
      getSalesRules(),
    ]);

  /*
    MOD KAPALIYSA SAYFA YOK — gerçek 404.

    Kapalı modda dolar kuru da gelmiyor (ayar fonksiyonu kapalı modda
    kuru hiç döndürmüyor), yani sayfa İngilizce metinle TL fiyat
    gösterirdi: yarı çalışan bir vitrin. Boş bir sayfa göstermek ya da
    Türkçeye yönlendirmek de yanlış olurdu — adres gerçekten yok.

    `[konak]` kökünde `loading.tsx` YOK, yani buradaki notFound()
    gerçek 404 durum kodu üretiyor. Bir Suspense sınırının altında
    kalsaydı sayfa 404 ekranını gösterip HTTP 200 dönerdi ("yumuşak
    404") ve arama motoru adresi var sayardı.
  */
  if (!rules.internationalEnabled || !rules.usdRate) notFound();

  const engelli = new Set(engelliListe);

  /*
    İNDİRİMLİLER KIRK OKUNUYOR, ON DEĞİL. Türkçe sayfa on tane
    çekiyor ve burada süzgeçten sonra elde üç kart kalıyordu:
    indirimli ürünlerin çoğu gönderilemeyen katalogdan. Kırk okuyup
    süzmek, dolu bir raf için en basit yol.
  */
  const indirimli = gonderilebilir(deals, engelli).slice(0, 10);
  const stokta = gonderilebilir(products, engelli);

  /*
    ÇOK SATANLAR: koleksiyon → işaretli ürün → BOŞ. Üçüncü adım
    katalog sırası DEĞİL; kural ve testi lib/yurtdisi-vitrin'de.
  */
  const onerilen = enCokTercihEdilen(curated, products, engelli);

  const yeni = stokta.slice(0, 10);

  /* Kargo ücreti örneği: "öteki her yer" bölgesi müşterinin
     görebileceği en yüksek olasılık. Tarife yoksa rakam YAZILMIYOR —
     uydurma bir ücret, ödemede başka tutar görmek demek. */
  const genelBolge = bolgeBul(bolgeler, null);
  const ornekKargo =
    genelBolge && rules.usdRate
      ? dolarYazisi(
          Math.ceil(genelBolge.fee_cents * (1 + rules.usdMarginPercent / 100)) / 100,
        )
      : null;

  return (
    <main className="shell">
      <DolarZorla />

      <section className="panel hero">
        {theme.hero_image_url && (
          <Image
            unoptimized={!canOptimizeImage(theme.hero_image_url)}
            src={theme.hero_image_url}
            alt=""
            width={2000}
            height={1000}
            sizes="(max-width: 1600px) 100vw, 1600px"
            preload
            fetchPriority="high"
          />
        )}
        <span className="hero-veil" aria-hidden="true" />
        <div className="hero-body">
          <p className="hero-eyebrow">International</p>
          <h1>
            {theme.store_name} <span>ships worldwide</span>
          </h1>
          <p className="hero-lede">
            Browse the collection with prices in US dollars. Orders are
            charged in Turkish lira at checkout.
          </p>
          <div className="hero-cta">
            <Link className="btn" href="/koleksiyon/tumu">
              Shop all
            </Link>
            {/* İkincil bağlantı sınıfsız: Türkçe kapakta da öyle,
                `.hero-cta > a:not(.btn)` kuralı onu biçimliyor. */}
            <Link href="/teslimat">Delivery &amp; returns</Link>
          </div>
        </div>
      </section>

      {/*
        GÖNDERİM KOŞULLARI EN BAŞTA, ürünlerden önce.

        Yurtdışı müşterisinin ilk sorusu "bana gönderiyor musunuz ve
        ne kadar" — Türkçe sayfadaki güvence şeridi bu soruyu
        yanıtlamıyor, çünkü oradaki rakamlar yurt içi tarifesi.
      */}
      <section className="panel promo">
        <h2>Shipping to your country</h2>
        <ul className="perks">
          <li>
            <b>Worldwide delivery</b>
            <span>
              {ornekKargo
                ? `Shipping from ${ornekKargo}, calculated from your country at checkout.`
                : "Shipping is calculated from your country at checkout."}
            </span>
          </li>
          <li>
            <b>Prices in USD</b>
            <span>
              Shown in US dollars; the payment is taken in Turkish lira, so
              your bank statement shows ₺.
            </span>
          </li>
          <li>
            <b>Some items stay in Türkiye</b>
            <span>
              A part of the catalogue cannot be shipped abroad and is not
              listed here.
            </span>
          </li>
        </ul>
      </section>

      {/* Boş raf HİÇ çizilmiyor: başlığı duran boş bir şerit,
          olmayan bölümden kötü — düzeltilen kusur tam buydu. */}
      {indirimli.length > 0 ? (
        <Reveal>
          <ProductBlock
            title="On sale"
            note="Current reductions available for international delivery."
            href="/koleksiyon/firsatlar"
            hrefLabel="See all"
            products={indirimli}
            rail
          />
        </Reveal>
      ) : null}

      {onerilen.length > 0 ? (
        <Reveal>
          <ProductBlock
            title="Most wanted"
            note="The pieces our customers choose most often."
            href="/koleksiyon/tumu"
            hrefLabel="See all"
            products={onerilen}
            rail
          />
        </Reveal>
      ) : null}

      {yeni.length > 0 ? (
        <Reveal>
          <ProductBlock
            title="New arrivals"
            note="Recently added to the collection."
            href="/koleksiyon/tumu"
            hrefLabel="See all"
            products={yeni}
            rail
          />
        </Reveal>
      ) : null}

      {/*
        HİÇ ÜRÜN YOKSA SAYFA BUNU SÖYLÜYOR. Üç bölüm de boşsa
        (tarife tanımlı ama katalogda gönderilebilir ürün yok)
        sessiz bir boş sayfa, hatanın en sessiz biçimi olurdu.
      */}
      {indirimli.length === 0 && onerilen.length === 0 && yeni.length === 0 ? (
        <section className="panel">
          <h2>Nothing to ship abroad yet</h2>
          <p>
            None of the items currently in stock can be shipped outside
            Türkiye. Please check back soon.
          </p>
        </section>
      ) : null}

      {/* Türkçe sayfanın yardım bölümüyle AYNI sınıflar: ".help-strip"
          diye bir kural yok ve uydurduğum sınıf stilsiz bir kutu
          üretiyordu — bu depoda "sayfa kullandığı sınıfın CSS'ini
          kendi import etmeli, yoksa stil yok ve hata da yok" uyarısı
          tam bu sınıftan. */}
      <section className="panel help-panel" aria-label="Help">
        <div className="head">
          <div>
            <h2>Questions before you order?</h2>
            <p>The most asked ones, answered in English.</p>
          </div>
        </div>
        <div className="help-cards">
          <Link href="/teslimat" className="help-card">
            <small>Delivery</small>
            <strong>When does my parcel leave?</strong>
            <span>
              {ornekKargo ? `Shipping from ${ornekKargo}` : "Calculated at checkout"}
            </span>
            <em aria-hidden="true">&rarr;</em>
          </Link>
          <Link href="/iptal-iade" className="help-card">
            <small>Returns</small>
            <strong>Can I return an item?</strong>
            <span>{rules.internationalEnabled ? "See the return terms" : "See the terms"}</span>
            <em aria-hidden="true">&rarr;</em>
          </Link>
          <Link href="/iletisim" className="help-card">
            <small>Contact</small>
            <strong>Reach us</strong>
            <span>Write with your order number</span>
            <em aria-hidden="true">&rarr;</em>
          </Link>
        </div>
      </section>
    </main>
  );
}
