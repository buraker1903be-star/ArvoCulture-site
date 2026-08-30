"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CartLink } from "./cart";
import type { StorefrontTheme } from "@/lib/storefront-theme";
import type { StorefrontCollection } from "@/lib/collections";

export function Header({ theme, collections }: { theme: StorefrontTheme; collections: StorefrontCollection[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const collectionColumns = [
    { title: "GİYİM", groups: ["Giyim"], limit: 6 },
    { title: "CİLT & BAKIM", groups: ["Kişisel Bakım", "Cilt Bakımı", "Sorununa Göre"], limit: 7 },
    { title: "SAÇ & VÜCUT", groups: ["Saç Bakımı", "Vücut Bakımı", "Diğer Bakımlar"], limit: 7 },
    { title: "GÜZELLİK & YAŞAM", groups: ["Kozmetik", "Parfüm", "Takviyeler"], limit: 7 },
  ].map((column) => ({
    ...column,
    items: collections
      .filter((collection) => column.groups.includes(collection.menu_group))
      .sort((a, b) => b.product_count - a.product_count || a.title.localeCompare(b.title, "tr"))
      .slice(0, column.limit),
  }));
  const bestSeller = collections.find((item) => item.title === "Çok Satanlar");
  const offers = collections.find((item) => item.title === "Haftanın Fırsatları");
  return (
    <>
      <div className="announcement">
        <div className="announcement-track">
          <span>{theme.announcement}</span>
          <span>ÖZENLİ PAKETLEME</span>
          <span>GÜVENLİ ÖDEME</span>
          <span>{theme.announcement}</span>
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
          <div className="mega-menu mega-shop">
            <button type="button">
              Alışveriş <span>⌄</span>
            </button>
            <div className="mega-panel">
              <div className="mega-panel-main">
                <div className="mega-quick">
                  <Link href={offers ? `/koleksiyon/${offers.slug}` : "/koleksiyon/tumu"}><b>Haftanın fırsatları</b><span>↗</span></Link>
                  <Link href={bestSeller ? `/koleksiyon/${bestSeller.slug}` : "/koleksiyon/tumu"}><b>Çok satanlar</b><span>↗</span></Link>
                </div>
                <div className="mega-columns">
                  {collectionColumns.map((column) => <div key={column.title}>
                    <p>{column.title}</p>
                    {column.items.map((item) => <Link href={`/koleksiyon/${item.slug}`} key={item.slug}><b>{item.title}</b><small>{item.product_count} ürün</small></Link>)}
                  </div>)}
                </div>
              </div>
              <aside className="mega-feature">
                <div />
                <p>BEAUTY &amp; CARE</p>
                <h3>Kendine iyi bak.</h3>
                <Link href="/koleksiyon/bakim">Bakım seçkisi ↗</Link>
              </aside>
            </div>
          </div>
          <Link href="/koleksiyon/tumu">Yeni &amp; Çok Satan</Link>
          <Link href="/koleksiyon/bakim">Kişisel Bakım</Link>
          <Link href="/koleksiyon/giyim">Giyim</Link>
          <Link href="/koleksiyon/parfum">Parfüm</Link>
        </nav>
        <div className="actions">
          {theme.show_search && (
            <Link href="/arama" aria-label="Ara">
              Ara
            </Link>
          )}
          {theme.show_account && <Link href="/hesap">Hesap</Link>}
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
          {collectionColumns.map((column) => <div className="mobile-collection-group" key={column.title}>
            <p>{column.title}</p>
            {column.items.map((item) => <Link href={`/koleksiyon/${item.slug}`} key={item.slug} onClick={close}><b>{item.title}</b><small>{item.product_count} ürün</small></Link>)}
          </div>)}
          <Link href="/hakkimizda" onClick={close}>
            <span>06</span>
            <b>Hikâyemiz</b>
            <small>ArvoCulture dünyası</small>
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
