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
  onNavigate,
}: {
  items: SearchItem[];
  initialQuery?: string;
  autoFocus?: boolean;
  limit?: number;
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

      {results.length > 0 && (
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
    </div>
  );
}
