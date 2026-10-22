/*
  İNGİLİZCE VİTRİNİN RAF SEÇİMİ.

  NEDEN VAR: dolar modunda Türkçe ana sayfanın rafları boş
  görünüyordu — kartlar CSS ile gizleniyor ama başlıkları duruyordu
  ve ana sayfanın rafları tam o gizlenen katalogdan kuruluydu. Süzgeç
  artık sunucuda; burada süzgecin YEDEK ZİNCİRİ sınanıyor, çünkü
  yanlış bir yedek sessizce güven zedeliyor.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { enCokTercihEdilen, gonderilebilir } from "@/lib/yurtdisi-vitrin";
import type { Product } from "@/lib/product-types";

const urun = (slug: string, ek: Partial<Product> = {}): Product =>
  ({ slug, name: slug, price: 100, ...ek }) as Product;

test("gönderilemeyen ve tükenen ürün raftan çıkıyor", () => {
  const liste = [
    urun("gomlek"),
    urun("lr-krem"),
    urun("tukenen", { available: false }),
  ];
  assert.deepEqual(
    gonderilebilir(liste, new Set(["lr-krem"])).map((u) => u.slug),
    ["gomlek"],
  );
});

test("çok satanlar koleksiyondan geliyor", () => {
  const sonuc = enCokTercihEdilen(
    [urun("gomlek"), urun("ceket")],
    [urun("isaretli", { bestSeller: true })],
    new Set(),
  );
  assert.deepEqual(sonuc.map((u) => u.slug), ["gomlek", "ceket"]);
});

test("koleksiyonda gönderilebilir ürün kalmazsa İŞARETLİLERE düşüyor", () => {
  /* Koleksiyon tamamen gönderilemeyen katalogdan olabiliyor: "çok
     satan cilt bakım" koleksiyonunun tamamı böyle. */
  const sonuc = enCokTercihEdilen(
    [urun("lr-1"), urun("lr-2")],
    [urun("gomlek", { bestSeller: true }), urun("ceket")],
    new Set(["lr-1", "lr-2"]),
  );
  assert.deepEqual(sonuc.map((u) => u.slug), ["gomlek"]);
});

test("KATALOG SIRASINA DÜŞMÜYOR: ikisi de boşsa raf boş", () => {
  /*
    Üçüncü bir yedek olarak katalog sırası konsaydı, tedarikçiden yeni
    gelmiş ve hiç satılmamış bir ürün "en çok tercih edilen" diye
    gösterilirdi. Eksik bir raf, yanlış bir raftan iyidir — sayfa boş
    listede bölümü hiç çizmiyor.
  */
  const sonuc = enCokTercihEdilen(
    [urun("lr-1")],
    /* İşaretli OLMAYAN ürünler: yedek bunları almamalı. */
    [urun("gomlek"), urun("ceket")],
    new Set(["lr-1"]),
  );
  assert.deepEqual(sonuc, []);
});

test("raf uzunluğu sınırlı", () => {
  const liste = Array.from({ length: 30 }, (_, i) => urun(`u${i}`));
  assert.equal(enCokTercihEdilen(liste, [], new Set()).length, 10);
  assert.equal(enCokTercihEdilen(liste, [], new Set(), 4).length, 4);
});
