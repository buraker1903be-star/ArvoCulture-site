"use client";

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useMemo, useState } from "react";
import { formatPrice } from "@/lib/product-types";
import { searchProducts } from "@/lib/search";
import type { SearchItem } from "@/lib/search-index";

/**
 * Canlı arama.
 *
 * İlk harften itibaren sonuç gösterir; arama butonuna basmak
 * gerekmez. Dizin sunucudan hazır geldiği için filtreleme
 * tarayıcıda yapılır — her tuşta ağ isteği atılmaz, sonuç anında
 * gelir.
 *
 * `useDeferredValue`: yazma işlemi her zaman akıcı kalır, ağır
 * liste hesabı bir adım geriden gelir.
 */
export function LiveSearch({
  items,
  initialQuery = "",
  autoFocus = false,
  limit = 24,
  variant = "list",
  onNavigate,
}: {
  items: SearchItem[];
  initialQuery?: string;
  autoFocus?: boolean;
  limit?: number;
  /**
   * "grid": arama sayfası — görseller büyük, kart düzeni.
   * "list": açılır katman — dar alanda çok sonuç sığsın diye satır.
   */
  variant?: "grid" | "list";
  onNavigate?: () => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const deferred = useDeferredValue(query);

  const results = useMemo(
    () => searchProducts(items, deferred).slice(0, limit),
    [items, deferred, limit],
  );

  const typed = deferred.trim().length > 0;

  return (
    <div className="live-search">
      <div className="live-field">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4 4" />
        </svg>
        <input
          type="search"
          value={query}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus={autoFocus}
          placeholder="Ürün, marka veya kategori ara"
          aria-label="Ürün ara"
          onChange={(event) => setQuery(event.target.value)}
        />
        {typed && (
          <button type="button" onClick={() => setQuery("")}>
            Temizle
          </button>
        )}
      </div>

      {typed && (
        <p className="live-count" role="status">
          {results.length > 0
            ? `${results.length} sonuç`
            : "Sonuç bulunamadı"}
        </p>
      )}

      {typed && results.length === 0 && (
        <p className="live-empty">
          Farklı bir kelime deneyin ya da{" "}
          <Link href="/koleksiyon/tumu" onClick={onNavigate}>
            tüm ürünlere
          </Link>{" "}
          göz atın.
        </p>
      )}

      {results.length > 0 && variant === "list" && (
        <ul className="live-results">
          {results.map((item) => (
            <li key={item.slug}>
              <Link href={`/urun/${item.slug}`} onClick={onNavigate}>
                <span className="live-thumb">
                  {item.image && (
                    <Image src={item.image} alt="" fill sizes="64px" />
                  )}
                </span>
                <span className="live-text">
                  <small>{item.brand}</small>
                  <strong>{item.name}</strong>
                </span>
                <span className="live-price">
                  {formatPrice(item.price)}
                  {item.oldPrice && item.oldPrice > item.price && (
                    <del>{formatPrice(item.oldPrice)}</del>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results.length > 0 && variant === "grid" && (
        <div className="grid">
          {results.map((item) => {
            const off =
              item.oldPrice && item.oldPrice > item.price
                ? Math.round((1 - item.price / item.oldPrice) * 100)
                : 0;

            return (
              <article className="card" key={item.slug}>
                <Link
                  href={`/urun/${item.slug}`}
                  className="card-art"
                  aria-label={item.name}
                  onClick={onNavigate}
                >
                  {off > 0 && (
                    <span className="card-flags">
                      <b className="tag tag-sale">%{off} indirim</b>
                    </span>
                  )}
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width:640px) 50vw,(max-width:980px) 33vw,(max-width:1280px) 25vw,20vw"
                    />
                  )}
                </Link>

                <p className="card-brand">{item.brand}</p>
                <h3>
                  <Link href={`/urun/${item.slug}`} onClick={onNavigate}>
                    {item.name}
                  </Link>
                </h3>

                <div className="price">
                  <b>{formatPrice(item.price)}</b>
                  {item.oldPrice && item.oldPrice > item.price && (
                    <del>{formatPrice(item.oldPrice)}</del>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
