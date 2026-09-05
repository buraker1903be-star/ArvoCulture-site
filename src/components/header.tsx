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
  const byGroup = (groups: string[], limit = 99) =>
    collections
      .filter((collection) => groups.includes(collection.menu_group))
      .sort(
        (a, b) =>
          b.product_count - a.product_count ||
          a.title.localeCompare(b.title, "tr"),
      )
      .slice(0, limit);

  /** Marka koleksiyonları — slug sabittir, başlık ARC'tan gelir. */
  const BRANDS = {
    apparel: ["the-society-collection"],
    /*
      LR ürün aileleri. Bir marka koleksiyonu ARC'a eklendiğinde
      slug'ını buraya yazın; aksi hâlde "ürün tipine göre"
      sütununda görünür.
    */
    care: [
      "aloe-vera-cilt-bakim-urunleri",
      "lr-zeitgard",
      "lr-microsilver-plus-urunleri",
      "beauty-diamonds-cilt-bakim-serisi",
      "zg-pro-cilt-bakim-cihazlari-ve-setleri",
      "lr-racine",
      "lr-serox",
      "lr-colostrum",
      "lr-aloe-via-men",
      "lr-vitalbeauty",
    ],
    fragrance: [
      "mood-infusion-parfum-koleksiyonu",
      "iconic-elixirs-parfum-koleksiyonu",
    ],
    supplements: ["lr-lifetakt"],
  } as const;

  const allBrandSlugs = new Set<string>(Object.values(BRANDS).flat());

  /** Verilen slug sırasına sadık kalarak koleksiyonları getirir. */
  const bySlug = (slugs: readonly string[]) =>
    slugs
      .map((slug) => collections.find((item) => item.slug === slug))
      .filter((item): item is StorefrontCollection => Boolean(item));

  /** Marka koleksiyonlarını dışarıda bırakır; tekrar görünmesinler. */
  const withoutBrands = (groups: string[], limit = 99) =>
    byGroup(groups, 40)
      .filter((item) => !allBrandSlugs.has(item.slug))
      .slice(0, limit);

  const navigation = [
    {
      title: "Giyim",
      href: "/koleksiyon/giyim",
      sections: [
        {
          title: "MARKA KOLEKSİYONLARI",
          items: bySlug(BRANDS.apparel),
        },
        { title: "KESİME GÖRE", items: withoutBrands(["Giyim"]) },
      ],
    },
    {
      title: "Kişisel Bakım",
      href: "/koleksiyon/bakim",
      /*
        Her menu_group kendi sütununda durur. Birleştirilirse
        müşteri "saç ürünü arıyorum" derken cilt ve vücut
        ürünlerinin arasında aramak zorunda kalıyor.
      */
      sections: [
        { title: "MARKA KOLEKSİYONLARI", items: bySlug(BRANDS.care) },
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
          items: bySlug(BRANDS.fragrance),
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
          items: bySlug(BRANDS.supplements),
        },
        { title: "İHTİYACA GÖRE", items: withoutBrands(["Takviyeler"]) },
      ],
    },
  ].map((menu) => ({
    ...menu,
    // Boş kalan sütun gösterilmez; marka koleksiyonu tanımlı
    // olmayan kategoride başlık boşuna yer kaplamasın.
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
                    <Link href={menu.href} onClick={close}>
                      <b>Tüm {menu.title} ürünleri</b>
                      <small>Seçkiyi gör</small>
                    </Link>
                    {menu.sections.flatMap((section) =>
                      section.items.map((item) => (
                        <Link
                          href={`/koleksiyon/${item.slug}`}
                          key={item.slug}
                          onClick={close}
                        >
                          <b>{item.title}</b>
                          <small>{item.product_count}</small>
                        </Link>
                      )),
                    )}
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
      <nav className="mobile-dock" aria-label="Hızlı erişim">
        <Link href="/" aria-label="Ana sayfa" onClick={close}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M3.5 11.5 12 4l8.5 7.5" />
            <path d="M6.5 10v10h11V10" />
          </svg>
          <span>Ana sayfa</span>
        </Link>
        <Link href="/arama" aria-label="Ara" onClick={close}>
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
          <span>Ara</span>
        </Link>
        <button
          type="button"
          aria-label="Koleksiyon menüsünü aç"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <span>Keşfet</span>
        </button>
        <CartLink />
      </nav>
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
