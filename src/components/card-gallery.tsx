"use client";

import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Kart içi görsel galerisi — yalnızca dokunmatik.
 *
 * Koleksiyon sayfasında müşteri ürünü açmadan ikinci ve üçüncü
 * fotoğrafa bakabilsin. Masaüstünde bu bileşen devreye girmez;
 * orada üzerine gelince ikinci görselin belirmesi zaten
 * çalışıyor ve daha az tıklama gerektiriyor.
 *
 * Kaydırma kart bağlantısının içinde: dikey kaydırmayı
 * engellememek için hareketin yönü ölçülüyor.
 */
export function CardGallery({
  images,
  alt,
  sizes,
}: {
  images: string[];
  alt: string;
  sizes: string;
}) {
  const [index, setIndex] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;
    start.current = { x: touch.clientX, y: touch.clientY };
    moved.current = false;
  };

  const onTouchMove = (event: React.TouchEvent) => {
    const from = start.current;
    const touch = event.touches[0];
    if (!from || !touch) return;

    const dx = touch.clientX - from.x;
    const dy = touch.clientY - from.y;

    // Yatay hareket dikeyden belirgin şekilde büyükse galeri
    // hareketi sayılır; aksi hâlde sayfa kaydırması engellenir.
    if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      moved.current = true;
    }
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const from = start.current;
    start.current = null;
    if (!from || !moved.current) return;

    const touch = event.changedTouches[0];
    const dx = (touch?.clientX ?? from.x) - from.x;
    if (Math.abs(dx) < 40) return;

    // Kaydırma yapıldıysa bağlantının açılmasını engelle.
    event.preventDefault();

    setIndex((current) =>
      dx < 0
        ? Math.min(current + 1, images.length - 1)
        : Math.max(current - 1, 0),
    );
  };

  return (
    <span
      className="card-gallery"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {images.map((image, position) => (
        <Image
          key={image}
          className="card-img"
          src={image}
          alt={position === 0 ? alt : ""}
          fill
          sizes={sizes}
          /*
            Görünürlük satır içi stille veriliyor. Öznitelik
            seçicisiyle yazıldığında kart görselleri boş
            çıkıyordu: `.card-art img` kuralları daha güçlü
            eşleşiyor ve opaklığı eziyordu.
          */
          style={{ opacity: position === index ? 1 : 0 }}
          /* İlk görsel öncelikli; diğerleri kaydırınca yüklenir. */
          loading={position === 0 ? undefined : "lazy"}
        />
      ))}

      {images.length > 1 && (
        <span className="card-dots" aria-hidden="true">
          {images.map((image, position) => (
            <i key={image} data-active={position === index || undefined} />
          ))}
        </span>
      )}
    </span>
  );
}
