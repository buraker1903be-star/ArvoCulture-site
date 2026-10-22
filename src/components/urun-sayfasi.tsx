import { getBlockedProducts } from "@/lib/engelli-urunler";
import { ingilizceBindir } from "@/lib/ingilizce-urunler";
import { Fiyat } from "@/components/para-birimi";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { ProductGallery } from "@/components/product-gallery";
import { ProductBuy } from "@/components/product-buy";
import { RecentProducts } from "@/components/recent-products";
import { ProductCard, discountOf } from "@/components/product-card";
import { getStorefrontProduct, getStorefrontProducts } from "@/lib/products";
import { getProductVariants } from "@/lib/variants";
import { breadcrumbSchema, productSchema } from "@/lib/seo";
import { konagiAyarla, vitrinAdresi } from "@/lib/konak";
import { kategoriAdresi } from "@/lib/categories";
import { getSalesRules } from "@/lib/store-settings";
import { shippingTerms } from "@/lib/order-quote";
import { getStorefrontTheme } from "@/lib/storefront-theme";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";
import { dilOneki, type Dil } from "@/lib/dil-onek";

/*
  ÜRÜN SAYFASININ GÖVDESİ — İKİ ROTA, TEK UYGULAMA.

  Türkçe (`/urun/[slug]`) ve İngilizce (`/en/urun/[slug]`) rotaları
  bu bileşeni çağırıyor. KOPYALANMADI ve bu bilinçli: 3.400 ürünün
  sayfası ve iki kopya kaçınılmaz olarak ayrışır — bu depoda aynı
  kalıp (vitrin ile ArvoARC'ın hesabı) bir kez müşteriye farklı
  tutar gösterdi.

  Dile bağlı olan üç şey: metinler (sözlükten), bağlantı öneki
  (`/en`) ve ürün adının İngilizce karşılığı. Gerisi aynı.

  AYRI ADRES NEDEN GEREKLİ: dil seçimi tarayıcıda ve çerez okuyan
  bir sayfa Next'te dinamikleşiyor; ayrı adresin önbellek anahtarı
  da ayrı, yani sayfa saklanabiliyor ve arama motoru İngilizce
  sayfayı ayrıca dizine alabiliyor.
*/

