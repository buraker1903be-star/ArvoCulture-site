"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/product-types";
import type { SearchItem } from "@/lib/search-index";

/**
 * Canlı arama.
 *
 * İlk harften itibaren sonuç gösterir; arama butonuna basmak
 * gerekmez. Dizin artık sunucuda: 3.100 ürünlük listeyi her
 * ziyaretçiye indirtmek yerine yazdıkça /api/arama sorgulanıyor.
 * Ana sayfa bu yüzden 1,8 MB taşıyordu.
 *
 * Yazma hissi korunuyor: istek 180 ms geciktiriliyor, önceki istek
 * iptal ediliyor ve yeni sonuç gelene kadar eski liste ekranda
 * kalıyor. Böylece her tuşta liste boşalıp yeniden dolmuyor.
 */

type Durum = "bos" | "yukleniyor" | "hazir" | "hata";

export function LiveSearch({
  initialQuery = "",
  autoFocus = false,
  limit = 24,
  variant = "list",
  onNavigate,
  suggestions = [],
}: {
  initialQuery?: string;
  autoFocus?: boolean;
  limit?: number;
  /**
   * "grid": arama sayfası — görseller büyük, kart düzeni.
   * "list": açılır katman — dar alanda çok sonuç sığsın diye satır.
   */
  variant?: "grid" | "list";
  onNavigate?: () => void;
  /**
   * Sık arananlar. Alan boşken ve sonuç çıkmadığında gösterilir;
   * tıklanan terim aramaya yazılır, sayfadan çıkılmaz.
   */
  suggestions?: string[];
}) {
  const [query, setQuery] = useState(initialQuery);

  /*
    Sonuçlar ait oldukları sorguyla birlikte tutuluyor. Böylece
    "bu liste hangi aramanın cevabı" sorusunu durum değişkeniyle
    değil, verinin kendisiyle cevaplıyoruz — geç dönen bir yanıtın
    yeni sorgunun üstüne yazması da imkânsız hâle geliyor.
  */
  const [cevap, setCevap] = useState<{
    q: string;
    items: SearchItem[];
    total: number;
  }>({
    q: "",
    items: [],
    total: 0,
  });
  const [hataliSorgu, setHataliSorgu] = useState<string | null>(null);

  /* Uçuştaki istek: yeni harf gelince öncekini iptal ediyoruz. */
  const istek = useRef<AbortController | null>(null);

  const aranan = query.trim();

  useEffect(() => {
    if (aranan.length === 0) {
      istek.current?.abort();
      return;
    }

    /* Her tuşta değil, yazma duraklayınca istek atılıyor. */
    const zamanlayici = setTimeout(() => {
      istek.current?.abort();
      const controller = new AbortController();
      istek.current = controller;

      fetch(`/api/arama?q=${encodeURIComponent(aranan)}&limit=${limit}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const data = (await response.json()) as {
            results?: SearchItem[];
            total?: number;
          };
          const items = Array.isArray(data.results) ? data.results : [];
          setCevap({
            q: aranan,
            items,
            total: typeof data.total === "number" ? data.total : items.length,
          });
        })
        .catch((error) => {
          /* İptal edilen istek hata değil; kullanıcı yazmaya devam
             ettiği için bilerek durduruldu. */
          if ((error as Error).name === "AbortError") return;
          console.error("Arama isteği başarısız:", error);
          setHataliSorgu(aranan);
        });
    }, 180);

    return () => clearTimeout(zamanlayici);
  }, [aranan, limit]);

  const typed = aranan.length > 0;
  const hazir = cevap.q === aranan;
  const hata = hataliSorgu === aranan;
  const durum: Durum = !typed
    ? "bos"
    : hata
      ? "hata"
      : hazir
        ? "hazir"
        : "yukleniyor";

  /*
    Yeni sonuç gelene kadar eski liste ekranda kalıyor. Aksi hâlde
    her tuş vuruşunda liste boşalıp yeniden doluyor ve arama
    tökezliyormuş gibi hissettiriyor.
  */
  const results = cevap.items;

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
          {/*
            Sonuç sayısı yalnızca yanıt geldiğinde yazılıyor.
            Yükleniyorken "Sonuç bulunamadı" yazmak, bir an için
            müşteriye aradığının olmadığını söylemek olurdu.
          */}
          {durum === "hata"
            ? "Arama şu anda kullanılamıyor."
            : durum === "yukleniyor"
              ? "Aranıyor…"
              : results.length > 0
                ? cevap.total > results.length
                  ? `İlk ${results.length} · toplam ${cevap.total} sonuç`
                  : `${results.length} sonuç`
                : "Sonuç bulunamadı"}
        </p>
      )}

      {typed && durum === "hazir" && results.length === 0 && (
        <p className="live-empty">
          Farklı bir kelime deneyin ya da{" "}
          <Link href="/koleksiyon/tumu" onClick={onNavigate}>
            tüm ürünlere
          </Link>{" "}
          göz atın.
        </p>
      )}

      {/*
        Sık arananlar: alan boşken nereden başlanacağını, sonuç
        çıkmadığında ne denenebileceğini gösteriyor.
      */}
      {suggestions.length > 0 &&
        (!typed || (durum === "hazir" && results.length === 0)) && (
          <div className="live-suggest">
            <p className="search-heading">
              {typed ? "Şunları deneyin" : "Sık arananlar"}
            </p>
            <div className="search-terms">
              {suggestions.map((term) => (
                <button
                  type="button"
                  key={term}
                  onClick={() => setQuery(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

      {typed && results.length > 0 && variant === "list" && (
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

      {typed && results.length > 0 && variant === "grid" && (
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
                  data-art={item.artStyle}
                >
                  {/* İndirim görselin üstünde değil, fiyat satırında: ürün
                      kartı ve ürün sayfasıyla aynı karar. */}
                  {item.image && (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 40vw, (max-width: 980px) 29vw, (max-width: 1280px) 21vw, min(17vw, 270px)"
                    />
                  )}
                </Link>

                <p className="card-brand">
                  <span>{item.brand}</span>
                </p>
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
                  {off > 0 && <span className="price-off">−%{off}</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
