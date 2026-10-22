import assert from "node:assert/strict";
import { test } from "node:test";
import {
  anahtarGecerli,
  indirimTutari,
  toplamFarki,
} from "@/lib/siparis-durumu";

/*
  İLK GERÇEK SİPARİŞTE RAKAMLAR TUTMUYORDU: 470,90 + 120,00 = 590,90
  ama toplam 576,77. Aradaki 14,13 havale indirimiydi (mal bedelinin
  %3'ü, kargoya uygulanmıyor) ve sayfa onu hiç göstermiyordu.
*/
test("havale indirimi farktan bulunuyor", () => {
  const indirim = indirimTutari({ ara_toplam: 47090, kargo: 12000, toplam: 57677 });
  assert.equal(indirim, 1413);
  /* Müşterinin gördüğü satırlar artık toplanıyor. */
  assert.equal(47090 + 12000 - 1413, 57677);
});

test("indirimsiz siparişte satır çıkmıyor", () => {
  assert.equal(indirimTutari({ ara_toplam: 47090, kargo: 12000, toplam: 59090 }), 0);
});

test("KDV indirime KARIŞMIYOR", () => {
  /*
    ArvoARC'ta `tax` fiyatın İÇİNDEN çıkarılan vergi (arc_extract_vat),
    üzerine eklenen bir kalem değil. Bir sürüm boyunca toplama
    katılmıştı: aynı siparişte indirim 14,13 yerine 75,44 göründü,
    toplam yine tutuyordu ama iki satır birden uyduruktu.

    Gerçek örnek: ara toplam 470,90 · kargo 120,00 · KDV 61,31 ·
    toplam 576,77. Doğru indirim 14,13.
  */
  assert.equal(indirimTutari({ ara_toplam: 47090, kargo: 12000, toplam: 57677 }), 1413);
});

test("eksi fark indirim sayılmıyor", () => {
  /* Uydurma bir "indirim" yazmaktansa satırı hiç yazmamak doğru. */
  assert.equal(indirimTutari({ ara_toplam: 10000, kargo: 0, toplam: 12000 }), 0);
});

test("anahtar biçimi sunucuda da denetleniyor", () => {
  assert.equal(anahtarGecerli("063396f0cc1b4a971e13315aac29c323"), true);
  assert.equal(anahtarGecerli("abc"), false);
  /* Büyük harf üretmiyoruz; kabul de etmiyoruz. */
  assert.equal(anahtarGecerli("063396F0CC1B4A971E13315AAC29C323"), false);
  assert.equal(anahtarGecerli(""), false);
});

/*
  Aynı siparişin iki ekranda farklı hesaplanması gerçek bir
  kusurdu (AC261017-F93525: 470,90 + 120,00 ≠ 576,77 ve fark
  hiçbir satırda yazmıyordu). Kural tek yerde.
*/
test("toplam farkı: havale indirimi ara toplam+kargo−toplam", () => {
  assert.equal(toplamFarki(47090, 12000, 57677), 1413);
});

test("toplam farkı eksi çıkarsa sıfır sayılır", () => {
  /* Vergi ya da yuvarlama yüzünden toplam büyük çıkabilir; eksi
     bir "indirim" yazmak hesabı büsbütün bozardı. */
  assert.equal(toplamFarki(10000, 0, 12000), 0);
  assert.equal(toplamFarki(null, null, null), 0);
});

/*
  İNGİLİZCE VİTRİN (sipariş takibi): durum ve ödeme adları sözlükten
  geliyor. Sözlüğün TÜRKÇE karşılığı eski metinle (durumMetni /
  odemeMetni) aynı kalmalı — ayrışırsa Türkçe vitrinde durum adı
  sessizce değişir.
*/
import {
  DURUM_KODLARI,
  durumAnahtari,
  durumMetni,
  ODEME_KODLARI,
  odemeAnahtari,
  odemeMetni,
} from "@/lib/siparis-durumu";
import { ceviri } from "@/lib/sozluk";

test("durum ve ödeme anahtarları eski Türkçe metinlerle aynı", () => {
  /*
    KOD LİSTESİ TÜRKÇE TABLODAN OKUNUYOR, elle yazılmıyor: elle
    yazılı bir listede yeni bir durum kodu eklenip sözlük anahtarı
    atlanırsa İngilizce vitrin o durumu sessizce boş geçer ve test
    yeşil kalır.
  */
  assert.ok(DURUM_KODLARI.length >= 6);
  assert.ok(ODEME_KODLARI.length >= 6);

  for (const kod of DURUM_KODLARI) {
    const anahtar = durumAnahtari(kod);
    assert.ok(anahtar, `durum anahtarı yok: ${kod}`);
    assert.equal(ceviri(anahtar, "tr"), durumMetni(kod), kod);
    assert.notEqual(ceviri(anahtar, "en"), durumMetni(kod), `${kod} çevrilmemiş`);
  }
  for (const kod of ODEME_KODLARI) {
    const anahtar = odemeAnahtari(kod);
    assert.ok(anahtar, `ödeme anahtarı yok: ${kod}`);
    assert.equal(ceviri(anahtar, "tr"), odemeMetni(kod), kod);
  }
});

test("tanınmayan kod için anahtar yok (sayfa boş geçiyor)", () => {
  assert.equal(durumAnahtari("awaiting_restock"), null);
  assert.equal(odemeAnahtari("awaiting_restock"), null);
});
