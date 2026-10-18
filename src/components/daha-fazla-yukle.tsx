"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/product-types";

/**
 * "Daha fazla yükle".
 *
 * Sayfalama ÖNCE "← Önceki / Sonraki →" bağlantılarıydı: müşteri
 * her sayfada başa dönüyor, kaldığı yeri kaybediyor ve ikinci
 * sayfadan sonra çoğu zaman geri gelmiyordu. Liste artık
 * büyüyor; kaldığı yer duruyor.
 *
 * SUNUCU SAYFALAMASI YERİNDE DURUYOR. İlk sayfa yine sunucuda
 * çiziliyor (arama motoru ve JavaScript'siz tarayıcı onu
 * görüyor) ve sonraki sayfaların adresi `<noscript>` içinde
 * bağlantı olarak kalıyor — düğme yalnızca ÜSTÜNE eklenen bir
 * kolaylık.
 */
export function DahaFazlaYukle({
  slug,
  ilkSayfa,
  sayfaSayisi,
  sonrakiAdres,
}: {
  slug: string;
  ilkSayfa: number;
  sayfaSayisi: number;
  /** JavaScript kapalıyken kullanılacak bağlantı. */
  sonrakiAdres: string;
}) {
  const params = useSearchParams();
  const [urunler, setUrunler] = useState<Product[]>([]);
  const [sayfa, setSayfa] = useState(ilkSayfa);
  const [durum, setDurum] = useState<"bos" | "yukleniyor" | "hata">("bos");

  const bitti = sayfa >= sayfaSayisi;

  async function yukle() {
    setDurum("yukleniyor");
    try {
      const yanit = await fetch("/api/koleksiyon-sayfasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          sayfa: sayfa + 1,
          /* Süzgeçler adres çubuğundan: sayfanın gösterdiği
             küme ile düğmenin getirdiği küme aynı olmalı. */
          marka: params.get("marka") ?? "",
          beden: params.get("beden") ?? "",
          ust: params.get("ust") ?? "",
          sirala: params.get("sirala") ?? "",
          indirimli: params.get("indirimli") === "1",
          tukenenler: params.get("tukenenler") === "1",
        }),
      });
      if (!yanit.ok) throw new Error(`HTTP ${yanit.status}`);
      const veri = (await yanit.json()) as { products: Product[] };

      setUrunler((oncekiler) => {
        /*
          Aynı ürün iki kez eklenmesin: sayfa sınırında duran bir
          ürün sıralama değişmese de iki sayfada birden
          görünebiliyor (yeni ürün eklenirse kayma oluyor).
        */
        const gorulen = new Set(oncekiler.map((u) => u.slug));
        return [
          ...oncekiler,
          ...veri.products.filter((u) => !gorulen.has(u.slug)),
        ];
      });
      setSayfa((n) => n + 1);
      setDurum("bos");
    } catch (hata) {
      console.error(hata);
      setDurum("hata");
    }
  }

  return (
    <>
      {urunler.length > 0 && (
        <div className="grid collection-grid daha-fazla-izgara">
          {urunler.map((urun) => (
            <ProductCard key={urun.slug} product={urun} />
          ))}
        </div>
      )}

      <div className="daha-fazla">
        {bitti ? (
          <p className="hint">Hepsi bu kadar.</p>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-ghost"
              disabled={durum === "yukleniyor"}
              onClick={() => void yukle()}
            >
              {durum === "yukleniyor" ? "Yükleniyor…" : "Daha fazla yükle"}
            </button>
            <small>
              {sayfa} / {sayfaSayisi} sayfa
            </small>
          </>
        )}

        {durum === "hata" && (
          <p className="form-error" role="alert">
            Daha fazlası yüklenemedi. Bağlantınızı kontrol edip tekrar
            deneyin.
          </p>
        )}

        {/* JavaScript kapalıyken ve arama motoru için. */}
        {!bitti && (
          <noscript>
            <a href={sonrakiAdres}>Sonraki sayfa →</a>
          </noscript>
        )}
      </div>
    </>
  );
}
