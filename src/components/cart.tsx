"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { formatPrice, type Product } from "@/lib/products";

type CartItem = Pick<
  Product,
  "slug" | "name" | "price" | "image" | "eyebrow"
> & { quantity: number };
type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  add: (product: Product) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
};

const CART_KEY = "arvo-cart-v2";
const EMPTY = "[]";
const listeners = new Set<() => void>();
const getSnapshot = () => localStorage.getItem(CART_KEY) ?? EMPTY;
const getServerSnapshot = () => EMPTY;
const subscribe = (callback: () => void) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
const write = (items: CartItem[]) => {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  listeners.forEach((listener) => listener());
};
const CartContext = createContext<CartValue>({
  items: [],
  count: 0,
  total: 0,
  add: () => {},
  remove: () => {},
  setQuantity: () => {},
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const items = useMemo(() => {
    try {
      return JSON.parse(snapshot) as CartItem[];
    } catch {
      return [];
    }
  }, [snapshot]);
  const add = useCallback((product: Product) => {
    const current = JSON.parse(getSnapshot()) as CartItem[];
    const existing = current.find((item) => item.slug === product.slug);
    write(
      existing
        ? current.map((item) =>
            item.slug === product.slug
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        : [
            ...current,
            {
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              eyebrow: product.eyebrow,
              quantity: 1,
            },
          ],
    );
  }, []);
  const remove = useCallback(
    (slug: string) =>
      write(
        (JSON.parse(getSnapshot()) as CartItem[]).filter(
          (item) => item.slug !== slug,
        ),
      ),
    [],
  );
  const setQuantity = useCallback(
    (slug: string, quantity: number) =>
      write(
        (JSON.parse(getSnapshot()) as CartItem[]).map((item) =>
          item.slug === slug
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
      value={{ items, count, total, add, remove, setQuantity }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function CartLink() {
  const { count } = useContext(CartContext);
  return (
    <Link
      className="cart-link"
      href="/sepet"
      aria-label={`Sepet, ${count} ürün`}
    >
      Sepet <span>{count}</span>
    </Link>
  );
}

export function AddButton({ product }: { product: Product }) {
  const { add } = useContext(CartContext);
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="button button-dark full"
      disabled={done}
      onClick={() => {
        add(product);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Sepete eklendi ✓" : "Sepete ekle"}
    </button>
  );
}

export function CartView() {
  const { items, total, remove, setQuantity } = useContext(CartContext);
  if (!items.length)
    return (
      <div className="empty-cart">
        <h2>Sepetiniz boş.</h2>
        <p>
          ArvoCulture seçkisinden tarzınıza ve ritüelinize eşlik edecek ürünleri
          keşfedin.
        </p>
        <Link className="button button-dark" href="/koleksiyon/tumu">
          Alışverişe devam et
        </Link>
      </div>
    );
  return (
    <div className="cart-layout">
      <section className="cart-items">
        {items.map((item) => (
          <article className="cart-item" key={item.slug}>
            <Link className="cart-thumb" href={`/urun/${item.slug}`}>
              {item.image ? (
                <Image src={item.image} alt={item.name} fill sizes="140px" />
              ) : (
                <span>AC</span>
              )}
            </Link>
            <div>
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>
                <Link href={`/urun/${item.slug}`}>{item.name}</Link>
              </h2>
              <p>{formatPrice(item.price)}</p>
              <div className="quantity">
                <button
                  type="button"
                  onClick={() => setQuantity(item.slug, item.quantity - 1)}
                  aria-label="Adedi azalt"
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(item.slug, item.quantity + 1)}
                  aria-label="Adedi artır"
                >
                  +
                </button>
              </div>
            </div>
            <button
              type="button"
              className="remove-item"
              onClick={() => remove(item.slug)}
            >
              Kaldır
            </button>
          </article>
        ))}
      </section>
      <aside className="cart-summary">
        <p className="eyebrow">SİPARİŞ ÖZETİ</p>
        <div>
          <span>Ara toplam</span>
          <b>{formatPrice(total)}</b>
        </div>
        <div>
          <span>Kargo</span>
          <b>{total >= 2000 ? "Ücretsiz" : "Ödeme adımında"}</b>
        </div>
        <div className="cart-total">
          <span>Toplam</span>
          <b>{formatPrice(total)}</b>
        </div>
        <Link className="button button-dark full" href="/odeme">
          Güvenli ödemeye geç
        </Link>
        <small>Güvenli ödeme · 14 gün içinde iade · Özenli paketleme</small>
      </aside>
    </div>
  );
}
