/*
  DİL ÖNEKİ.

  İngilizce ağacın içindeki bağlantı ağacın içinde kalmalı: İngilizce
  ana sayfadan bir ürüne tıklayan müşteri Türkçe sayfaya düşerse ayrı
  adres kurmanın bütün anlamı kaybolur.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { dilOneki, yoldanDil } from "@/lib/dil-onek";

test("önek yalnızca İngilizcede var", () => {
  assert.equal(dilOneki("en"), "/en");
  assert.equal(dilOneki("tr"), "");
});

test("yoldan dil çıkarılıyor", () => {
  assert.equal(yoldanDil("/en"), "en");
  assert.equal(yoldanDil("/en/urun/x"), "en");
  assert.equal(yoldanDil("/"), "tr");
  assert.equal(yoldanDil("/urun/x"), "tr");
  assert.equal(yoldanDil(null), "tr");
});

test("/en ile BAŞLAYAN ama İngilizce olmayan yol yanlış eşleşmiyor", () => {
  /*
    Sınır aranmasa "/engel" ya da "/enflasyon" gibi bir yol İngilizce
    sayılır ve o sayfadaki bütün bağlantılar /en'e kayardı — sessizce
    404 üreten bir hata.
  */
  assert.equal(yoldanDil("/engel"), "tr");
  assert.equal(yoldanDil("/enflasyon-raporu"), "tr");
  assert.equal(yoldanDil("/english"), "tr");
});
