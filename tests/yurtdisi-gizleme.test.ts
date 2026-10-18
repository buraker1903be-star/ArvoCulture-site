/*
  YURTDIŞI MODUNDA GİZLENEN ÜRÜNLER.

  Gizleme kuralı SUNUCUDA, sayfanın içinde basılıyor; tarayıcı yalnızca
  `data-para` niteliğini çeviriyor. Kural metni doğrudan sayfaya
  girdiği için biçimi sınanıyor: seçiciyi kapatan bir karakter
  sayfanın BÜTÜN stilini bozabilir.
*/
import test from "node:test";
import assert from "node:assert/strict";
import { paraBirimiOnYukleyici, yurtdisiGizlemeCss } from "@/lib/yurtdisi-gizleme";

test("gizleme kuralı yalnızca dolar modunda geçerli", () => {
  const css = yurtdisiGizlemeCss(["lr-krem"]);
  assert.equal(css, 'html[data-para="usd"] [data-urun="lr-krem"]{display:none}');
  /* TL modunda hiçbir şey gizlenmiyor: seçici niteliğe bağlı. */
  assert.ok(css!.startsWith('html[data-para="usd"]'));
});

test("birden fazla ürün tek kuralda", () => {
  const css = yurtdisiGizlemeCss(["a", "b"]);
  assert.equal(
    css,
    'html[data-para="usd"] [data-urun="a"],html[data-para="usd"] [data-urun="b"]{display:none}',
  );
});

test("liste boşsa kural basılmıyor", () => {
  /* Boş bir <style> etiketi basmamak için null. */
  assert.equal(yurtdisiGizlemeCss([]), null);
});

test("slug biçimine uymayan değer kurala girmiyor", () => {
  /*
    Bu metin doğrudan sayfaya giriyor. Tırnak ya da süslü parantez
    içeren bir değer seçiciyi kapatıp kendi kuralını yazabilirdi;
    bir ürünü gizlemeyi kaçırmak, sayfayı bozmaktan iyi.
  */
  assert.equal(yurtdisiGizlemeCss(['a"]{display:block}']), null);
  assert.equal(yurtdisiGizlemeCss(["iyi-slug", "kötü slug"]), 
    'html[data-para="usd"] [data-urun="iyi-slug"]{display:none}');
});

test("ön yükleyici betiği localStorage hatasını yutuyor", () => {
  const betik = paraBirimiOnYukleyici();
  /* Gizli sekmede ve depolama kapalıyken okuma FIRLATIYOR; burada
     yakalanmayan bir hata sayfanın tamamını çizilmez yapardı. */
  assert.match(betik, /try\{/);
  assert.match(betik, /catch/);
  assert.match(betik, /arvo-para-birimi/);
  /* Betik `</script>` üretmemeli: sayfaya satır içi giriyor. */
  assert.ok(!betik.includes("</"));
});
