"use client";

import { useParaBirimi } from "@/components/para-birimi";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { readRecent } from "@/lib/recent";
import { useProductList } from "@/lib/use-product-list";
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
  Sonuç kartı.

  Sonuçlar önce SATIR olarak çiziliyordu (64px küçük görsel, ad,
  fiyat). Dar alanda çok sonuç sığıyordu ama ürün görseli
  tanınacak kadar büyük değildi; katalog fotoğrafa dayanan bir
  katalog ve müşteri ürünü adından değil görselinden tanıyor.

  Kart hem arama sonuçlarında hem boş durumdaki "son
  gezdikleriniz"de kullanılıyor: iki kopya, birinde düzeltilen bir
  hizalamanın öbüründe kalması demekti.
*/
function Kart({
  slug,
  ad,
  ust,
  fiyat,
  eskiFiyat,
  gorsel,
  artStyle,
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
  artStyle?: string;
  aktif?: boolean;
  onNavigate?: () => void;
  onHover?: () => void;
}) {
  /* Fiyatlar seçili para biriminde (para-birimi.tsx). */
  const { yaz } = useParaBirimi();
  const off =
    eskiFiyat && eskiFiyat > fiyat
      ? Math.round((1 - fiyat / eskiFiyat) * 100)
      : 0;

  return (
    <article
      className="card"
      /* Yurtdışı modunda gönderilemeyen ürün arama sonucunda da
         görünmemeli: gizleme kuralı bu niteliğe tutunuyor
         (lib/yurtdisi-gizleme). */
      data-urun={slug}
      /* Klavyeyle seçili kart imleçle gezilen kartla AYNI
         görünüyor: iki ayrı vurgu dili öğrenilmesi gereken bir şey
         olurdu. */
      data-aktif={aktif ? "true" : undefined}
      onMouseEnter={onHover}
    >
      <Link
        href={`/urun/${slug}`}
        className="card-art"
        aria-label={ad}
        onClick={onNavigate}
        data-art={artStyle}
      >
        {gorsel && (
          <Image
            src={gorsel}
            alt={ad}
            fill
            sizes="(max-width: 640px) 44vw, (max-width: 980px) 29vw, (max-width: 1280px) 21vw, min(17vw, 270px)"
          />
        )}
      </Link>

      {ust && (
        <p className="card-brand">
          <span>{ust}</span>
        </p>
      )}
      <h3>
        <Link href={`/urun/${slug}`} onClick={onNavigate}>
          {ad}
        </Link>
      </h3>

      <div className="price">
        <b>{yaz(fiyat)}</b>
        {eskiFiyat && eskiFiyat > fiyat && <del>{yaz(eskiFiyat)}</del>}
        {/* Metin ürün kartındaki rozetle aynı: tek başına bir eksi
            işareti ve sayı ne olduğunu söylemiyordu. */}
        {off > 0 && <span className="price-off">%{off} indirim</span>}
      </div>
    </article>
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
   * Sonuç düzeni ARTIK İKİSİNDE DE AYNI (kart); bu alan yalnızca
   * katmanı arama sayfasından ayırıyor.
   *
   * "list": açılır katman — alan boşken son gezilen ürünler de
   * gösteriliyor. "grid": arama sayfası — oraya zaten bir sorguyla
   * geliniyor, son gezilenler orada yer kaplardı.
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
  const listeRef = useRef<HTMLDivElement | null>(null);

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
          /*
            TEMİZLE ALANA AİT, KATMANA DEĞİL.

            "Temizle" ile "Kapat" yan yana ve AYNI hapta duruyordu;
            ikisi de aynı ağırlıkta görünüyor ama biri yazıyı
            siliyor, diğeri aramadan çıkıyor. Yanlışlıkla kapatan
            müşteri aramasını baştan yazmak zorunda kalıyordu.

            Temizle artık alanın içinde küçük bir çarpı: alanın
            parçası olduğu yerinden belli oluyor ve kapatmayla
            karışmıyor.
          */
          <button
            type="button"
            className="live-clear"
            onClick={() => setQuery("")}
            aria-label="Aramayı temizle"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 7l10 10M17 7 7 17" />
            </svg>
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
            <div className="grid">
              {gezilenUrunler.slice(0, 5).map((urun) => (
                <Kart
                  key={urun.slug}
                  slug={urun.slug}
                  ad={urun.name}
                  ust={urun.eyebrow}
                  fiyat={urun.price}
                  eskiFiyat={urun.oldPrice}
                  gorsel={urun.image}
                  artStyle={urun.artStyle}
                  onNavigate={onNavigate}
                />
              ))}
            </div>
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

      {/*
        SONUÇLAR KART. Önce satır olarak çiziliyordu ve 64px'lik
        görsel ürünü tanımaya yetmiyordu; katalog fotoğrafa dayanıyor
        ve müşteri ürünü adından değil görselinden tanıyor.

        Katman ve arama sayfası aynı düzeni kullanıyor: ikisi aynı
        işi yapıyor, iki ayrı düzen öğrenilmesi gereken bir fark
        olurdu. `variant` yalnızca son gezilenlerin NEREDE
        gösterileceğini ayırıyor.
      */}
      {typed && results.length > 0 && (
        <div className="grid" ref={listeRef}>
          {results.map((item, index) => (
            <Kart
              key={item.slug}
              slug={item.slug}
              ad={item.name}
              ust={item.brand}
              fiyat={item.price}
              eskiFiyat={item.oldPrice}
              gorsel={item.image}
              artStyle={item.artStyle}
              aktif={index === aktifGuvenli}
              onNavigate={onNavigate}
              onHover={() => setAktif(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
