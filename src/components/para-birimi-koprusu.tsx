"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useParaBirimi } from "@/components/para-birimi";

/*
  ANA SAYFA İLE İNGİLİZCE ANA SAYFA ARASINDAKİ KÖPRÜ.

  NEDEN AYRI ADRES: İngilizce ana sayfanın içeriği Türkçesinden
  FARKLI — yurtdışına gönderilemeyen ürünler raflarda hiç yok. Bu
  karar sunucuda veriliyor ve dil seçimi tarayıcıda; aynı adreste iki
  içerik üretmek için çerez okumak gerekirdi ve çerez okuyan bir sayfa
  Next'te dinamikleşiyor (bu depoda rota önbelleğini düşüren bir
  değişiklik 3.400 ürün sayfasını bir kez 500'e düşürdü).

  NEDEN GEREKTİ: dolar seçilince kartlar CSS ile gizleniyordu ama
  rafların BAŞLIKLARI yerinde kalıyordu — "Çok satanlar" rafı
  tamamen cilt bakım ürünlerinden kurulu ve hepsi yurtdışına
  gönderilemiyor, yani şerit bomboş görünüyordu. Boşluk hangi
  ürünlerin rafta olduğundan geliyor; istemcide çözülemez.
*/

/**
 * Türkçe ana sayfada: dolar seçiliyse İngilizce ana sayfaya geçer.
 *
 * `replace` ile: geri düğmesi müşteriyi aynı yönlendirmeye geri
 * sokmasın.
 */
export function IngilizceyeGonder() {
  const router = useRouter();
  const { paraBirimi, dolarVar } = useParaBirimi();

  useEffect(() => {
    if (dolarVar && paraBirimi === "USD") router.replace("/en");
  }, [dolarVar, paraBirimi, router]);

  return null;
}

/**
 * İngilizce ana sayfada: para birimini dolara sabitler.
 *
 * Adrese doğrudan gelen (arama motoru, paylaşılan bağlantı) müşteri
 * İngilizce bir sayfada TL fiyat görmemeli. Seçim kaydedilince öteki
 * sayfalar da dolara dönüyor.
 */
export function DolarZorla() {
  const { paraBirimi, dolarVar, secildi } = useParaBirimi();

  useEffect(() => {
    if (dolarVar && paraBirimi !== "USD") secildi("USD");
  }, [dolarVar, paraBirimi, secildi]);

  return null;
}
