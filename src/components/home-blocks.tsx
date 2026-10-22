import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { Rail } from "@/components/rail";
import type { Product } from "@/lib/product-types";
import { categoryKey, urunSayisiYazisi } from "@/lib/categories";
import type { KategoriVitrini } from "@/lib/kategori-vitrini";
import { JsonLd } from "@/components/json-ld";
import { kategoriListesiSchema } from "@/lib/seo";
import { canOptimizeImage } from "@/lib/image-hosts";

/** Ürün ızgarası. Ana sayfada birden çok yerde kullanılır. */
export function ProductBlock({
  title,
  eyebrow,
  note,
  href,
  hrefLabel,
  products,
  alt,
  rail,
  onek = "",
}: {
  title: string;
  /**
   * Başlığın üstündeki künye etiketi. ArvoARC panelindeki
   * `featured_eyebrow` buraya geliyor; önceden açıklama satırına
   * basılıyordu ve büyük harfli etiket, cümle boyunda duruyordu.
   */
  eyebrow?: string;
  note?: string;
  href: string;
  hrefLabel: string;
  products: Product[];
  alt?: boolean;
  /* Dil öneki: İngilizce raftaki kart İngilizce ürün sayfasına
     gitmeli (lib/dil-onek). Varsayılan boş — Türkçe çağıranların
     hiçbiri değişmedi. */
  onek?: string;
  /**
   * Izgara yerine yatay kaydırmalı raf. Sekiz özdeş ızgaranın
   * ardı ardına gelmesi sayfayı düzleştiriyordu; bir bölümü
   * rafa çevirmek göze ritim veriyor.
   */
  rail?: boolean;
}) {
  if (products.length === 0) return null;

  return (
    <section className={`panel${alt ? " panel-soft" : ""}`}>
      <div className="head">
        <div>
          {eyebrow && <p className="about-eyebrow">{eyebrow}</p>}
          <h2>{title}</h2>
          {note && <p>{note}</p>}
        </div>
        <Link href={href}>{hrefLabel}</Link>
      </div>
      {rail ? (
        <Rail>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} onek={onek} />
          ))}
        </Rail>
      ) : (
        <div className="grid">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} onek={onek} />
          ))}
        </div>
      )}
    </section>
  );
}

/** Alışveriş güvencesi. Türkiye’de ilk kez alışveriş yapılan sitede
 *  en sık sorulan sorular: kargo, iade, ödeme güvenliği. */
const PERKS = [
  { title: "14 gün içinde iade", note: "Kullanılmamış ürünlerde", href: "/iptal-iade" },
  { title: "3D Secure ile ödeme", note: "Kart bilgisi saklanmaz", href: "/gizlilik" },
  { title: "Orijinal ürün", note: "Yetkili tedarik", href: "/sss" },
];

export function Perks({
  shippingBadge,
  urunSayisi,
}: {
  shippingBadge: string;
  /* Katalog büyüklüğü. Kapakta duruyordu ve hemen altındaki bu
     satırla çakışıyordu; buraya taşındı çünkü buradaki maddeler
     BAĞLANTILI — müşteri rakama dokunup kataloğa girebiliyor. */
  urunSayisi?: number;
}) {
  /* Kargo maddesi mağazanın tarifesinden gelir (shippingTerms); önceden
     "2.000 TL" sabitti ve panelden eşik değişince yanlış kalıyordu. */
  const perks = [
    { title: shippingBadge, note: "Türkiye geneli", href: "/teslimat" },
    ...PERKS,
    /* Sayı gerçek: katalog sayacından geliyor, yuvarlanmış bir
       pazarlama rakamı değil. Okunamazsa madde hiç çizilmiyor. */
    ...(urunSayisi
      ? [
          {
            title: `${urunSayisi.toLocaleString("tr-TR")} ürün`,
            note: "Seçilmiş katalog",
            href: "/koleksiyon/tumu",
          },
        ]
      : []),
  ];
  return (
    /*
      Kendi paneli yok: ana sayfada arama ve kupon panelinin alt katı
      (bkz. page.tsx). Ayrı bir bant olarak duyuru çubuğunu tekrar
      ediyor, mobilde tek başına 224px yer kaplıyordu.
    */
    <nav className="perks" aria-label="Alışveriş güvencesi">
      {perks.map((perk) => (
        <Link key={perk.title} href={perk.href}>
          <strong>{perk.title}</strong>
          <small>{perk.note}</small>
        </Link>
      ))}
    </nav>
  );
}

