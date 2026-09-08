"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CartLink } from "./cart";
import type { StorefrontTheme } from "@/lib/storefront-theme";
import type { StorefrontCollection } from "@/lib/collections";

export function Header({ theme, collections }: { theme: StorefrontTheme; collections: StorefrontCollection[] }) {
  const [open, setOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const close = () => setOpen(false);
  /*
    Koleksiyonları menu_group'a göre getirir. ARC'taki gruplandırma
    iki farklı ekseni karıştırıyor: markalar (Aloe Via, Zeitgard)
    ile ürün tipleri (Serumlar, Nemlendiriciler) aynı grupta.
    Aşağıdaki BRANDS listesi markaları slug üzerinden ayırıp kendi
    sütununa taşır; başlık ve ürün sayısı yine ARC'tan gelir.
  */
  /*
    Menü, ARC koleksiyonlarından kuruluyor. Tedarikçi kategori
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
    const own = collections.filter(
      (collection) => collection.parent === gender,
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

  const byGroup = (groups: string[]) =>
    collections
      .filter((collection) => groups.includes(collection.menu_group))
      .sort((a, b) => b.product_count - a.product_count);

  const BRAND_NAMES = {
    care: [
      "Aloe Via", "Zeitgard", "Microsilver", "Beauty Diamonds",
      "Platinum", "Racine", "Nanogold", "L-Recapin", "Serox",
      "Colostrum", "Profesyonel Bakım",
    ],
    fragrance: ["Mood Infusion", "Iconic Elixirs"],
    supplements: ["LifeTakt"],
  } as const;

  const norm = (value: string) => value.toLocaleLowerCase("tr-TR");

  const brandItems = (names: readonly string[]) =>
    names
      .map((name) =>
        collections.find((item) => norm(item.title).includes(norm(name))),
      )
      .filter((item): item is StorefrontCollection => Boolean(item));

  const allBrandNames = Object.values(BRAND_NAMES).flat();

  const withoutBrands = (groups: string[]) =>
    byGroup(groups).filter(
      (item) =>
        !allBrandNames.some((name) => norm(item.title).includes(norm(name))),
    );

  const navigation = [
    /* Giyim: cinsiyet başına bir sekme. */
    ...GENDERS.map((gender) => ({
      title: gender,
      href: `/koleksiyon/${gender === "Kadın" ? "kadin" : gender.toLocaleLowerCase("tr-TR")}`,
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
    {
      title: "Takviyeler",
      href: "/koleksiyon/takviyeler",
      sections: [
        {
          title: "MARKA KOLEKSİYONLARI",
          items: brandItems(BRAND_NAMES.supplements),
        },
        { title: "İHTİYACA GÖRE", items: withoutBrands(["Takviyeler"]) },
      ],
    },
  ].map((menu) => ({
    ...menu,
    sections: menu.sections.filter((section) => section.items.length > 0),
  }));

  const bestSeller = collections.find((item) => item.title === "Çok Satanlar");
  const offers = collections.find((item) => item.title === "Haftanın Fırsatları");
  return (
    <>
      <div className="announcement" aria-label="Mağaza duyuruları">
        <div className="announcement-track">
          <div className="announcement-group">
            <span>{theme.announcement}</span>
            <span>ÖZENLİ PAKETLEME</span>
            <span>GÜVENLİ ÖDEME</span>
          </div>
          <div className="announcement-group" aria-hidden="true">
            <span>{theme.announcement}</span>
            <span>ÖZENLİ PAKETLEME</span>
            <span>GÜVENLİ ÖDEME</span>
          </div>
        </div>
      </div>
      <header className="site-header">
        <Link
          href="/"
          className="logo"
          aria-label={`${theme.store_name ?? "ArvoCulture"} ana sayfa`}
          onClick={close}
        >
          <Image
            src="/arvoculture-logo-transparent.png"
            alt={theme.store_name ?? "ArvoCulture"}
            width={320}
            height={39}
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Ana menü">
          <div className="mega-menu menu-featured">
            <Link href={bestSeller ? `/koleksiyon/${bestSeller.slug}` : "/koleksiyon/tumu"}>
              Yeni &amp; Çok Satan
            </Link>
          </div>
          {navigation.map((menu) => (
            <div className="mega-menu" key={menu.title}>
              <Link href={menu.href} className="mega-trigger">
                {menu.title} <span>⌄</span>
              </Link>
              <div
                className={`mega-panel mega-panel-sections-${menu.sections.length}`}
              >
                <div className="mega-panel-head">
                  <p>{menu.title}</p>
                  <Link href={menu.href}>Tümünü gör ↗</Link>
                </div>
                <div className="mega-columns">
                  {menu.sections.map((section) => (
                    <div key={section.title}>
                      <p>{section.title}</p>
                      {section.items.map((item) => (
                        <Link href={`/koleksiyon/${item.slug}`} key={item.slug}>
                          <b>{item.title}</b>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>
        <div className="actions">
          {theme.show_search && (
            <Link href="/arama" aria-label="Ara" className="header-action-link">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
              <span>Ara</span>
            </Link>
          )}
          {theme.show_account && (
            <Link href="/hesap" aria-label="Hesabım" className="header-action-link">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.5" />
                <path d="M5.5 20c.7-4 3-6 6.5-6s5.8 2 6.5 6" />
              </svg>
              <span>Hesap</span>
            </Link>
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
          <Link
            href={offers ? `/koleksiyon/${offers.slug}` : "/koleksiyon/tumu"}
            className="mobile-featured"
            onClick={close}
          >
            Haftanın Fırsatları <span>↗</span>
          </Link>
          {navigation.map((menu) => {
            const expanded = mobileSection === menu.title;
            return (
              <div className="mobile-collection-group" key={menu.title}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() =>
                    setMobileSection(expanded ? null : menu.title)
                  }
                >
                  <b>{menu.title}</b>
                  <span>{expanded ? "−" : "+"}</span>
                </button>
                {expanded && (
                  <div className="mobile-submenu">
                    <Link
                      href={menu.href}
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
                              href={`/koleksiyon/${item.slug}`}
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
          <Link href="/hakkimizda" className="mobile-story" onClick={close}>
            Hikâyemiz <span>↗</span>
          </Link>
        </nav>
        <div>
          <Link href="/arama" onClick={close}>
            Arama
          </Link>
          <Link href="/hesap" onClick={close}>
            Hesap
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
