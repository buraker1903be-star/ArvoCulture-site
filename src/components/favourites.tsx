"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAuthClient } from "@/lib/auth-client";
import { readFavourites, writeFavourites } from "@/lib/favourites";

/**
 * Favori listesinin tek sahibi.
 *
 * Favoriler iki yerde yaşayabilir:
 *
 *   Misafir müşteri — yalnızca tarayıcıda. Üyelik zorunlu değil;
 *   favorilemek için giriş istemek gereksiz sürtünme yaratır.
 *
 *   Üye müşteri — veritabanında (arc_customer_favourites). Hangi
 *   cihazdan girerse girsin aynı listeyi görür, tarayıcı verisini
 *   temizlese de listesi durur. Kayıt yalnızca müşteri kalbe tekrar
 *   dokununca silinir.
 *
 * Giriş anında tarayıcıdaki liste hesaba taşınıp birleştirilir:
 * müşteri misafirken beğendiği hiçbir ürünü kaybetmez.
 *
 * Çıkışta tarayıcıdaki liste temizlenir. Bu bilinçli: aynı
 * bilgisayarda başka bir müşteri giriş yaparsa, bir öncekinin
 * favorileri onun hesabına karışmamalı.
 */

type FavouritesContextValue = {
  slugs: string[];
  isFavourite: (slug: string) => boolean;
  toggle: (slug: string) => void;
  /** Hesapla eşitleme sürüyor mu? Düğmeler buna göre kilitlenmez,
      yalnızca liste ekranı bir bekleme durumu gösterebilir. */
  syncing: boolean;
};

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

const TABLE = "arc_customer_favourites";

/** Sıra korunarak birleştirme: önce hesaptakiler, sonra yeniler. */
const union = (first: string[], second: string[]) => [
  ...first,
  ...second.filter((slug) => !first.includes(slug)),
];

export function FavouritesProvider({
  supabaseUrl,
  supabaseKey,
  children,
}: {
  supabaseUrl: string;
  supabaseKey: string;
  children: React.ReactNode;
}) {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  /* Oturum sahibi. Aynı kullanıcı için tekrar tekrar eşitlememek
     için tutuluyor: token yenilendiğinde de olay tetikleniyor. */
  const syncedUser = useRef<string | null>(null);

  const client = useMemo<SupabaseClient | null>(() => {
    if (!supabaseUrl || !supabaseKey) return null;
    try {
      return getAuthClient(supabaseUrl, supabaseKey);
    } catch {
      return null;
    }
  }, [supabaseUrl, supabaseKey]);

  /** Hesaptaki listeyi eklenme sırasına göre okur. */
  const fetchRemote = useCallback(async (): Promise<string[]> => {
    if (!client) return [];
    const { data, error } = await client
      .from(TABLE)
      .select("product_slug")
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data ?? [])
      .map((row) => (row as { product_slug: string }).product_slug)
      .filter((slug): slug is string => typeof slug === "string");
  }, [client]);

  /**
   * Giriş yapmış müşteri için tarayıcı ve hesap listelerini
   * birleştirir. Misafirken eklenenler hesaba yazılır.
   */
  const syncWithAccount = useCallback(async () => {
    if (!client) return;

    setSyncing(true);
    try {
      const local = readFavourites();
      const remote = await fetchRemote();

      const missing = local.filter((slug) => !remote.includes(slug));
      if (missing.length > 0) {
        /* user_id sütununun varsayılanı auth.uid(); istemci
           kimlik göndermiyor, RLS başkasının adına yazılmasına
           zaten izin vermiyor. */
        const { error } = await client
          .from(TABLE)
          .insert(missing.map((slug) => ({ product_slug: slug })));
        if (error) throw error;
      }

      const merged = union(remote, local);
      writeFavourites(merged);
      setSlugs(merged);
    } catch (error) {
      /* Eşitleme başarısızsa tarayıcıdaki liste olduğu gibi
         kalır — müşteri listesini kaybetmez, bir sonraki
         girişte tekrar denenir. */
      console.error("Favoriler eşitlenemedi:", error);
      setSlugs(readFavourites());
    } finally {
      setSyncing(false);
    }
  }, [client, fetchRemote]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      /* İlk çizim sunucuda yapıldığı için liste orada bilinmiyor;
         okuma istemcide, ilk boyamadan sonra yapılıyor. */
      await Promise.resolve();
      if (!active) return;
      setSlugs(readFavourites());

      if (!client) return;

      const { data } = await client.auth.getSession();
      if (!active) return;

      const userId = data.session?.user?.id ?? null;
      if (userId && syncedUser.current !== userId) {
        syncedUser.current = userId;
        await syncWithAccount();
      }
    };

    void start();

    /* Aynı sayfadaki diğer favori düğmeleri ve başka sekmeler. */
    const refresh = () => setSlugs(readFavourites());
    window.addEventListener("arvo:favourites", refresh);
    window.addEventListener("storage", refresh);

    const subscription = client?.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        /* Ortak bilgisayar senaryosu: liste bir sonraki müşteriye
           devrolmasın. */
        syncedUser.current = null;
        writeFavourites([]);
        setSlugs([]);
        return;
      }

      const userId = session?.user?.id ?? null;
      if (!userId) return;
      /* TOKEN_REFRESHED da buraya düşer; aynı kullanıcı için
         tekrar eşitlemiyoruz. */
      if (syncedUser.current === userId) return;

      syncedUser.current = userId;
      void syncWithAccount();
    });

    return () => {
      active = false;
      window.removeEventListener("arvo:favourites", refresh);
      window.removeEventListener("storage", refresh);
      subscription?.data.subscription.unsubscribe();
    };
  }, [client, syncWithAccount]);

  const toggle = useCallback(
    (slug: string) => {
      const previous = readFavourites();
      const adding = !previous.includes(slug);
      const next = adding
        ? [...previous, slug]
        : previous.filter((item) => item !== slug);

      /* Önce ekran: müşteri dokunduğunu anında görmeli. Sunucu
         reddederse geri alınıyor. */
      writeFavourites(next);
      setSlugs(next);

      if (!client) return;

      void (async () => {
        const { data } = await client.auth.getSession();
        if (!data.session) return;

        const { error } = adding
          ? await client
              .from(TABLE)
              /* Aynı ürün iki kez eklenemez (unique kısıt); iki
                 sekmeden aynı anda eklenirse çakışma yok sayılır. */
              .upsert(
                { product_slug: slug },
                { onConflict: "user_id,product_slug", ignoreDuplicates: true },
              )
          : await client.from(TABLE).delete().eq("product_slug", slug);

        /* 23505 benzersizlik ihlali: ürün zaten favorilerde. İki
           sekmeden aynı anda eklenmesi hata değil — istenen sonuç
           zaten oluşmuş durumda, geri alınmamalı. */
        if (error && error.code !== "23505") {
          console.error("Favori kaydedilemedi:", error);
          writeFavourites(previous);
          setSlugs(previous);
        }
      })();
    },
    [client],
  );

  const value = useMemo<FavouritesContextValue>(
    () => ({
      slugs,
      isFavourite: (slug: string) => slugs.includes(slug),
      toggle,
      syncing,
    }),
    [slugs, toggle, syncing],
  );

  return (
    <FavouritesContext.Provider value={value}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const value = useContext(FavouritesContext);
  if (!value) {
    throw new Error(
      "useFavourites, FavouritesProvider içinde kullanılmalı (bkz. layout.tsx).",
    );
  }
  return value;
}
