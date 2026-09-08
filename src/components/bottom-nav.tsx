"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { CartContext } from "@/components/cart";

/**
 * Mobil alt gezinme çubuğu.
 *
 * Telefonda üst menüye uzanmak zor; başparmak ekranın altında
 * duruyor. Uygulama hissi veren en belirleyici öğe budur:
 * ana işlevler her ekranda, parmağın altında.
 *
 * Yalnızca mobilde görünür; masaüstünde CSS ile gizlenir.
 */
const TABS = [
  { href: "/", label: "Ana sayfa", icon: "home" },
  { href: "/arama", label: "Ara", icon: "search" },
  /* "Menü" gezinmez, kategori menüsünü açar. */
  { href: null, label: "Menü", icon: "menu" },
  { href: "/sepet", label: "Sepet", icon: "bag" },
  { href: "/hesap", label: "Hesabım", icon: "user" },
] as const;

const ICONS: Record<string, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  menu: (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </>
  ),
  bag: (
    <>
      <path d="M5.5 8h13l-1 12h-11z" />
      <path d="M9 8V6.2A3 3 0 0 1 12 3a3 3 0 0 1 3 3.2V8" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.7-3.7 3.5-5.5 7-5.5s6.3 1.8 7 5.5" />
    </>
  ),
};

export function BottomNav() {
  const pathname = usePathname();
  const { count } = useContext(CartContext);

  return (
    <nav className="bottom-nav" aria-label="Ana gezinme">
      {TABS.map((tab) => {
        /*
          "Menü" sekmesi bir sayfaya gitmez; başlıktaki kategori
          menüsünü açar. İletişim özel bir olayla kuruluyor:
          başlık ve alt çubuk ayrı bileşenler ve aralarında
          ortak bir sarmalayıcı yok.
        */
        if (!tab.href) {
          return (
            <button
              key={tab.label}
              type="button"
              onClick={() => window.dispatchEvent(new Event("arvo:menu"))}
            >
              <span className="bottom-nav-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  {ICONS[tab.icon]}
                </svg>
              </span>
              <small>{tab.label}</small>
            </button>
          );
        }

        // Ana sayfa yalnızca tam eşleşmede etkin sayılır.
        const active =
          tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
          >
            <span className="bottom-nav-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {ICONS[tab.icon]}
              </svg>
              {tab.icon === "bag" && count > 0 && (
                <em aria-hidden="true">{count > 9 ? "9+" : count}</em>
              )}
            </span>
            <small>{tab.label}</small>
          </Link>
        );
      })}
    </nav>
  );
}
