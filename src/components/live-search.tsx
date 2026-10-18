"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readRecent } from "@/lib/recent";
import { useProductList } from "@/lib/use-product-list";
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

/*
  Sonuç satırı. Hem arama sonuçları hem de boş durumdaki "son
  gezdikleriniz" aynı satırı kullanıyor: iki ayrı kopya,
  birinde düzeltilen bir hizalamanın öbüründe kalması demekti.
*/
function Satir({
  slug,
  ad,
  ust,
  fiyat,
  eskiFiyat,
  gorsel,
  aktif,
  onNavigate,
  onHover,
}: {
  slug: string;
  ad: string;
  ust?: string;
  fiyat: number;
  eskiFiyat?: number;
  gorsel?: string;
  aktif?: boolean;
  onNavigate?: () => void;
  onHover?: () => void;
}) {
  return (
    <li>
      <Link
        href={`/urun/${slug}`}
        onClick={onNavigate}
        /* Seçili satır imleçle gezilen satırla AYNI görünüyor:
           iki ayrı vurgu dili öğrenilmesi gereken bir şey olurdu. */
        data-aktif={aktif ? "true" : undefined}
        onMouseEnter={onHover}
      >
        <span className="live-thumb">
          {gorsel && <Image src={gorsel} alt="" fill sizes="64px" />}
        </span>
        <span className="live-text">
          <small>{ust}</small>
          <strong>{ad}</strong>
        </span>
        <span className="live-price">
          {formatPrice(fiyat)}
          {eskiFiyat && eskiFiyat > fiyat && <del>{formatPrice(eskiFiyat)}</del>}
        </span>
      </Link>
    </li>
  );
}

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
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  /*
    KLAVYEYLE GEZİNME.

    Sonuçlar ilk harften beri geliyordu ama klavyeyle seçilemiyordu:
    ok tuşları imleci yazı içinde gezdiriyor, Enter HİÇBİR ŞEY
    yapmıyordu — form yok, tuş dinleyicisi yoktu. Yazıp Enter'a
    basan müşteri hiçbir tepki alamıyordu.

    -1 "hiçbiri seçili değil" demek; o durumda Enter arama
    sayfasına gidiyor (listenin tamamı), seçiliyken ürüne.
  */
  const [aktif, setAktif] = useState(-1);
  const listeRef = useRef<HTMLUListElement | null>(null);

  /*
    BOŞ DURUM BOŞ KALMIYOR.

    Katman açıldığında ekranda yalnızca bir alan ve sık aranan
    terimler vardı; sayfanın en çok tıklanan düğmesi müşteriyi boş
    bir kutuya götürüyordu. Son gezdiği ürünler tarayıcısında zaten
    duruyor (lib/recent) ve "kaldığı yere dönmek" aramanın en sık
    sebeplerinden biri.

    Ana sayfadan kaldırılan raf tam olarak bu: orada dört rafın
    altında kimse görmüyordu, burada ilk görülen şey.
  */
  const [gezilen, setGezilen] = useState<string[] | null>(null);
  useEffect(() => {
    // Tek seferlik başlangıç değeri; zincirleme render riski yok.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGezilen(readRecent());
  }, []);

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
    /* Tam eşleşme bulunamadı, liste yakın sonuçlardan oluşuyor. */
    yaklasik: boolean;
    duzeltme?: string;
  }>({
    q: "",
    items: [],
    total: 0,
    yaklasik: false,
    duzeltme: undefined,
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
            yaklasik?: boolean;
            duzeltme?: string;
          };
          const items = Array.isArray(data.results) ? data.results : [];
          setCevap({
            q: aranan,
            items,
            total: typeof data.total === "number" ? data.total : items.length,
            yaklasik: data.yaklasik === true,
            duzeltme:
              typeof data.duzeltme === "string" ? data.duzeltme : undefined,
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

  /*
    Seçili satır listeden taşmasın: sonuç sayısı küçüldüğünde
    (yeni sorgu, daha az sonuç) eski indis listenin dışında
    kalıyordu ve Enter tanımsız bir ürüne gidiyordu.
  */
  const aktifGuvenli = aktif < results.length ? aktif : -1;

  /* Yazmaya başlayınca istek atılmıyor: boş dizi "liste biliniyor
     ve boş" demek, null "henüz okunmadı". */
  const { durum: gezilenDurum, products: gezilenUrunler } = useProductList(
    "/api/urunler",
    typed ? [] : gezilen,
  );

  /* Seçili satır görünür alanda tutuluyor; ok tuşuyla aşağı inen
     müşteri listenin görünmeyen kısmına "düşmüyor". */
  useEffect(() => {
    if (aktifGuvenli < 0) return;
    listeRef.current?.children[aktifGuvenli]?.scrollIntoView({
      block: "nearest",
    });
  }, [aktifGuvenli]);

  function tusla(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      const secili = aktifGuvenli >= 0 ? results[aktifGuvenli] : null;
      if (!secili && !aranan) return;
      event.preventDefault();
      onNavigate?.();
      /* Seçim yoksa listenin tamamına: Enter bugüne kadar hiçbir
         şey yapmıyordu ve "arama" denince beklenen ilk tuş o. */
      router.push(
        secili
          ? `/urun/${secili.slug}`
          : `/arama?q=${encodeURIComponent(aranan)}`,
      );
      return;
    }

    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setAktif((i) => (i + 1 >= results.length ? 0 : i + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setAktif((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  }

  /*
    YAKIN SONUÇ AÇIKÇA SÖYLENİYOR. "kadın parfümü" aramasında
    katalogda "kadın" kelimesi hiç geçmiyor; dönen 43 parfüm
    aradığının tam karşılığıymış gibi sunulsaydı müşteri yanlış ürünü
    aradığını sanırdı.
  */
  const kesit =
    cevap.total > results.length
      ? `ilk ${results.length} · toplam ${cevap.total} sonuç`
      : `${results.length} sonuç`;
  /*
    Yazım düzeltildiyse müşteriye NE ARANDIĞI söyleniyor.
    "Tam eşleşme yok · yakın 43 sonuç" demek, neyin gösterildiğini
    anlatmıyor ve müşterinin yanlış yazdığını fark etmesini
    engelliyordu — bir sonraki aramasında aynı hatayı yapıyor.
  */
  const sayiMetni = cevap.duzeltme
    ? `“${cevap.duzeltme}” için ${kesit}`
    : cevap.yaklasik
      ? `Tam eşleşme yok · yakın ${kesit}`
      : kesit.charAt(0).toLocaleUpperCase("tr-TR") + kesit.slice(1);

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
          autoFocus={autoFocus}
          placeholder="Ürün, marka veya kategori ara"
          aria-label="Ürün ara"
          onChange={(event) => {
            setQuery(event.target.value);
            /* Yeni harf yeni liste demek; eski satırın seçili
               kalması Enter'ı yanlış ürüne gönderirdi. */
            setAktif(-1);
          }}
          onKeyDown={tusla}
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
                ? sayiMetni
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
        Son gezilenler yalnızca katmanda ve alan boşken. Arama
        sayfasında (variant="grid") gösterilmiyor: oraya zaten bir
        sorguyla geliniyor.

        İki üründen az varsa çizilmiyor; tek satırlık bir "son
        gezdikleriniz" başlığı, başlığın kendisinden az bilgi
        taşıyor.
      */}
      {!typed &&
        variant === "list" &&
        gezilenDurum === "hazir" &&
        gezilenUrunler.length >= 2 && (
          <div className="live-recent">
            <p className="search-heading">Son gezdikleriniz</p>
            <ul className="live-results">
              {gezilenUrunler.slice(0, 4).map((urun) => (
                <Satir
                  key={urun.slug}
                  slug={urun.slug}
                  ad={urun.name}
                  ust={urun.eyebrow}
                  fiyat={urun.price}
                  eskiFiyat={urun.oldPrice}
                  gorsel={urun.image}
                  onNavigate={onNavigate}
                />
              ))}
            </ul>
          </div>
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
        <ul className="live-results" ref={listeRef}>
          {results.map((item, index) => (
            <Satir
              key={item.slug}
              slug={item.slug}
              ad={item.name}
              ust={item.brand}
              fiyat={item.price}
              eskiFiyat={item.oldPrice}
              gorsel={item.image}
              aktif={index === aktifGuvenli}
              onNavigate={onNavigate}
              onHover={() => setAktif(index)}
            />
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
                  {/* Metin ürün kartındaki rozetle aynı: tek başına
                      bir eksi işareti ve sayı ne olduğunu
                      söylemiyordu (18.10.2026). */}
                  {off > 0 && <span className="price-off">%{off} indirim</span>}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