/*
  Kategori kartları.

  Önceden küçük çizim ikonlar vardı; kategori adını söylüyorlardı
  ama tarzı anlatmıyorlardı. Fotoğraf, müşterinin "burada ne var"
  sorusuna tek bakışta yanıt veriyor ve tıklanma oranını artıran
  en somut değişiklik.

  Görseller `public/kategori/` altında, kategori anahtarıyla aynı
  adı taşıyor: yeni kategori eklendiğinde aynı adla bir dosya
  koymak yeterli.
*/
export function CategoryStrip({
  items,
  siteUrl,
}: {
  items: KategoriVitrini[];
  /* Şemadaki adresler TAM olmalı; göreli adres `ItemList` içinde
     çözümlenmiyor. Okunamazsa şema hiç basılmıyor — yarım bir
     işaretleme, işaretleme olmamasından kötü. */
  siteUrl?: string;
}) {
  /*
    Telefonda kartlar ikişerli diziliyor; sayı TEKSE sonuncusu yalnız
    kalacağı için ilk kart tam genişlikte vitrin oluyor (CSS'te :has ile).
    `sizes` de buna bağlı: dört kartta ilk kart artık 90vw değil.
  */
  const tekSayi = items.length % 2 === 1;
  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>Kategoriler</h2>
          <p>Seçkinin tamamına buradan girin.</p>
        </div>
        <Link href="/koleksiyon/tumu">Tüm katalog</Link>
      </div>

      <div className="cat-cards" style={{ ["--cat-n" as string]: items.length }}>
        {items.map((item, index) => {
          const key = categoryKey(item.href);
          return (
            <Link key={item.href} href={item.href} className="cat-card">
              <span className="cat-card-art">
                <Image
                  src={`/kategori/${key}.jpg`}
                  alt=""
                  fill
                  /*
                    Telefonda kart sayısı tekse ilk kart tam genişlik
                    (bkz. .cat-cards:has(…)), diğerleri ikişerli. Tek bir
                    "45vw" ilk kartı yarı çözünürlükte, bulanık çiziyordu.
                    Masaüstünde kart üzerine gelince genişlediği için üst
                    sınır genişleyen hâline göre verildi (~40vw).
                  */
                  sizes={
                    index === 0 && tekSayi
                      ? "(max-width: 640px) 90vw, (max-width: 980px) 46vw, 40vw"
                      : "(max-width: 640px) 42vw, (max-width: 980px) 46vw, 40vw"
                  }
                />
              </span>

              {/*
                Ürün sayısı rozeti ürün kartlarıyla AYNI cam hap
                (bkz. .tag-off): sayfada iki ayrı rozet biçimi
                olursa kart kendi içinde çelişir. Sayı yoksa rozet
                hiç çizilmiyor — "0 ürün" yazan bir kart müşteriyi
                boş sayfaya çağırır.
              */}
              {item.urunSayisi ? (
                <span className="cat-card-flag">
                  {urunSayisiYazisi(item.urunSayisi)}
                </span>
              ) : null}

              <span className="cat-card-body">
                <strong>{item.label}</strong>

                {/*
                  KATEGORİNİN İÇİNDEN ÜÇ GERÇEK ÜRÜN.

                  Kart böylece "bir fotoğraf ve bir ad" olmaktan
                  çıkıp kategorinin kendi vitrini oluyor; müşteri
                  tıklamadan önce ne satıldığını görüyor. Görseller
                  ürün kartlarındakiyle aynı kaynaktan.

                  Ayrı bağlantı DEĞİL: kartın tamamı zaten bir
                  bağlantı ve içine ikinci bir <a> koymak geçersiz
                  HTML olurdu. Küçük kareler yalnızca kanıt.
                */}
                {item.urunler.length > 0 && (
                  <span className="cat-card-thumbs" aria-hidden="true">
                    {item.urunler.map((urun) => (
                      <Image
                        key={urun.slug}
                        src={urun.gorsel}
                        alt=""
                        width={52}
                        height={52}
                        sizes="52px"
                      />
                    ))}
                  </span>
                )}

                <em>Keşfet</em>
              </span>
            </Link>
          );
        })}
      </div>

      {/* Şema markup'ın YANINDA duruyor: kart listesi değiştiğinde
          işaretlemenin de değişmesi gerektiği buradan görünüyor. */}
      {siteUrl && <JsonLd data={kategoriListesiSchema(items, siteUrl)} />}
    </section>
  );
}

/*
  ANA KOLEKSİYONLAR ("dünyalar").

  Bölüm ArvoARC panelinde 29.09.2026'dan beri VARDI ve vitrin onu
  hiç çizmiyordu: mağaza sahibi "Giyim başlığı", "Bakım açıklaması"
  yazabiliyor, yazdığı hiçbir yerde görünmüyordu. `show_worlds`,
  `order_worlds`, `apparel_*` ve `beauty_*` alanlarının hepsi öyle
  duruyordu — kupon kuralındaki ile aynı sessiz kalıp: panel vaat
  ediyor, vitrin yapmıyor.

  Ne işe yarıyor: ürün rafları fiyat ve kanıt gösteriyor, bu band
  HİKÂYE gösteriyor. Tek bir ürün hattının yaşam görseli bir rafta
  kart olarak duramaz; kart fiyat ve ad için var.

  GÖRSEL PANELDEN GELİR. Tema `beauty_image_url` / `apparel_image_url`
  taşıyor ve panelde yükleme yuvası var. `public/dunya/` altındaki
  dosyalar yalnızca başlangıç içindir (kategori görsellerindeki
  düzenin aynısı): panelden bir görsel yüklendiği anda tema o adrese
  geçiyor ve buradaki dosya kullanılmaz olur.

  BAŞLIĞI VE GÖRSELİ OLMAYAN DÜNYA ÇİZİLMİYOR. Yarım bir dünya
  (başlık var, görsel yok) koyu boş bir dikdörtgen olurdu ve
  mağaza sahibi neyi eksik bıraktığını göremezdi. Tek dünya varsa
  bant tam genişlik: iki sütunun biri boş kalmıyor.
*/
export type Dunya = {
  anahtar: string;
  baslik: string;
  aciklama: string;
  gorsel: string;
  href: string;
};

