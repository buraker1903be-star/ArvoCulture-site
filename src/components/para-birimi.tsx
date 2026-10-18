"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dolara, dolarYazisi } from "@/lib/dolar";
import { formatPrice } from "@/lib/product-types";
import type { SalesRules } from "@/lib/order-quote";

/**
 * Para birimi ve dil seçimi.
 *
 * ÇEVİRİ TARAYICIDA, SUNUCUDA DEĞİL. Fiyatı sunucuda çevirmek
 * için seçimi çerezden okumak gerekirdi; çerez okuyan bir sayfa
 * Next'te dinamikleşiyor ve ürün sayfasının altmış saniyelik rota
 * önbelleği düşüyor. Bu depoda o önbelleği düşüren bir değişiklik
 * 3.400 ürün sayfasını bir kez 500'e düşürdü (18.10.2026). Sunucu
 * her zaman TL basıyor; dolar seçiliyse tarayıcı çeviriyor.
 *
 * Bedeli: dolar modunda sayfa bir an TL gösterip dolara dönüyor.
 * Arama motoru da TL görüyor — Türkçe vitrin zaten asıl sayfa.
 *
 * SEÇİM TARAYICIDA KALIYOR (localStorage): müşteri her sayfada
 * yeniden seçmesin. Sunucuya gitmediği için önbelleği de
 * bozmuyor.
 */

export type ParaBirimi = "TRY" | "USD";

const ANAHTAR = "arvo-para-birimi";

type Deger = {
  paraBirimi: ParaBirimi;
  /** Yurtdışı modu açık ve kur tanımlı mı? */
  dolarVar: boolean;
  secildi: (birim: ParaBirimi) => void;
  /** Lira tutarını seçili para biriminde yazar. */
  yaz: (lira: number) => string;
};

const Baglam = createContext<Deger | null>(null);

export function ParaBirimiSaglayici({
  salesRules,
  children,
}: {
  salesRules: SalesRules;
  children: React.ReactNode;
}) {
  const [paraBirimi, setParaBirimi] = useState<ParaBirimi>("TRY");

  const dolarVar =
    salesRules.internationalEnabled && (salesRules.usdRate ?? 0) > 0;

  useEffect(() => {
    if (!dolarVar) return;
    /*
      Kayıtlı seçim bir söz zinciriyle okunuyor: kural, etki
      içinde EŞZAMANLI setState'i zincirleme render riski
      sayıyor. Okunamazsa (gizli sekme, kapalı depolama) TL'de
      kalıyor — sessizce dolara geçmek, fiyatı yanlış sanan bir
      müşteri üretirdi.
    */
    void Promise.resolve().then(() => {
      try {
        if (localStorage.getItem(ANAHTAR) === "USD") setParaBirimi("USD");
      } catch {
        /* yok sayılıyor */
      }
    });
  }, [dolarVar]);

  const secildi = useCallback((birim: ParaBirimi) => {
    setParaBirimi(birim);
    try {
      localStorage.setItem(ANAHTAR, birim);
    } catch {
      /* Seçim bu oturumda yine de geçerli. */
    }
  }, []);

  const deger = useMemo<Deger>(() => {
    const dolarda = paraBirimi === "USD" && dolarVar;
    return {
      paraBirimi: dolarda ? "USD" : "TRY",
      dolarVar,
      secildi,
      yaz: (lira: number) => {
        if (!dolarda) return formatPrice(lira);
        const usd = dolara(lira, salesRules.usdRate, salesRules.usdMarginPercent);
        /* Kur bir şekilde kaybolduysa TL'ye dönülüyor: boş ya da
           uydurma bir fiyat göstermektense doğru para birimini
           göstermek. */
        return usd === null ? formatPrice(lira) : dolarYazisi(usd);
      },
    };
  }, [paraBirimi, dolarVar, secildi, salesRules.usdRate, salesRules.usdMarginPercent]);

  return <Baglam.Provider value={deger}>{children}</Baglam.Provider>;
}

/**
 * Fiyat yazımı.
 *
 * Sağlayıcı yoksa TL'ye düşüyor — hata fırlatmıyor: bu kanca
 * ürün kartı gibi her yerde kullanılıyor ve bir sayfada sağlayıcı
 * unutulursa fiyatın hiç görünmemesi, TL görünmesinden kötü.
 */
export function useParaBirimi(): Deger {
  return (
    useContext(Baglam) ?? {
      paraBirimi: "TRY" as const,
      dolarVar: false,
      secildi: () => {},
      yaz: (lira: number) => formatPrice(lira),
    }
  );
}

/** Başlıktaki TR₺ / EN$ seçici. */
export function ParaBirimiSecici() {
  const { paraBirimi, dolarVar, secildi } = useParaBirimi();

  /* Mod kapalıyken ya da kur yokken düğme HİÇ çizilmiyor: basılınca
     hiçbir şey olmayan bir düğme, olmayan düğmeden kötü. */
  if (!dolarVar) return null;

  return (
    <div className="para-secici" role="group" aria-label="Para birimi">
      <button
        type="button"
        aria-pressed={paraBirimi === "TRY"}
        onClick={() => secildi("TRY")}
      >
        TR ₺
      </button>
      <button
        type="button"
        aria-pressed={paraBirimi === "USD"}
        onClick={() => secildi("USD")}
      >
        EN $
      </button>
    </div>
  );
}

/**
 * Fiyat yazısı.
 *
 * Sunucuda çizilen sayfalarda da kullanılabilsin diye ayrı bir
 * istemci bileşeni: ürün sayfası sunucu bileşeni ve kancayı
 * doğrudan çağıramıyor.
 *
 * SUNUCU TL BASIYOR, tarayıcı gerekirse dolara çeviriyor — rota
 * önbelleği bu yüzden bozulmuyor (bkz. yukarıdaki not).
 */
export function Fiyat({ lira }: { lira: number }) {
  const { yaz } = useParaBirimi();
  return <>{yaz(lira)}</>;
}