export async function UrunSayfasi({ params, dil }: { params: Promise<{ konak: string; slug: string }>; dil: Dil }) {
  /* Adres yoldan geliyor; her sayfa onu veri katmanına kendisi
     bırakıyor — düzen ile sayfa AYNI ANDA çiziliyor, sıraya
     güvenilemiyor (lib/konak). */
  const { slug, konak } = await params;
  konagiAyarla(konak);

  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);

  const [product, catalogue, varyantSonucu, salesRules, adres, theme, engelliUrunler] =
    await Promise.all([
    getStorefrontProduct(slug),
    getStorefrontProducts(120),
    /* Gerçek bedenler; sepete doğru SKU yazılabilsin. Okuma
       başarısızsa "seçenek yok" demiyor, "bilinmiyor" diyor:
       SKU'suz sepet ArvoARC'ta rastgele varyanta bağlanıyordu
       (lib/variants.ts). */
    getProductVariants(slug),
    // Yapısal verideki kargo ücreti mağazanın gerçek tarifesi olsun.
    getSalesRules(),
    /* Şemadaki adresler kanonik adresten: önceden env.siteUrl
       sabitiydi ve ikinci bir kiracının ürün şeması ArvoCulture'ın
       adresini gösterirdi. */
    vitrinAdresi(),
    /* Ürünün kendi markası yoksa şemaya mağaza adı giriyor;
       sabit "ArvoCulture" ikinci bir kiracının markasız ürününü
       bizim markamızla bildiriyordu. */
    getStorefrontTheme(),
    /* Yurtdışına gönderilemeyen ürünler: dolar modunda satın alma
       kutusu kapanıyor. Kart listelerde zaten gizli ama bu SAYFA
       erişilebilir kalıyor — bağlantı WhatsApp'ta ya da müşterinin
       favorilerinde duruyor olabilir (lib/engelli-urunler). */
    getBlockedProducts(),
  ]);

  if (!product) notFound();

  /*
    İNGİLİZCE AD VE AÇIKLAMA BİNDİRİLİYOR. Çevirisi olmayan ürün
    Türkçe adıyla kalıyor: 3.400 ürünün çevirisi kademeli yürüyor ve
    yarım çeviri, boş bir sayfadan iyi (lib/ingilizce-urunler).

    Benzer ürünler de bindiriliyor — İngilizce bir sayfada Türkçe
    kart rafı, sayfanın yarısını Türkçe bırakmak olurdu.
  */

  const { varyantlar: variants, okunamadi: varyantOkunamadi } = varyantSonucu;

  // Güvence şeridi ve teslimat notu mağazanın gerçek tarifesiyle.
  const shipping = shippingTerms(salesRules);

  // Benzer ürünler: aynı kategoriden, stokta olan, bu ürün hariç.
  const relatedHam = catalogue
    .filter(
      (item) =>
        item.slug !== product.slug &&
        item.category === product.category &&
        item.available !== false,
    )
    .slice(0, 5);

  /*
    BİNDİRME SÜZGEÇTEN SONRA: önce bindirip sonra süzmek, 120
    ürünün çevirisini sormak olurdu. Burada en çok altı kayıt var
    (ürünün kendisi + beş benzer).

    Türkçe sayfada hiç sorgu YAPILMIYOR: dil "tr" ise bindirme
    atlanıyor, yani 3.400 Türkçe ürün sayfası bu değişiklikten
    etkilenmiyor.
  */
  const [[productEn], related] =
    dil === "en"
      ? await Promise.all([ingilizceBindir([product]), ingilizceBindir(relatedHam)])
      : [[product], relatedHam];

  /* Çevirisi olmayan ürün Türkçe adıyla kalıyor. */
  const urun = productEn ?? product;
  const off = discountOf(urun);

  return (
    <main className="shell">
      <section className="panel pdp">
        <ProductGallery
          images={product.images}
          name={urun.name}
          artStyle={product.artStyle}
        />

        <div className="pdp-info">
          <nav className="crumbs" aria-label={t("konum")}>
            <Link href={onek || "/"}>{t("anaSayfa")}</Link>
            <span aria-hidden="true">/</span>
            {/* Görünen kırıntı da şemayla aynı adrese gidiyor. */}
            <Link href={`${onek}${kategoriAdresi(product.category)}`}>{product.category}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{urun.name}</span>
          </nav>

          {/* Künye satırı: marka ve "çok satan" işareti — karttaki
              düzenin aynısı. Rozet görselin üzerinden buraya taşındı. */}
          <p className="eyebrow">
            {product.eyebrow && <span>{product.eyebrow}</span>}
            {product.bestSeller && <em>{t("cokSatanRozet")}</em>}
          </p>
          <h1>{urun.name}</h1>
          {urun.subtitle && <p className="lead">{urun.subtitle}</p>}

          <div className="pdp-price">
            <b><Fiyat lira={product.price} /></b>
            {product.oldPrice && product.oldPrice > product.price && (
              <>
                <del><Fiyat lira={product.oldPrice} /></del>
                {off > 0 && <span className="price-off">−%{off}</span>}
                {/* Tutar olarak tasarruf, pahalı ürünlerde yüzdeden
                    daha ikna edici; ikisi birlikte duruyor. */}
                <span className="pdp-save">
                  <Fiyat lira={product.oldPrice - product.price} /> {t("tasarrufEki")}
                </span>
              </>
            )}
          </div>

          <ProductBuy
            product={product}
            variants={variants}
            varyantOkunamadi={varyantOkunamadi}
            yurtdisiEngelli={engelliUrunler.includes(product.slug)}
          />

          {/* Satın alma kaygısını azaltan üç madde, butonun hemen
              altında; aşağı kaydırmaya gerek kalmıyor. */}
          <ul className="pdp-assurances">
            <li>
              <Link href="/teslimat">{shipping.badge}</Link>
            </li>
            <li>
              <Link href="/iptal-iade">{t("iadeGunu")}</Link>
            </li>
            <li>
              <Link href="/gizlilik">{t("guvenliOdeme3d")}</Link>
            </li>
          </ul>

          {product.tags.length > 0 && (
            <div className="tags">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}

          <div className="pdp-details">
            <details open>
              <summary>
                <span>{t("urunAciklamasi")}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{urun.description || urun.subtitle}</p>
            </details>

            {product.specs.length > 0 && (
              <details>
                <summary>
                  <span>{t("urunOzellikleri")}</span>
                  <i aria-hidden="true" />
                </summary>
                <dl className="spec-list">
                  {product.specs.map((spec) => (
                    <div key={spec.label}>
                      <dt>{spec.label}</dt>
                      <dd>{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}

            {product.sizeGuide.length > 0 && (
              <details>
                <summary>
                  <span>{t("bedenTablosu")}</span>
                  <i aria-hidden="true" />
                </summary>
                <dl className="spec-list">
                  {product.sizeGuide.map((row) => (
                    <div key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}

            <details>
              <summary>
                <span>{t("teslimatBaslik")}</span>
                <i aria-hidden="true" />
              </summary>
              <p>
                {t("teslimatMetni")}{" "}
                {/* Kargo cümlesi mağaza ayarından ve TÜRKÇE: tarife
                    metni tek yerden kuruluyor (lib/order-quote →
                    shippingTerms) ve onu İngilizceye çevirmek, iki
                    yerde iki ayrı tarife cümlesi demekti. */}
                {dil === "tr" ? shipping.sentence : null}
              </p>
            </details>

            <details>
              <summary>
                <span>{t("iadeKosullari")}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{t("iadeMetni")}</p>
            </details>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="panel">
          <div className="head">
            <div>
              <h2>{t("benzerUrunler")}</h2>
              <p>{t("benzerUrunlerAlt").replace("{kategori}", product.category)}</p>
            </div>
            <Link href={`${onek}/koleksiyon/tumu`}>{t("tumUrunler")}</Link>
          </div>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} onek={onek} />
            ))}
          </div>
        </section>
      )}

      {/* Son gezilenler: bu ürünü listeye ekler, diğerlerini gösterir. */}
      <RecentProducts currentSlug={product.slug} />

      {/* Varyantlar şemaya da giriyor: tek varyantlıda gerçek SKU ve
          kesin fiyat, çok varyantlıda fiyat aralığı (AggregateOffer).
          Önceden SKU olarak ürün slug'ı, fiyat olarak kataloğun en
          düşük fiyatı yazılıyordu. */}
      <JsonLd data={productSchema(urun, adres, theme.store_name ?? "Mağaza", salesRules, variants)} />
      <JsonLd
        data={breadcrumbSchema(
          [
            { name: t("anaSayfa"), path: onek || "/" },
            /* Basamağın adı ile gittiği yer aynı olmalı: "Kozmetik"
               yazıp tüm kataloğu açmak yanıltıcıydı (lib/categories). */
            { name: product.category, path: `${onek}${kategoriAdresi(product.category)}` },
            { name: urun.name, path: `${onek}/urun/${urun.slug}` },
          ],
          adres,
        )}
      />
    </main>
  );
}
