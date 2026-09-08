"use client";

import Image from "next/image";
import { useState } from "react";

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
  discount,
  bestSeller,
  artStyle,
}: {
  images: string[];
  name: string;
  discount: number;
  bestSeller: boolean;
  artStyle: "packshot" | "lifestyle";
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="pdp-media" data-art={artStyle}>
      <div className="pdp-stage">
        <span className="card-flags">
          {discount > 0 && <b className="tag tag-sale">%{discount} indirim</b>}
          {bestSeller && <b className="tag tag-best">Çok satan</b>}
        </span>

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
