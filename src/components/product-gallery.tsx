"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Ürün galerisi.
 *
 * ARC her ürün için birden çok görsel tutuyor; sayfa yalnızca
 * ilkini gösteriyordu. Tişörtlerde arka yüz, bakım ürünlerinde
 * içerik etiketi ikinci görselde — satın alma kararı için gerekli.
 */
export function ProductGallery({
  images,
  name,
  artStyle,
}: {
  images: string[];
  name: string;
  artStyle: "packshot" | "lifestyle";
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  /*
    Parmakla kaydırma. Telefonda küçük görsellere basmak yerine
    fotoğrafı sürüklemek beklenen davranış; galerisi olan
    ürünlerde ikinci ve üçüncü kareyi kimse küçük kutulardan
    aramıyor.

    Kütüphane kullanmıyoruz: tek eksende basit bir sürükleme
    için dokunma olaylarını okumak yeterli.
  */
  const touchStart = useRef<number | null>(null);

  const onTouchStart = (event: React.TouchEvent) => {
    touchStart.current = event.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (start === null || images.length < 2) return;

    const delta = (event.changedTouches[0]?.clientX ?? start) - start;
    // 40 pikselin altındaki hareketler kazara dokunuş sayılır.
    if (Math.abs(delta) < 40) return;

    setActive((index) =>
      delta < 0
        ? Math.min(index + 1, images.length - 1)
        : Math.max(index - 1, 0),
    );
  };

  return (
    <div className="pdp-media" data-art={artStyle}>
      <div
        className="pdp-stage"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/*
          Rozetler görselin üzerinden kaldırıldı; ana sayfadaki
          kartla aynı karar. İndirim oranı fiyatın yanında,
          "çok satan" ise marka satırında gösteriliyor (bkz.
          urun/[slug]/page.tsx). Ürün fotoğrafı temiz kalıyor.
        */}

        {current ? (
          <Image
            key={current}
            src={current}
            alt={
              images.length > 1
                ? `${name} — görsel ${active + 1} / ${images.length}`
                : name
            }
            fill
            priority
            sizes="(max-width: 900px) 100vw, 46vw"
          />
        ) : (
          <span className="pdp-empty" aria-hidden="true">
            AC
          </span>
        )}
      </div>

      {/* Kaydırma göstergesi: kaç kare var, hangisindeyiz. */}
      {images.length > 1 && (
        <div className="pdp-dots" aria-hidden="true">
          {images.map((image, index) => (
            <span key={image} data-active={index === active} />
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="pdp-thumbs" role="group" aria-label="Ürün görselleri">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              aria-label={`Görsel ${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
            >
              <Image src={image} alt="" fill sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
