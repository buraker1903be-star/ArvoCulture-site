"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CartLink } from "./cart";
import type { StorefrontTheme } from "@/lib/storefront-theme";

const categories = [
  {
    label: "Giyim",
    href: "/koleksiyon/giyim",
    note: "Oversize · Regular Fit · Basic",
  },
  {
    label: "Kişisel Bakım",
    href: "/koleksiyon/bakim",
    note: "Cilt · Saç · Vücut",
  },
  {
    label: "Kozmetik",
    href: "/koleksiyon/kozmetik",
    note: "Ten · Göz · Dudak",
  },
  {
    label: "Parfüm",
    href: "/koleksiyon/parfum",
    note: "Kadın · Erkek · Unisex",
  },
  {
    label: "Takviyeler",
    href: "/koleksiyon/takviyeler",
    note: "Günlük yaşam · Spor",
  },
];

export function Header({ theme }: { theme: StorefrontTheme }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
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
                  <Link href="/koleksiyon/tumu"><b>Yeni gelenler</b><span>↗</span></Link>
                  <Link href="/koleksiyon/tumu"><b>Çok satanlar</b><span>↗</span></Link>
                </div>
                <div className="mega-columns">
                  <div>
                    <p>GİYİM</p>
                    <Link href="/koleksiyon/giyim"><b>Tüm Giyim</b><small>Yeni sezon seçkisi</small></Link>
                    <Link href="/koleksiyon/giyim"><b>Tişörtler</b><small>Oversize · Regular Fit</small></Link>
                  </div>
                  <div>
                    <p>BAKIM &amp; GÜZELLİK</p>
                    <Link href="/koleksiyon/bakim"><b>Kişisel Bakım</b><small>Cilt · Saç · Vücut</small></Link>
                    <Link href="/koleksiyon/kozmetik"><b>Kozmetik</b><small>Ten · Göz · Dudak</small></Link>
                    <Link href="/koleksiyon/parfum"><b>Parfüm</b><small>Kadın · Erkek · Unisex</small></Link>
                  </div>
                  <div>
                    <p>LIFESTYLE</p>
                    <Link href="/koleksiyon/takviyeler"><b>Takviyeler</b><small>Günlük yaşam desteği</small></Link>
                    <Link href="/hakkimizda"><b>Hikâyemiz</b><small>ArvoCulture dünyası</small></Link>
                  </div>
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
          {categories.map((item, index) => (
            <Link href={item.href} key={item.href} onClick={close}>
              <span>0{index + 1}</span>
              <b>{item.label}</b>
              <small>{item.note}</small>
            </Link>
          ))}
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
