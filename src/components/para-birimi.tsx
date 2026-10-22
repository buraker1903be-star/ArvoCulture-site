"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { dolara, dolarYazisi } from "@/lib/dolar";
import { ceviri, type Dil, type SozlukAnahtari } from "@/lib/sozluk";
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
  /*
    DİL PARA BİRİMİNE BAĞLI. Başlıktaki düğme "TR ₺ / EN $" diyor;
    iki ayrı seçim dört bileşim üretirdi (İngilizce + lira gibi) ve
    ikisinin de müşterisi yok (lib/sozluk).
  */
  dil: Dil;
  /** Arayüz metni, seçili dilde. */
  t: (anahtar: SozlukAnahtari) => string;
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
    /*
      `data-para` NİTELİĞİ DE ÇEVRİLİYOR. Yurtdışına gönderilemeyen
      ürünlerin kartları ona bağlı bir CSS kuralıyla gizleniyor
      (lib/yurtdisi-gizleme). Niteliği yalnızca sayfa açılışındaki
      satır içi betik koyuyordu; müşteri düğmeye basınca fiyatlar
      dolara dönüyor ama gönderilemeyen ürünler ekranda KALIYORDU.
    */
    if (typeof document !== "undefined") {
      if (birim === "USD") document.documentElement.dataset.para = "usd";
      else delete document.documentElement.dataset.para;
    }
  }, []);

  const deger = useMemo<Deger>(() => {
    const dolarda = paraBirimi === "USD" && dolarVar;
    const dil: Dil = dolarda ? "en" : "tr";
    return {
      paraBirimi: dolarda ? "USD" : "TRY",
      dolarVar,
      secildi,
      dil,
      t: (anahtar: SozlukAnahtari) => ceviri(anahtar, dil),
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
      /* Sağlayıcı yoksa Türkçe: vitrinin asıl dili Türkçe ve bir
         sayfada sağlayıcı unutulursa metnin İngilizce çıkması
         sessiz bir hata olurdu. */
      dil: "tr" as const,
      t: (anahtar: SozlukAnahtari) => ceviri(anahtar, "tr"),
    }
  );
}

/** Başlıktaki TR₺ / EN$ seçici. */
export function ParaBirimiSecici() {
  const { paraBirimi, dolarVar, secildi } = useParaBirimi();
  const yol = usePathname();
  const router = useRouter();

  /* Mod kapalıyken ya da kur yokken düğme HİÇ çizilmiyor: basılınca
     hiçbir şey olmayan bir düğme, olmayan düğmeden kötü. */
  if (!dolarVar) return null;

  /*
    ANA SAYFADA SEÇİM ADRES DEĞİŞTİRİR.

    İngilizce ana sayfanın içeriği Türkçesinden farklı: raflar
    yalnızca yurtdışına gönderilebilen ürünlerden kuruluyor. Aynı
    adreste kalıp yalnızca fiyatı çevirmek, "Çok satanlar" rafını boş
    bir şeride çeviriyordu — o raf tamamen gönderilemeyen cilt bakım
    kataloğundan kurulu.

    Öteki sayfalarda adres değişmiyor: orada çeviri gerçekten yalnızca
    fiyat ve arayüz metni.
  */
  const sec = (birim: ParaBirimi) => {
    secildi(birim);
    if (birim === "USD" && yol === "/") router.push("/en");
    else if (birim === "TRY" && yol === "/en") router.push("/");
  };

  return (
    <div className="para-secici" role="group" aria-label="Para birimi">
      <button
        type="button"
        aria-pressed={paraBirimi === "TRY"}
        onClick={() => sec("TRY")}
      >
        TR ₺
      </button>
      <button
        type="button"
        aria-pressed={paraBirimi === "USD"}
        onClick={() => sec("USD")}
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

/**
 * Arayüz metni, seçili dilde — `Fiyat`'ın metin karşılığı.
 *
 * Sipariş onayı, ödeme hatası ve sipariş takibi SUNUCU sayfaları:
 * kancayı doğrudan çağıramıyorlar. Sunucu Türkçe basıyor, İngilizce
 * seçiliyse tarayıcı çeviriyor — aynı gerekçe, aynı bedel (sayfa bir
 * an Türkçe görünüp dönüyor; rota önbelleği bozulmuyor).
 */
export function Metin({ anahtar }: { anahtar: SozlukAnahtari }) {
  const { t } = useParaBirimi();
  return <>{t(anahtar)}</>;
}

/*
  Tarih, seçili dilde. Dilim her iki dilde de TÜRKİYE: sipariş Türkiye
  saatiyle kaydediliyor ve müşteriye gönderilen e-postalar da o saati
  yazıyor; yurtdışındaki müşterinin kendi saatine çevirmek, aynı
  siparişe iki ayrı zaman yazmak olurdu.
*/
const TARIH_BICIMI = {
  timeZone: "Europe/Istanbul",
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
} as const;

export function Tarih({ iso }: { iso: string }) {
  const { dil } = useParaBirimi();
  return <>{new Intl.DateTimeFormat(dil === "en" ? "en-GB" : "tr-TR", TARIH_BICIMI).format(new Date(iso))}</>;
}
