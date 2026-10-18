"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  useEffect,
} from "react";
import { CartDrawer } from "@/components/cart-drawer";
import { type Product, displayVariantLabel } from "@/lib/product-types";
import type { StorefrontDiscount } from "@/lib/discounts";
import { DEFAULT_SALES_RULES, type SalesRules } from "@/lib/order-quote";

/*
  Sepet kalemi.

  `sku` varyantı tanımlar; sipariş bunun üzerinden kurulur.
  Önceden yalnızca ürün slug’ı taşınıyordu ve müşteri "L" seçse
  bile sipariş herhangi bir varyanta bağlanıyor, yanlış beden
  gönderiliyordu.

  `key` sepetteki satırın kimliğidir: aynı ürünün iki farklı
  bedeni sepette ayrı satır olmalı.
*/
type CartItem = Pick<
  Product,
  "slug" | "name" | "price" | "image" | "eyebrow"
> & {
  /*
    Üstü çizili fiyat; satırın İNDİRİMLİ olup olmadığını bu söylüyor
    ("indirimdeki ürünlerde geçerli değildir" kuralı,
    lib/coupon → kuponaTabiToplam).

    Müşterinin tarayıcısında DURAN eski sepetlerde bu alan yok ve
    orada satır indirimsiz sayılıyor: bilinmeyeni "indirimli" saymak
    hak edilen indirimi vermemek olurdu. Yeni eklenen her satırda
    alan var, yani sepet kendiliğinden tazeleniyor.
  */
  oldPrice?: number;
  /*
    Üstü çizili fiyat SORULDU mu?

    `oldPrice` yokluğu iki ayrı şey demek: "bu ürün indirimli
    değil" ve "bu satır alan yazılmadan önce eklenmiş". İkincisi
    kuponun indirimli üründe geçmesine yol açıyordu. Bayrak ikisini
    ayırıyor ve onarımın her sayfa yüklenişinde tekrar istek
    atmasını engelliyor.
  */
  oldPriceSoruldu?: true;
  quantity: number;
  sku?: string;
  variantLabel?: string;
};

/** Sepet satırının kimliği: varyant varsa SKU, yoksa slug. */
export const cartKey = (item: { slug: string; sku?: string }) =>
  item.sku ?? item.slug;
/** Sepete eklenirken seçilen varyant. */
export type CartVariant = {
  sku: string;
  /* Yer tutucu başlıklar etikete dönüşmediği için boş kalabilir. */
  label?: string;
  price?: number;
  /*
    VARYANTIN KENDİ ÜSTÜ ÇİZİLİ FİYATI (compare_at_price, TL).

    Satırın indirimli sayılıp sayılmayacağını bu belirliyor ve
    ölçüt ArvoARC'ınkiyle AYNI olmak zorunda: orada kupon
    `v.compare_at_price > v.price` olan satırı dışarıda
    bırakıyor (migration 20261018134829). Ürünün değil VARYANTIN
    alanı, çünkü ArvoARC da varyanta bakıyor.
  */
  oldPrice?: number;
};

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product, variant?: CartVariant) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  discounts: StorefrontDiscount[];
  /** Mağazanın kargo ve havale ayarları (ArvoARC'tan, sunucuda okunur). */
  salesRules: SalesRules;
};

const CART_KEY = "arvo-cart-v2";
const EMPTY = "[]";
const listeners = new Set<() => void>();
const getSnapshot = () => localStorage.getItem(CART_KEY) ?? EMPTY;
const getServerSnapshot = () => EMPTY;
const subscribe = (callback: () => void) => {
  listeners.add(callback);
  /* Başka sekmede ya da PayTR çerçevesinde açılan onay sayfasında
     yapılan değişiklik de bu pencereye yansısın. */
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
};
const write = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
};

/**
 * Sipariş tamamlandığında sepeti boşaltır (bkz. order-cleanup.tsx).
 * Önceden sepet hiçbir yerde temizlenmiyordu: sipariş veren müşteri
 * aynı ürünleri sepetinde görmeye devam ediyor, yanlışlıkla ikinci
 * kez sipariş verebiliyordu.
 */
