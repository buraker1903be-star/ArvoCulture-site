import { test } from "node:test";
import assert from "node:assert/strict";
import { gorselOlcusu } from "@/lib/gorsel-olcusu";

/*
  Satori uzak görseli kendisi ölçmüyor; ölçüyü biz veriyoruz.
  Kart logoyu 1920×231 oranında VARSAYIYORDU ve panele yüklenen
  logo başka orandaysa minicik çıkıyordu (18.10.2026, canlıda).
*/

/** Yalnızca başlığı doğru olan en küçük PNG. */
function png(en: number, boy: number): string {
  const bayt = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(bayt, 0);
  bayt.writeUInt32BE(13, 8);
  bayt.write("IHDR", 12, "ascii");
  bayt.writeUInt32BE(en, 16);
  bayt.writeUInt32BE(boy, 20);
  return `data:image/png;base64,${bayt.toString("base64")}`;
}

/** SOF0 çerçevesi taşıyan en küçük JPEG. */
function jpeg(en: number, boy: number): string {
  const sof = Buffer.alloc(11);
  sof.writeUInt16BE(0xffc0, 0);
  sof.writeUInt16BE(8, 2); /* bölüm uzunluğu */
  sof.writeUInt8(8, 4); /* örnek derinliği */
  sof.writeUInt16BE(boy, 5);
  sof.writeUInt16BE(en, 7);
  return `data:image/jpeg;base64,${Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    sof,
  ]).toString("base64")}`;
}

test("PNG ölçüsü IHDR'den okunuyor", () => {
  assert.deepEqual(gorselOlcusu(png(1920, 231)), { en: 1920, boy: 231 });
  assert.deepEqual(gorselOlcusu(png(512, 512)), { en: 512, boy: 512 });
});

test("JPEG ölçüsü SOF'tan okunuyor", () => {
  assert.deepEqual(gorselOlcusu(jpeg(800, 600)), { en: 800, boy: 600 });
});

test("JPEG'de ölçü taşımayan işaretçiler atlanıyor", () => {
  /* 0xC4 Huffman tablosu: uzunluğu var ama ölçüsü yok. Atlanmazsa
     tablonun baytları en/boy sanılırdı. */
  const huffman = Buffer.alloc(6);
  huffman.writeUInt16BE(0xffc4, 0);
  huffman.writeUInt16BE(4, 2);
  const sof = Buffer.alloc(11);
  sof.writeUInt16BE(0xffc0, 0);
  sof.writeUInt16BE(8, 2);
  sof.writeUInt8(8, 4);
  sof.writeUInt16BE(300, 5);
  sof.writeUInt16BE(400, 7);
  const uri = `data:image/jpeg;base64,${Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    huffman,
    sof,
  ]).toString("base64")}`;
  assert.deepEqual(gorselOlcusu(uri), { en: 400, boy: 300 });
});

test("tanınmayan ya da bozuk veri null", () => {
  /* null dönünce kart logoyu çizmiyor, mağaza adını yazıyor —
     yanlış ölçüyle ezik bir logo basmaktan iyi. */
  assert.equal(gorselOlcusu(""), null);
  assert.equal(gorselOlcusu("data:image/webp;base64,UklGRg=="), null);
  assert.equal(gorselOlcusu("bu bir veri adresi değil"), null);
  assert.equal(gorselOlcusu("data:image/png;base64,"), null);
});
