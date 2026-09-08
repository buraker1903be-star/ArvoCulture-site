"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * Koleksiyon filtreleri ve sıralama.
 *
 * Seçimler adres çubuğuna yazılıyor: müşteri filtreli sayfayı
 * paylaşabiliyor, geri tuşu çalışıyor ve sayfa yenilendiğinde
 * seçim kaybolmuyor. Bileşen içinde durum tutmak bunların
 * hiçbirini vermiyordu.
 */
export type SortKey = "onerilen" | "ucuz" | "pahali" | "indirim" | "yeni";

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: "onerilen", label: "Önerilen" },
  { key: "ucuz", label: "Artan fiyat" },
  { key: "pahali", label: "Azalan fiyat" },
  { key: "indirim", label: "En çok indirim" },
  { key: "yeni", label: "Yeniler" },
];

export function CollectionFilters({
  total,
  shown,
  sizes,
  brands,
  maxPrice,
}: {
  total: number;
  shown: number;
  sizes: string[];
  brands: string[];
  maxPrice: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);

  const sort = (params.get("sirala") ?? "onerilen") as SortKey;
  const size = params.get("beden") ?? "";
  const brand = params.get("marka") ?? "";
  const max = params.get("ust") ?? "";
  const onlyDeals = params.get("indirimli") === "1";
  const inStock = params.get("stokta") === "1";

  const activeCount =
    (size ? 1 : 0) + (brand ? 1 : 0) + (max ? 1 : 0) +
    (onlyDeals ? 1 : 0) + (inStock ? 1 : 0);

  /** Tek bir parametreyi değiştirip sayfayı başa alır. */
  const apply = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    // Filtre değişince ilk sayfaya dönülür; aksi hâlde boş
    // sayfa görünebiliyor.
    next.delete("sayfa");
    router.push(`?${next.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push("?", { scroll: false });

  return (
    <div className="filters">
      <div className="filters-bar">
        <button
          type="button"
          className="filters-toggle"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          Filtrele
          {activeCount > 0 && <em>{activeCount}</em>}
        </button>

        <span className="filters-count">
          {shown === total ? `${total} ürün` : `${shown} / ${total} ürün`}
        </span>

        <label className="filters-sort">
          <span>Sırala</span>
          <select
            value={sort}
            onChange={(event) => apply("sirala", event.target.value)}
          >
            {SORTS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {open && (
        <div className="filters-panel">
          {sizes.length > 0 && (
            <div className="filters-group">
              <small>Beden</small>
              <div className="filters-chips">
                {sizes.map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={size === option}
                    onClick={() => apply("beden", size === option ? "" : option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {brands.length > 1 && (
            <div className="filters-group">
              <small>Marka</small>
              <div className="filters-chips">
                {brands.map((option) => (
                  <button
                    type="button"
                    key={option}
                    aria-pressed={brand === option}
                    onClick={() =>
                      apply("marka", brand === option ? "" : option)
                    }
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="filters-group">
            <small>En fazla fiyat</small>
            <div className="filters-chips">
              {priceSteps(maxPrice).map((step) => (
                <button
                  type="button"
                  key={step}
                  aria-pressed={max === String(step)}
                  onClick={() =>
                    apply("ust", max === String(step) ? "" : String(step))
                  }
                >
                  {new Intl.NumberFormat("tr-TR").format(step)} ₺ altı
                </button>
              ))}
            </div>
          </div>

          <div className="filters-group">
            <small>Diğer</small>
            <div className="filters-chips">
              <button
                type="button"
                aria-pressed={onlyDeals}
                onClick={() => apply("indirimli", onlyDeals ? "" : "1")}
              >
                Sadece indirimliler
              </button>
              <button
                type="button"
                aria-pressed={inStock}
                onClick={() => apply("stokta", inStock ? "" : "1")}
              >
                Stokta olanlar
              </button>
            </div>
          </div>

          {activeCount > 0 && (
            <button type="button" className="linklike" onClick={clearAll}>
              Filtreleri temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Fiyat basamakları katalogdan türetilir. Sabit basamaklar
 * (500, 1000, 2000) 300 TL'lik bir katalogda anlamsız,
 * 30.000 TL'lik bir katalogda yetersiz kalıyordu.
 */
function priceSteps(maxPrice: number) {
  const rounded = Math.ceil(maxPrice / 100) * 100;
  return [0.25, 0.5, 0.75]
    .map((ratio) => Math.ceil((rounded * ratio) / 100) * 100)
    .filter((step, index, list) => step > 0 && list.indexOf(step) === index);
}
