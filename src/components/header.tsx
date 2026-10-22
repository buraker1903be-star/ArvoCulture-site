"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { asciiSlug } from "@/lib/categories";
import { CartLink } from "./cart";
import { ParaBirimiSecici } from "@/components/para-birimi";
import type { StorefrontTheme } from "@/lib/storefront-theme";
import type { StorefrontCollection } from "@/lib/collections";
import { dilOneki, yoldanDil } from "@/lib/dil-onek";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";
import { useLayerBack } from "@/lib/use-layer-back";
import { StoreLogo } from "@/components/store-logo";
import { SearchOverlay } from "@/components/search-overlay";
import { FavouritesOverlay } from "@/components/favourites-overlay";
import { AccountDrawer } from "@/components/account-drawer";

export function Header({
  theme,
  collections,
  searchTerms = [],
  supabaseUrl,
  supabaseKey,
}: {
  theme: StorefrontTheme;
  collections: StorefrontCollection[];
  /** Arama katmanının boş durumunda gösterilen sık aranan terimler. */
  searchTerms?: string[];
  /* Hesap çekmecesi için; /hesap sayfası da aynı değerleri
     özellik olarak alıyor (NEXT_PUBLIC_ değişkenine bağımlılık
     yok). Yayımlanabilir anahtar, tarayıcıya zaten gidiyor. */
  supabaseUrl: string;
  supabaseKey: string;
}) {
  /*
    DİL VE ÖNEK YOLDAN. Başlık düzende çiziliyor ve düzen bütün
    rotalarda ortak — rotaya göre değişmesi için her sayfanın kendi
    düzenini açması gerekirdi. İstemci bileşeni olduğu için yolu
    kendisi okuyabiliyor (lib/dil-onek).

    İngilizce ağaçtaki menü bağlantıları ağacın İÇİNDE kalmalı:
    bir menü tıklamasının müşteriyi Türkçe sayfaya atması, ayrı
    adres kurmanın bütün anlamını götürürdü.
  */
  const dil = yoldanDil(usePathname());
  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);
  /*
    GÖSTERİM İngilizce, EŞLEŞME Türkçe. Menünün gruplandırması ve
    marka eşleşmesi Türkçe başlığa bakıyor ("Çok Satanlar",
    cinsiyet öneki); İngilizce başlıkla eşleştirmek menünün yapısını
    bozardı. O yüzden burada yalnızca YAZILAN ad değişiyor.

    Çevirisi olmayan koleksiyon Türkçe adıyla kalıyor: 118
    koleksiyonun çevirisi kademeli yürüyor.
  */
  const ad = (oge: { title: string; title_en?: string | null }) =>
    dil === "en" ? (oge.title_en ?? oge.title) : oge.title;
  const [open, setOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const close = () => setOpen(false);

  /*
    Alt çubuktaki "Menü" sekmesi bu olayı gönderiyor. Başlık ve
    alt çubuk ayrı bileşenler; ortak bir durum sarmalayıcısı
    kurmak yerine tek yönlü bir olayla bağlanıyorlar.
  */
  useEffect(() => {
    const toggle = () => setOpen((value) => !value);
    window.addEventListener("arvo:menu", toggle);

    /*
      Sepet çekmecesi açılırken menü kapansın. İkisi birden açık
      kalırsa üst üste iki katman olur ve geri hareketi bunları
      tek tek soymak zorunda kalır — müşteri "geri tuşu takıldı"
      diye okur.
    */
    const kapat = () => setOpen(false);
    window.addEventListener("arvo:cart", kapat);

    return () => {
      window.removeEventListener("arvo:menu", toggle);
      window.removeEventListener("arvo:cart", kapat);
    };
  }, []);

  /*
    Menü açıkken arkadaki sayfa kaydırılamaz.

    Sepet çekmecesi ve arama katmanı bunu zaten yapıyordu, menü
    yapmıyordu: müşteri kategori listesinde gezinirken altındaki
    vitrin kayıyor ve menüyü kapattığında kendini sayfanın bambaşka
    bir yerinde buluyordu. Telefonda bu, kontrolü kaybetmiş hissi
    verir ve uygulama gibi değil, web sayfası gibi durur.
  */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /* Esc menüyü kapatsın — açık katman, gezinmeden önce kapanmalı. */
  useEffect(() => {
    if (!open) return;
    const esc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open]);

  /*
    Telefonda geri hareketi menüyü kapatsın. Yorumda "geri tuşu"
    yazıyordu ama yalnızca Escape bağlanmıştı; telefonda Escape
    yok, geri var. Katman açıkken geri basan müşteri siteden
    çıkıyordu.
  */
  useLayerBack(open, close);
  /*
    Koleksiyonları menu_group’a göre getirir. ArvoARC’taki gruplandırma
    iki farklı ekseni karıştırıyor: markalar (Aloe Via, Zeitgard)
    ile ürün tipleri (Serumlar, Nemlendiriciler) aynı grupta.
    Aşağıdaki BRANDS listesi markaları slug üzerinden ayırıp kendi
    sütununa taşır; başlık ve ürün sayısı yine ArvoARC’tan gelir.
  */
  /*
    Menü, ArvoARC koleksiyonlarından kuruluyor. Tedarikçi kategori
    ağacı (Erkek > Üst Giyim > T-Shirt) koleksiyon üstverisine
    yazıldığı için burada elle liste tutmaya gerek yok: yeni bir
    tür geldiğinde menüde kendiliğinden beliriyor.
  */
  const GENDERS = ["Erkek", "Kadın", "Çocuk", "Aksesuar"];

  /* Sütun sırası. Listede olmayan gruplar sona eklenir. */
  const GROUP_ORDER = [
    "Üst Giyim",
    "Alt Giyim",
    "Dış Giyim",
    "Alt Üst Takım",
    "İç Giyim",
    "Aksesuar",
    "Çocuk",
  ];

  /** Bir ana kategorinin sütunlarını üretir. */
  const genderSections = (gender: string) => {
    /*
      SATILABİLİR ÜRÜNÜ KALMAYAN KOLEKSİYON MENÜDE YOK.

      Sayı ArvoARC'tan geliyor ve 19.10.2026'dan beri yalnızca
      SATILABİLİR ürünü sayıyor (arc_vitrin_koleksiyonlar).
      Öncesinde Kürk gibi hepsi tükenmiş bir kategori menüde
      duruyordu: müşteri tıklıyor, baştan sona "Tükendi" rozetli
      bir rafla karşılaşıyordu.

      Burada ikinci bir süzgeç var çünkü sayı sıfırsa ArvoARC
      satırı zaten göndermiyor; bu satır eski bir önbellekten ya
      da ikizi güncellenmemiş bir kiracıdan gelen sıfırı da
      eliyor.
    */
    const own = collections.filter(
      (collection) =>
        collection.parent === gender && collection.product_count > 0,
    );

    const groups = new Map<string, StorefrontCollection[]>();
    for (const collection of own) {
      const key = collection.menu_group || "Diğer";
      const list = groups.get(key) ?? [];
      list.push(collection);
      groups.set(key, list);
    }

    return [...groups.entries()]
      .sort(([a], [b]) => {
        const ia = GROUP_ORDER.indexOf(a);
        const ib = GROUP_ORDER.indexOf(b);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      })
      .map(([title, items]) => ({
        title: title.toLocaleUpperCase("tr-TR"),
        items: items
          .sort((a, b) => b.product_count - a.product_count)
          .map((item) => ({
            ...item,
            /* Sütun başlığı zaten cinsiyeti söylüyor; başlıktaki
               tekrarı atıyoruz: "Erkek T-Shirt" → "T-Shirt". */
            title: item.title.replace(new RegExp(`^${gender}\\s+`), ""),
          })),
      }))
      .filter((section) => section.items.length > 0);
  };

  /*
    Tedarikçi bazı koleksiyon adlarına üst kategorinin tam yolunu
    yazıyor: "Kozmetik & Kişisel Bakım Erkek Parfümü". Menüde bu ad
    sütuna sığmıyor ve üç noktayla kesiliyor; müşteri Parfüm
    sekmesinde "Kozmetik & Kişisel Bakım Erkek Parfü…" okuyup
    kişisel bakım bölümünün oraya karıştığını sanıyor.

    Yol bilgisi zaten sekmenin kendisinde var. Cinsiyet sütunlarında
    aynı temizlik yukarıda yapılıyor ("Erkek T-Shirt" → "T-Shirt");
    bu, onun kategori tarafındaki karşılığı.

    Ad tamamen yok olmuyor: yalnızca öneki *ve* arkasında bir şey
    varsa kesiliyor. "Kozmetik & Kişisel Bakım" koleksiyonunun
    kendisi adını koruyor.
  */
  const PATH_PREFIXES = [
    "Kozmetik & Kişisel Bakım",
    "Kişisel Bakım",
    "Kozmetik",
  ];

  const shortTitle = (title: string) => {
    for (const prefix of PATH_PREFIXES) {
      if (!title.startsWith(`${prefix} `)) continue;
      const kalan = title.slice(prefix.length + 1).trim();
      /*
        Kalan bir kelimeyle başlamalı. Bu kontrol olmasaydı
        "Kozmetik & Kişisel Bakım" adının kendisi kısa önek olan
        "Kozmetik"e takılıp "& Kişisel Bakım"a dönüşürdü — testte
        tam olarak bu çıktı.
      */
      if (/^[\p{L}\p{N}]/u.test(kalan)) return kalan;
    }
    return title;
  };

  /*
    Menüde gizlenen koleksiyonlar.

    Bu ikisinin ürünleri artık "Erkek Parfümleri" ve "Kadın
    Parfümleri" sayfalarında birleşik olarak gösteriliyor
    (bkz. koleksiyon sayfasındaki MERGED_COLLECTIONS). Menüde ayrıca
    durmaları, aynı şeyin ikinci kez ve daha kötü bir adla
    listelenmesi olurdu: müşteri "Erkek Parfümleri" ile "Erkek
    Parfümü" arasında seçim yapmak zorunda kalıyordu.

    Sayfaları kapatılmıyor, yalnızca menüden çıkarılıyorlar; eski
    bağlantılar ve arama sonuçları çalışmaya devam ediyor.
  */
  const HIDDEN_IN_MENU = new Set([
    "kozmetik-kisisel-bakim-erkek-parfumu",
    "kozmetik-kisisel-bakim-kadin-parfumu",
  ]);

  const byGroup = (groups: string[]) =>
    collections
      .filter(
        (collection) =>
          groups.includes(collection.menu_group) &&
          !HIDDEN_IN_MENU.has(collection.slug) &&
          /* Satılabilir ürünü kalmayan koleksiyon menüde yok. */
          collection.product_count > 0,
      )
      .sort((a, b) => b.product_count - a.product_count)
      .map((collection) => ({
        ...collection,
        title: shortTitle(collection.title),
      }));

  const BRAND_NAMES = {
    care: [
      "Aloe Via",
      "Zeitgard",
      "Microsilver",
      "Beauty Diamonds",
      "Platinum",
      "Racine",
      "Nanogold",
      "L-Recapin",
      "Serox",
      "Colostrum",
      "Profesyonel Bakım",
    ],
    fragrance: ["Mood Infusion", "Iconic Elixirs"],
    /* LifeTakt (takviye hattı) 30.09.2026'da kaldırıldı: takviye edici
       gıda satışı durdu, menüde o başlık yok. Marka adı burada kalsaydı
       withoutBrands onu hâlâ eleyecek, yani olmayan bir başlık için
       süzme yapılacaktı. */
  } as const;

  const norm = (value: string) => value.toLocaleLowerCase("tr-TR");

  const brandItems = (names: readonly string[]) =>
    names
      .map((name) =>
        collections.find(
          (item) =>
            norm(item.title).includes(norm(name)) && item.product_count > 0,
        ),
      )
      .filter((item): item is StorefrontCollection => Boolean(item));

  const allBrandNames = Object.values(BRAND_NAMES).flat();

  const withoutBrands = (groups: string[]) =>
    byGroup(groups).filter(
      (item) =>
        !allBrandNames.some((name) => norm(item.title).includes(norm(name))),
    );

  /*
    CİNSİYET BAĞLANTISI KOLEKSİYONUN KENDİ SLUG'INDAN GELİYOR.

    Önceden addan türetiliyordu ve yalnızca "Kadın" elle özel durum
    olarak yazılmıştı. "Çocuk" küçük harfe çevrilince "çocuk" kalıyor,
    ArvoARC'taki slug ise "cocuk": menüdeki Çocuk sekmesi 24 ürünlük
    koleksiyon yerine boş bir "Tüm Ürünler" sayfasına gidiyordu
    (30.09.2026'da ölçüldü). Adres 404 da vermediği için hiçbir şey
    uyarmıyordu — müşteri yalnızca boş bir sayfa görüyordu.

    Artık tahmin yok: başlığı cinsiyetle aynı olan koleksiyonun kendi
    slug'ı kullanılıyor. Bulunamazsa ASCII'ye indirgenmiş yedek
    üretiliyor; "kadin" özel durumu da böylece kalktı.
  */
  const genderHref = (gender: string) => {
    const own = collections.find((item) => norm(item.title) === norm(gender));
    return `/koleksiyon/${own?.slug ?? asciiSlug(gender)}`;
  };

  const navigation = [
    /* Giyim: cinsiyet başına bir sekme. */
    ...GENDERS.map((gender) => ({
      title: gender,
      href: genderHref(gender),
      sections: genderSections(gender),
    })).filter((menu) => menu.sections.length > 0),

    {
      title: "Kişisel Bakım",
      href: "/koleksiyon/bakim",
      sections: [
        { title: "MARKA KOLEKSİYONLARI", items: brandItems(BRAND_NAMES.care) },
        {
          title: "CİLT BAKIMI",
          items: withoutBrands(["Cilt Bakımı", "Kişisel Bakım"]),
        },
        { title: "SAÇ BAKIMI", items: withoutBrands(["Saç Bakımı"]) },
        { title: "VÜCUT BAKIMI", items: withoutBrands(["Vücut Bakımı"]) },
        { title: "DİĞER BAKIMLAR", items: withoutBrands(["Diğer Bakımlar"]) },
        { title: "İHTİYACA GÖRE", items: withoutBrands(["Sorununa Göre"]) },
      ],
    },
    {
      title: "Kozmetik",
      href: "/koleksiyon/kozmetik",
      sections: [{ title: "MAKYAJ", items: byGroup(["Kozmetik"]) }],
    },
    {
      title: "Parfüm",
      href: "/koleksiyon/parfum",
      sections: [
        {
          title: "MARKA KOLEKSİYONLARI",
          items: brandItems(BRAND_NAMES.fragrance),
        },
        { title: "KİME GÖRE", items: withoutBrands(["Parfüm"]) },
      ],
    },
  ]
    .map((menu) => ({
      ...menu,
      sections: menu.sections.filter((section) => section.items.length > 0),
    }))
    /*
      BÖLÜMÜ KALMAYAN ANA BAŞLIK DA GİDİYOR.

      Süzgeç yalnızca cinsiyet sekmelerine uygulanıyordu;
      "Kozmetik" gibi tek bölümlü bir başlık, o bölümdeki
      koleksiyonların hepsi tükendiğinde boş bir açılır menüyle
      ekranda kalıyordu. Tıklanınca hiçbir şey göstermeyen bir
      başlık, olmayan başlıktan kötü.
    */
    .filter((menu) => menu.sections.length > 0);

  const bestSeller = collections.find((item) => item.title === "Çok Satanlar");
  const offers = collections.find(
    (item) => item.title === "Haftanın Fırsatları",
  );
  return (
    <>
      {/*
        ŞERİTTE TELEFONDA TEK MADDE (18.10.2026).

        Üç madde dar ekranda iki satıra taşıyor ve başlıkla
        birlikte 812 piksellik ekranın %13'ünü yiyordu — ilk
        ekranda ürün yerine kayan bir şerit duruyordu. Mağazanın
        kendi duyurusu (kargo eşiği, kupon) ticari olarak değerli
        olan; "özenli paketleme" ve "güvenli ödeme" zaten ana
        sayfadaki güvence şeridinde ve altbilgide var.

        Duyuru YOKSA ikisi kalıyor: boş bir şerit göstermektense
        genel güvenceleri göstermek.

        İNGİLİZCE SAYFADA MAĞAZA DUYURUSU GÖSTERİLMİYOR (22.10.2026,
        canlıda görüldü). İki sebep, ikisi de yeterli:

        - Metin panelden geliyor ve serbest Türkçe; çevirisi yok ve
          olamaz. Şerit "2.000 TL ÜZERİ ÜCRETSİZ KARGO" diyordu.
        - O eşik YURT İÇİ eşiği. Yurtdışında ücretsiz kargo bölgeye
          göre 250–500 $; 2.000 TL (≈41 $) harcayan müşteri ücretsiz
          kargo bekler ve ödemede kargo ücreti görür. Yanlış vaat,
          vaat etmemekten kötü.

        Tek bir dolar rakamı da yazılamaz: eşik bölgeye göre değişiyor.
        Güvenceler kalıyor, kargo vaadi ana sayfadaki "Shipping to
        your country" bölümünde ve ödeme adımında — ikisi de bölgeyi
        bilerek konuşuyor.
      */}
      <div
        className="announcement"
        data-duyuru={dil === "tr" && theme.announcement ? "var" : "yok"}
        aria-label="Mağaza duyuruları"
      >
        <div className="announcement-track">
          {/* Duyuru boşsa o madde hiç çizilmiyor: varsayılan metin
              ArvoCulture'ın kupon kodu ve kargo eşiğiydi, artık
              yansız (boş). Boş bir span şeritte sessiz bir
              boşluk bırakırdı. */}
          <div className="announcement-group">
            {dil === "tr" && theme.announcement && <span>{theme.announcement}</span>}
            <span className="announcement-ikincil">{t("ozenliPaketleme")}</span>
            <span className="announcement-ikincil">{t("guvenliOdemeSerit")}</span>
          </div>
          <div className="announcement-group" aria-hidden="true">
            {dil === "tr" && theme.announcement && <span>{theme.announcement}</span>}
            <span className="announcement-ikincil">{t("ozenliPaketleme")}</span>
            <span className="announcement-ikincil">{t("guvenliOdemeSerit")}</span>
          </div>
        </div>
      </div>
      <header className="site-header">
        <Link
          href={onek || "/"}
          className="logo"
          aria-label={`${theme.store_name ?? "Mağaza"} ana sayfa`}
          onClick={close}
        >
          <StoreLogo
            logoUrl={theme.logo_url}
            storeName={theme.store_name ?? "Mağaza"}
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Ana menü">
          <div className="mega-menu menu-featured">
            <Link
              href={`${onek}${
                bestSeller ? `/koleksiyon/${bestSeller.slug}` : "/koleksiyon/tumu"
              }`}
            >
              Yeni &amp; Çok Satan
            </Link>
          </div>
          {navigation.map((menu) => (
            <div className="mega-menu" key={menu.title}>
              <Link href={`${onek}${menu.href}`} className="mega-trigger">
                {menu.title}
              </Link>
              <div
                className={`mega-panel mega-panel-sections-${menu.sections.length}`}
              >
                <div className="mega-panel-head">
                  <p>{menu.title}</p>
                  <Link href={`${onek}${menu.href}`} prefetch={false}>
                    Tümünü gör
                  </Link>
                </div>
                <div className="mega-columns">
                  {menu.sections.map((section) => (
                    <div key={section.title}>
                      <p>{section.title}</p>
                      {/*
                        Bağlantılar ayrı bir kapta: modern temada
                        grup başlığı SOLDA, bağlantılar sağda hap
                        olarak sarıyor. Sarmalayıcı olmadan CSS
                        başlıkla bağlantıları iki ayrı hücreye
                        ayıramıyordu (ikisi de aynı kabın doğrudan
                        çocuğuydu).
                      */}
                      <div className="mega-chips">
                        {section.items.map((item) => (
                          /*
                          Önceden yükleme kapalı: mega menüdeki ~118
                          koleksiyon bağlantısı sayfa açılır açılmaz
                          sunucudan isteniyordu. Tıklayınca yükleniyor.
                        */
                          <Link
                            href={`${onek}/koleksiyon/${item.slug}`}
                            key={item.slug}
                            prefetch={false}
                          >
                            <b>{ad(item)}</b>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="actions">
          {/*
            BÜYÜTEÇ ARTIK KATMAN AÇIYOR, SAYFA DEĞİŞTİRMİYOR.

            Önceden /arama sayfasına gidiyordu: müşteri baktığı
            sayfayı terk ediyor, aradığını bulamazsa geri tuşuyla
            dönüyordu. Ana sayfadaki kutu zaten katman açıyordu;
            aynı ikon iki yerde iki farklı şey yapıyordu.

            /arama sayfası DURUYOR: paylaşılabilir bir adres ve
            katmandaki Enter (seçim yokken) oraya gidiyor.
          */}
          {theme.show_search && (
            <SearchOverlay trigger="icon" terms={searchTerms} />
          )}
          {/*
            KALP DE KATMAN AÇIYOR, SAYFA DEĞİŞTİRMİYOR.

            Favorilere bakmak çoğu zaman bir KARŞILAŞTIRMA: "bunu mu
            alsam, beğendiğim ötekini mi". Sayfadan çıkmak o
            karşılaştırmayı bozuyordu. /favoriler sayfası duruyor;
            hesap ekranından ve doğrudan adresten açılıyor.
          */}
          {theme.show_account && <FavouritesOverlay />}
          {/*
            KİŞİ SİMGESİ MENÜ AÇIYOR, SAYFA DEĞİŞTİRMİYOR.

            Giriş çoğu zaman ALIŞVERİŞİN ORTASINDA yapılıyor
            ("siparişim nerede", "adresim kayıtlı mıydı") ve
            /hesap sayfasına gitmek o akışı kesiyordu: müşteri
            baktığı ürünü ya da sepeti terk ediyor, girdikten
            sonra geri tuşuyla dönmeye çalışıyordu. Yandan çekmece
            de denendi; başlıkta duran bir simgeye ekranın öbür
            ucundan cevap veriyordu. Menü simgenin ALTINDAN
            açılıyor, kategori panelleriyle aynı yer.

            Panel sayfayla ortak; Supabase paketi tembel
            yükleniyor (bkz. account-drawer).
          */}
          {/*
            PARA BİRİMİ SEÇİCİSİ hesap ve sepetten ÖNCE: sırayla
            "neyi, ne kadara, nereden" okunuyor. Yurtdışı modu
            kapalıyken ya da kur girilmemişken hiç çizilmiyor —
            basılınca bir şey olmayan düğme, olmayan düğmeden
            kötü.
          */}
          <ParaBirimiSecici />
          {theme.show_account && (
            <AccountDrawer
              supabaseUrl={supabaseUrl}
              supabaseKey={supabaseKey}
            />
          )}
          <CartLink />
          <button
            type="button"
            className="menu-toggle"
            aria-label="Menüyü aç"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      <div className={`mobile-menu ${open ? "open" : ""}`} aria-hidden={!open}>
        <div className="mobile-menu-head">
          <span>MENÜ</span>
          <button type="button" onClick={close}>
            Kapat ×
          </button>
        </div>
        <nav>
          {/*
            Öne çıkanlar: masaüstü menünün ilk bağlantısı ("Yeni & Çok
            Satan") mobilde hiç yoktu; "Haftanın Fırsatları" işaretlemede
            vardı ama CSS'te gizliydi. İkisi de menünün başında.
          */}
          <div className="mobile-featured-list">
            <Link
              href={`${onek}${
                bestSeller ? `/koleksiyon/${bestSeller.slug}` : "/koleksiyon/tumu"
              }`}
              className="mobile-featured"
              onClick={close}
            >
              Yeni &amp; Çok Satan <span aria-hidden="true">↗</span>
            </Link>
            <Link
              href={`${onek}${offers ? `/koleksiyon/${offers.slug}` : "/koleksiyon/tumu"}`}
              className="mobile-featured"
              onClick={close}
            >
              Haftanın Fırsatları <span aria-hidden="true">↗</span>
            </Link>
          </div>
          {navigation.map((menu) => {
            const expanded = mobileSection === menu.title;
            return (
              <div className="mobile-collection-group" key={menu.title}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setMobileSection(expanded ? null : menu.title)}
                >
                  <b>{menu.title}</b>
                  <span>{expanded ? "−" : "+"}</span>
                </button>
                {expanded && (
                  <div className="mobile-submenu">
                    <Link
                      href={`${onek}${menu.href}`}
                      className="mobile-submenu-all"
                      onClick={close}
                    >
                      Tüm {menu.title} ürünleri
                    </Link>

                    {/*
                      Grup başlıkları korunuyor: "Üst Giyim",
                      "Alt Giyim". Düz bir liste hâlinde vermek
                      otuz bağlantıyı ayırt edilemez kılıyordu.
                    */}
                    {menu.sections.map((section) => (
                      <div className="mobile-group" key={section.title}>
                        <small>{section.title}</small>
                        <div className="mobile-chips">
                          {section.items.map((item) => (
                            <Link
                              href={`${onek}/koleksiyon/${item.slug}`}
                              key={item.slug}
                              onClick={close}
                            >
                              {item.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/*
          Yardımcı bağlantılar. Kategorilerin altı boştu; favoriler,
          hesap ve yardım masaüstünde başlıkta, mobilde yalnızca alt
          çubukta (Hesabım) duruyordu.
        */}
        <div className="mobile-utility">
          {theme.show_account && (
            <>
              <Link href="/favoriler" onClick={close}>
                Favorilerim
              </Link>
              <Link href="/hesap" onClick={close} prefetch={false}>
                Hesabım ve siparişlerim
              </Link>
            </>
          )}
          <Link href="/sss" onClick={close}>
            Sıkça sorulanlar
          </Link>
          <Link href="/iletisim" onClick={close}>
            İletişim
          </Link>
        </div>
      </div>
      {open && (
        <button
          type="button"
          className="menu-backdrop"
          aria-label="Menüyü kapat"
          onClick={close}
        />
      )}
    </>
  );
}
