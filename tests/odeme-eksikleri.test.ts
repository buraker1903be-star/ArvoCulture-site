import { test } from "node:test";
import assert from "node:assert/strict";
import { eksikAlanlar, eksikMetni, type OdemeFormu } from "@/lib/odeme-eksikleri";

/*
  18.10.2026'da canlıda ölçüldü: "Ödemeye geç" devre dışıydı ve boş
  formla basmak hiçbir şey yapmıyordu — hata yok, odak yok. Müşteri
  on iki alanı doldurup 2.150 piksel aşağı kaydırıyor ve gri bir
  düğme buluyordu.
*/

const TAM: OdemeFormu = {
  name: "Ayşe Yılmaz",
  email: "ayse@ornek.test",
  phone: "+90 500 000 00 00",
  city: "İstanbul",
  district: "Beşiktaş",
  line: "Örnek Mah. 1. Sokak No:2 D:3",
};

const ONAYLI = { distance: true, preInfo: true, privacy: true };
const telefonGecerli = (d: string) => d.replace(/\D/g, "").length >= 10;

test("tam form eksiksiz", () => {
  assert.deepEqual(eksikAlanlar(TAM, ONAYLI, 1, telefonGecerli), []);
});

test("eksikler SAYFA SIRASIYLA dönüyor", () => {
  /* Müşteriyi en üstteki eksiğe götürmek, aşağıdakine götürüp
     sonra yukarı çıkarmaktan iyi. */
  const bos = { name: "", email: "", phone: "", city: "", district: "", line: "" };
  const sonuc = eksikAlanlar(bos, { distance: false, preInfo: false, privacy: false }, 1, telefonGecerli);
  assert.deepEqual(
    sonuc.map((e) => e.alan),
    ["name", "email", "phone", "city", "district", "line", "onaylar"],
  );
});

test("tek eksik alan tek tek bildiriliyor", () => {
  const sonuc = eksikAlanlar({ ...TAM, email: "bozuk" }, ONAYLI, 1, telefonGecerli);
  assert.deepEqual(sonuc.map((e) => e.alan), ["email"]);
  assert.equal(eksikMetni(sonuc), "Geçerli bir e-posta adresi eksik.");
});

test("üç onay tek satırda toplanıyor", () => {
  /* Üçünü ayrı saymak üç maddelik bir liste üretiyordu ve müşteri
     tek bir kutuyu işaretlemediğini anlamıyordu. */
  const sonuc = eksikAlanlar(TAM, { distance: true, preInfo: false, privacy: true }, 1, telefonGecerli);
  assert.deepEqual(sonuc.map((e) => e.alan), ["onaylar"]);
});

test("çok eksikte cümle okunabilir", () => {
  const sonuc = eksikAlanlar({ ...TAM, city: "", line: "" }, ONAYLI, 1, telefonGecerli);
  assert.equal(eksikMetni(sonuc), "İl ve açık adres eksik.");
});

test("kısa adres eksik sayılıyor", () => {
  /* "Ev" gibi bir adres kargoya çıkamaz. */
  assert.deepEqual(
    eksikAlanlar({ ...TAM, line: "Ev" }, ONAYLI, 1, telefonGecerli).map((e) => e.alan),
    ["line"],
  );
});

test("boş sepet ayrıca bildiriliyor", () => {
  const sonuc = eksikAlanlar(TAM, ONAYLI, 0, telefonGecerli);
  assert.deepEqual(sonuc.map((e) => e.alan), ["sepet"]);
});

test("telefon kuralı dışarıdan geliyor", () => {
  /* Kopyalansaydı iki kural zamanla ayrışır ve düğme "eksik yok"
     derken gönderim reddedilirdi. */
  const katiKural = () => false;
  assert.deepEqual(
    eksikAlanlar(TAM, ONAYLI, 1, katiKural).map((e) => e.alan),
    ["phone"],
  );
});