export const clearCart = () => write([]);
export const CartContext = createContext<CartValue>({
  items: [],
  count: 0,
  total: 0,
  add: () => {},
  remove: () => {},
  setQuantity: () => {},
  discounts: [],
  salesRules: DEFAULT_SALES_RULES,
});

export function CartProvider({
  children,
  discounts,
  salesRules = DEFAULT_SALES_RULES,
}: {
  children: React.ReactNode;
  discounts: StorefrontDiscount[];
  salesRules?: SalesRules;
}) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const items = useMemo(() => {
    try {
      const stored = JSON.parse(snapshot) as CartItem[];
      /*
        Müşterinin sepetinde önceden kaydedilmiş satırlar da
        temizleniyor: yer tutucu varyant başlıkları ("Default
        Title") daha önce sepete yazılmış olabilir ve düzeltme
        yalnızca yeni eklenenleri kapsasaydı eski sepetler bozuk
        kalırdı.
      */
      return stored.map((item) =>
        item.variantLabel && !displayVariantLabel({ title: item.variantLabel })
          ? { ...item, variantLabel: undefined }
          : item,
      );
    } catch {
      return [];
    }
  }, [snapshot]);

  /*
    ESKİ SEPETLERİN ONARIMI (18.10.2026).

    `oldPrice` alanı bugüne kadar karttan eklenen satırlara hiç
    yazılmıyordu ve bu, "indirimdeki ürünlerde geçerli değildir"
    kuralını sessizce kapatıyordu: satır indirimsiz sayılıyor,
    kupon ona da uygulanıyordu. Kural düzeldi ama MÜŞTERİNİN
    TARAYICISINDA DURAN sepetler düzelmiyor — kendiliğinden
    tazelenmeleri için müşterinin o satırı silip yeniden eklemesi
    gerekirdi.

    Burada yapılan şey sepete müdahale DEĞİL: fiyat, adet ve
    kalemler olduğu gibi kalıyor; yalnızca eksik olan üstü çizili
    fiyat kaynağından tamamlanıyor. Bir kez soruluyor
    (`oldPriceSoruldu`), yanıt alınamazsa bir dahaki açılışta
    yeniden denenecek şekilde işaretlenmiyor.
  */
  const onarimYapildi = useRef(false);
  useEffect(() => {
    if (onarimYapildi.current) return;

    const mevcut = JSON.parse(getSnapshot()) as CartItem[];
    const eksikler = mevcut.filter(
      (satir) => satir.sku && !satir.oldPriceSoruldu && satir.oldPrice === undefined,
    );
    if (eksikler.length === 0) return;
    onarimYapildi.current = true;

    void (async () => {
      try {
        const yanit = await fetch("/api/sepet-indirimleri", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kalemler: eksikler.map((s) => ({ slug: s.slug, sku: s.sku })),
          }),
        });
        if (!yanit.ok) return;
        const veri = (await yanit.json()) as {
          satirlar: Array<{ sku: string; bilinen?: true; oldPrice?: number }>;
        };
        const harita = new Map(
          veri.satirlar.filter((s) => s.bilinen).map((s) => [s.sku, s.oldPrice]),
        );
        if (harita.size === 0) return;

        /* Arada başka sekmede değişmiş olabilir; en güncel hâl
           okunup üstüne yazılıyor. */
        const guncel = JSON.parse(getSnapshot()) as CartItem[];
        write(
          guncel.map((satir) =>
            satir.sku && harita.has(satir.sku)
              ? {
                  ...satir,
                  oldPrice: harita.get(satir.sku),
                  oldPriceSoruldu: true as const,
                }
              : satir,
          ),
        );
      } catch (hata) {
        /* Onarım ikincil iş: başarısızlığı sepeti bozmuyor,
           yalnızca kural eski satırlarda kapalı kalıyor. */
        console.error(hata);
      }
    })();
  }, []);

  const add = useCallback((product: Product, variant?: CartVariant) => {
    const current = JSON.parse(getSnapshot()) as CartItem[];

    // Aynı ürünün farklı bedeni ayrı satırdır.
    const key = variant?.sku ?? product.slug;
    const existing = current.find((item) => cartKey(item) === key);

    write(
      existing
        ? current.map((item) =>
            cartKey(item) === key
              ? { ...item, quantity: Math.min(20, item.quantity + 1) }
              : item,
          )
        : [
            ...current,
            {
              slug: product.slug,
              name: product.name,
              // Varyant fiyatı ürün fiyatından farklı olabilir.
              price: variant?.price ?? product.price,
              /*
                ÜSTÜ ÇİZİLİ FİYAT: ÖNCE VARYANTIN KENDİSİ.

                Burada `variant?.price ? undefined : product.oldPrice`
                yazıyordu ve KURALI SESSİZCE KAPATIYORDU: karttan
                hızlı eklenen her ürün bir varyantla geliyor, yani
                `oldPrice` hep undefined kalıyor, satır indirimsiz
                sayılıyor ve "indirimdeki ürünlerde geçerli
                değildir" kuponu o satıra da uygulanıyordu
                (18.10.2026'da canlıda görüldü: ARVO10, %25
                indirimli kreme de indirim yaptı).

                Gerekçesi kısmen doğruydu — varyant fiyatı ürün
                fiyatından FARKLIYSA ürünün üstü çizili fiyatı o
                satır için anlamsız. Ama o durumda yapılacak şey
                alanı silmek değil, VARYANTIN kendi üstü çizili
                fiyatını kullanmak; ArvoARC da ona bakıyor.

                Ürünün alanına yalnızca varyant fiyatı ürün
                fiyatıyla aynıysa düşülüyor.
              */
              oldPrice:
                variant?.oldPrice ??
                (!variant || variant.price === undefined ||
                variant.price === product.price
                  ? product.oldPrice
                  : undefined),
              /* Kaynağından yazıldı; onarıma gerek yok. */
              oldPriceSoruldu: true,
              image: product.image,
              eyebrow: product.eyebrow,
              quantity: 1,
              sku: variant?.sku,
              variantLabel: variant?.label,
            },
          ],
    );
  }, []);
  const remove = useCallback(
    (key: string) =>
      write(
        (JSON.parse(getSnapshot()) as CartItem[]).filter(
          (item) => cartKey(item) !== key,
        ),
      ),
    [],
  );
  const setQuantity = useCallback(
    (key: string, quantity: number) =>
      write(
        (JSON.parse(getSnapshot()) as CartItem[]).map((item) =>
          cartKey(item) === key
            ? { ...item, quantity: Math.max(1, Math.min(20, quantity)) }
            : item,
        ),
      ),
    [],
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  return (
    <CartContext.Provider
      value={{ items, count, total, add, remove, setQuantity, discounts, salesRules }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Başlıktaki sepet düğmesi. Sayfaya gitmek yerine çekmeceyi açar;
 * müşteri alışverişe kaldığı yerden devam edebilir.
 */
export function CartLink() {
  const { count } = useContext(CartContext);
  const [open, setOpen] = useState(false);

  /*
    Alt çubuktaki sepet sekmesi bu olayı gönderiyor. Başlıktaki
    düğmeyle aynı çekmeceyi açıyor; telefonda sepete bakmak için
    sayfadan çıkmak gerekmiyor.
  */
  useEffect(() => {
    const ac = () => setOpen(true);
    window.addEventListener("arvo:cart", ac);
    return () => window.removeEventListener("arvo:cart", ac);
  }, []);

  return (
    <>
      <button
        type="button"
        className="cart-link"
        onClick={() => setOpen(true)}
        aria-label={`Sepet, ${count} ürün`}
        aria-haspopup="dialog"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M6 8h12l-1 11.5a1.5 1.5 0 0 1-1.5 1.4h-9A1.5 1.5 0 0 1 5 19.5Z" />
          <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
        </svg>
        <span className="cart-count">{count}</span>
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
