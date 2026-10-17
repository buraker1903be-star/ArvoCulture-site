#!/usr/bin/env node
/*
  TAZE OKUNMASI ZORUNLU ÇAĞRILAR ÖNBELLEĞE GİRMESİN.

  NEDEN VAR: lib/arc.ts'te yıl boyunca "PostgREST POST ile çağrılıyor,
  Next yalnızca GET saklıyor, buradaki süre sessizce yok sayılıyor"
  yazıyordu. Yanlıştı. 17.10.2026'da ölçüldü: ArvoARC'ta satılamaz
  ürünleri site haritasından çıkaran migration uygulandı, veritabanı
  2.899 ürün vermeye başladı, canlı site haritası bir saatten uzun
  süre 3.407 verdi; çağrıya `onbelleksiz` eklenince aynı dakika
  2.899'a düştü.

  Yani `revalidate`, verinin ne kadar BAYAT olabileceğidir. AGENTS.md
  şunu şart koşuyor: "Fiyat, stok, sepet ve sipariş verisi önbelleğe
  girmez." Bu denetim o şartı makineye bağlıyor: aşağıdaki
  fonksiyonlar `onbelleksiz: true` ile çağrılmak zorunda.

  Yanlış notun bir yıl boyunca fark edilmemesinin sebebi, kuralın
  yalnızca yorumda yazıyor olmasıydı.
*/
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

/** Bayat gelmesi kabul edilemeyen ArvoARC fonksiyonları ve gerekçeleri. */
const TAZE_OLMALI = new Map([
  ["get_arvoculture_storefront_product_slugs", "site haritası; sayfa noindex derken listelememeli"],
]);

/*
  ÜRÜN SAYFASI VE VARYANT LİSTESİ BU LİSTEDE DEĞİL — denendi ve
  OLMUYOR. İkisi de `onbelleksiz: true` yapıldığında bütün ürün
  sayfaları 500 verdi: rota `export const revalidate = 60` ile
  saklanıyor ve Next, saklanacak bir sayfanın içinde
  `cache: "no-store"` görünce rotayı hiç çizemiyor.

  Ders şu: o sayfa zaten altmış saniye bayat; bayatlığı belirleyen
  fetch değil ROTA önbelleği. Fiyatı gerçekten taze göstermek
  isteyen, rota önbelleğinden vazgeçmek zorunda — bu bir başarım
  kararı. Site haritası ise `force-dynamic`, orada çelişki yok.
*/

const kok = process.argv[2] ?? "src";

function dosyalar(dizin) {
  const cikti = [];
  for (const ad of readdirSync(dizin)) {
    const yol = path.join(dizin, ad);
    if (statSync(yol).isDirectory()) cikti.push(...dosyalar(yol));
    else if (/\.(ts|tsx)$/.test(ad)) cikti.push(yol);
  }
  return cikti;
}

const sorunlar = [];
for (const yol of dosyalar(kok)) {
  const metin = readFileSync(yol, "utf8");
  for (const [fonksiyon, gerekce] of TAZE_OLMALI) {
    let i = metin.indexOf(`"${fonksiyon}"`);
    while (i !== -1) {
      /*
        Çağrının seçenek nesnesi adın hemen ardında geliyor. Sonraki
        çağrıya taşmamak için pencere bir sonraki fonksiyon adına ya
        da 1200 karaktere kadar.
        Tanım satırları (TAZE_OLMALI listesi, tipler) atlanıyor:
        onlarda `rpc` çağrısı yok.
      */
      const pencere = metin.slice(i, i + 1200);
      const cagriMi = /rpc(OrEmpty|TumSayfalar)?\s*<|rpc(OrEmpty|TumSayfalar)?\s*\(/.test(metin.slice(Math.max(0, i - 400), i));
      if (cagriMi && !/onbelleksiz:\s*true/.test(pencere)) {
        sorunlar.push(`${yol}: ${fonksiyon} önbelleksiz çağrılmalı — ${gerekce}`);
      }
      i = metin.indexOf(`"${fonksiyon}"`, i + 1);
    }
  }
}

if (sorunlar.length > 0) {
  console.error(`✗ Önbellek denetimi: ${sorunlar.length} sorun`);
  for (const sorun of sorunlar) console.error(`  ${sorun}`);
  console.error("  Çözüm: çağrıya `onbelleksiz: true` ekleyin (lib/arc.ts RpcOptions).");
  process.exit(1);
}

console.log(`✓ Önbellek denetimi: taze okunması zorunlu ${TAZE_OLMALI.size} fonksiyon önbelleksiz çağrılıyor`);
