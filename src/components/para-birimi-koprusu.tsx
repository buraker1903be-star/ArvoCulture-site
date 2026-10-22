"use client";

import { useEffect, useRef } from "react";
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
  const { paraBirimi, dolarVar, hazir } = useParaBirimi();
  /*
    BU DA BİR KEZ. Sayfa açılışında verilmiş bir karara (kayıtlı
    dolar seçimi) uyuyor; müşteri sonradan TR₺'ye basarsa ONUN kararı
    geçerli ve bu bileşen araya girmiyor. Sürekli sınanan bir koşul
    seçiciyi işlevsiz bırakıyordu.
  */
  const gonderildi = useRef(false);

  useEffect(() => {
    if (gonderildi.current) return;
    /* Kayıtlı seçim okunana kadar bekleniyor: yoksa tek seferlik
       koşul ilk render'daki "TRY" ile harcanırdı. */
    if (!dolarVar || !hazir) return;
    gonderildi.current = true;
    if (paraBirimi === "USD") router.replace("/en");
  }, [dolarVar, hazir, paraBirimi, router]);

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
  const { paraBirimi, dolarVar, secildi, hazir } = useParaBirimi();
  /*
    BİR KEZ — VE BU BİR DÖNGÜYÜ KAPATIYOR.

    Önce koşul her değişimde sınanıyordu ve TR₺ düğmesi
    çalışmıyordu: seçim TRY oluyor, adres `/` oluyor, ama bu bileşen
    hâlâ ekranda olduğu için "USD değil" görüp geri USD yapıyor ve
    ana sayfadaki `IngilizceyeGonder` müşteriyi /en'e geri atıyordu.
    Müşteri İngilizceden çıkamıyordu (22.10.2026, kurum sahibi
    bildirdi).

    Tek seferlik olması doğru olanı: zorlama ADRESE GELİNDİĞİ İÇİN
    var — İngilizce bir sayfada TL fiyat görünmesin diye. Müşterinin
    sonradan verdiği karar ondan sonra gelir ve ezilmemeli.
  */
  const zorlandi = useRef(false);

  useEffect(() => {
    if (zorlandi.current) return;
    if (!dolarVar || !hazir) return;
    zorlandi.current = true;
    if (paraBirimi !== "USD") secildi("USD");
  }, [dolarVar, hazir, paraBirimi, secildi]);

  return null;
}
