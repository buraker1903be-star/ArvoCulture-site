"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * ARC kesintisinde devreye girer. Eskiden bu durumda 404 dönüyordu ve
 * Google'a "bu ürün yok" sinyali gidiyordu; artık ürün dizinde kalıyor.
 */
export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="simple-page">
      <p className="eyebrow">GEÇİCİ BİR SORUN</p>
      <h1>Ürün bilgisi şu anda yüklenemiyor.</h1>
      <p>
        Güncel fiyat ve stok bilgisini doğrulayamadığımız için sayfayı eksik
        göstermiyoruz. Birkaç dakika sonra tekrar deneyin.
      </p>
      <p>
        <button className="button button-dark" type="button" onClick={reset}>
          Tekrar dene
        </button>{" "}
        <Link href="/koleksiyon/tumu">Tüm ürünlere dön</Link>
      </p>
    </main>
  );
}