export function Worlds({ items }: { items: Dunya[] }) {
  if (items.length === 0) return null;

  return (
    <section className="panel worlds" data-arvo-section="worlds">
      <div className="world-cards">
        {items.map((dunya) => (
          <Link key={dunya.anahtar} href={dunya.href} className="world">
            <span className="world-art">
              <Image
                /* Panelden gelen adres herhangi bir yerde olabilir;
                   listede olmayan adres next/image'ı hata verdirir. */
                unoptimized={!canOptimizeImage(dunya.gorsel)}
                src={dunya.gorsel}
                alt=""
                fill
                sizes={
                  items.length === 1
                    ? "(max-width: 860px) 100vw, 1200px"
                    : "(max-width: 860px) 100vw, 50vw"
                }
                /* Bant kapağın altında, ilk ekranda değil; ama tek
                   dünya varken sayfanın en büyük görseli oluyor. */
                priority={false}
                loading="lazy"
              />
            </span>

            <span className="world-body">
              <strong data-arvo-field={`${dunya.anahtar}_title`}>
                {dunya.baslik}
              </strong>
              {dunya.aciklama && (
                <small data-arvo-field={`${dunya.anahtar}_description`}>
                  {dunya.aciklama}
                </small>
              )}
              <em>Keşfet</em>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}


/*
  YARDIM BANDI.

  Önceden tek satırlık bir şeritti: solda bir soru, yanında dört
  düz gri bağlantı ve sağda ekranın %40'ı boş. Üç sorun vardı:

  * bağlantılar bağlantı gibi durmuyordu (altı çizili değil, rengi
    gövde metniyle aynı) — tıklanabilir oldukları ancak üzerine
    gelince anlaşılıyordu;
  * şerit SORUYOR ama CEVAPLAMIYORDU. Sipariş vermeden önceki
    tereddüdü gidermesi gereken yer, müşteriyi dört ayrı sayfaya
    gönderiyordu;
  * sayfadaki her bölüm panel başlığı + içerik düzenindeyken bu
    tek başına başka bir dildeydi.

  Artık her kartta sorunun KISA CEVABI da var ve cevaplar gerçek:
  kargo cümlesi mağaza ayarlarından (shippingTerms), cayma süresi
  satış kurallarından geliyor. Sayfaya "120 TL" yazmak yasak
  (AGENTS.md) — bu yüzden metin değil DEĞER aktarılıyor.
*/
export function HelpStrip({
  shippingBadge,
  iadeGunu,
}: {
  /** "2.000 TL üzeri ücretsiz kargo" — mağaza ayarından. */
  shippingBadge: string;
  /** Cayma süresi (gün). */
  iadeGunu: number;
}) {
  const items = [
    {
      etiket: "Teslimat",
      soru: "Kargom ne zaman çıkar?",
      cevap: shippingBadge,
      href: "/teslimat",
    },
    {
      etiket: "İade",
      soru: "Nasıl iade ederim?",
      cevap: `${iadeGunu} gün içinde cayma hakkı`,
      href: "/iptal-iade",
    },
    {
      etiket: "SSS",
      soru: "Sıkça sorulanlar",
      cevap: "Ödeme, kargo, iade ve ürünler",
      href: "/sss",
    },
    {
      etiket: "İletişim",
      soru: "Bize ulaşın",
      /* İletişim bilgisinin KENDİSİ burada yazmıyor: telefon ve
         e-posta satıcı kaydından geliyor ve bu bileşen onu okumuyor
         (AGENTS.md — kimlik bilgisi sayfalara yazılmaz). */
      cevap: "Sipariş numaranızla yazın",
      href: "/iletisim",
    },
  ];

  return (
    <section className="panel help-panel" aria-label="Yardım">
      <div className="head">
        <div>
          <h2>Aklınıza takılan bir şey mi var?</h2>
          <p>Sipariş vermeden önce en çok sorulanlar.</p>
        </div>
      </div>

      <div className="help-cards">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="help-card">
            <small>{item.etiket}</small>
            <strong>{item.soru}</strong>
            <span>{item.cevap}</span>
            <em aria-hidden="true">→</em>
          </Link>
        ))}
      </div>
    </section>
  );
}
