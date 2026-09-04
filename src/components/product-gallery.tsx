"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Ürün galerisi. ARC her ürün için birden çok görsel tutuyor ama sayfa
 * yalnızca ilkini gösteriyordu; kalanlar hiç kullanılmıyordu.
 */
export function ProductGallery({
  images,
  name,
  tone,
  category,
}: {
  images: string[];
  name: string;
  tone: string;
  category: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active];

  return (
    <div className="product-media">
      <div className={`product-gallery ${tone}`}>
        <span className="gallery-index">
          ARVOCULTURE / {category.toLocaleUpperCase("tr-TR")}
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
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "contain" }}
          />
        ) : (
          <>
            <div className="product-object" />
            <b>AC</b>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="gallery-thumbs" role="group" aria-label="Ürün görselleri">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              className="gallery-thumb"
              aria-label={`Görsel ${index + 1}`}
              aria-current={index === active}
              onClick={() => setActive(index)}
            >
              <Image src={image} alt="" fill sizes="72px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
