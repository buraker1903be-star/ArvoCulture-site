/*
 * SAYFALAMA PARAMETREYLE YAPILIYOR, BAŞLIKLA DEĞİL.
 *
 * İlk sürüm `Range: 1000-1999` başlığı gönderiyordu. PostgREST bu RPC
 * uçlarında başlığı yok sayıyor: her sayfa aynı ilk 1000 satırı
 * döndürdü, döngü de "sayfa dolu, devam" diye okuyup 50 kez istedi.
 * Canlıda arama dizini 49.800 satıra çıktı, aranan ürün yine yoktu
 * (30.09.2026). Hata SESSİZDİ — istekler 200 dönüyordu.
 *
 * Bu yüzden burada asıl sınanan, isteğin GÖVDESİNDE p_offset'in
 * ilerlemesi ve sonucun yinelenmemesi.
 */
import { test } from "node:test";
import assert from "node:assert/strict";

/* env.ts eksik değişkende bilerek fırlatıyor; import'tan önce dolduruluyor. */
process.env.ARC_SUPABASE_URL ??= "https://ornek.supabase.co";
process.env.ARC_SUPABASE_PUBLISHABLE_KEY ??= "anahtar";
process.env.ARC_ORGANIZATION_ID ??= "00000000-0000-4000-8000-000000000001";

const { rpcTumSayfalar, rpc } = await import("@/lib/arc");

type Cagri = { p_limit: number; p_offset: number };

/** `toplam` satırlık bir tabloyu p_limit/p_offset'e göre dilimler. */
function sahteSunucu(toplam: number, cagrilar: Cagri[]) {
  return async (_url: unknown, init: { body: string }) => {
    const govde = JSON.parse(init.body) as Cagri;
    cagrilar.push(govde);
    const satirlar = Array.from({ length: toplam }, (_, i) => ({ slug: `u-${i}` }))
      .slice(govde.p_offset, govde.p_offset + govde.p_limit);
    return {
      ok: true,
      status: 200,
      /* Gerçek Response'ta ikisi de var; `istek` artık gövdeyi
         metin okuyup boşsa null sayıyor (void dönen fonksiyonlarda
         PostgREST boş gövde veriyor). */
      json: async () => satirlar,
      text: async () => JSON.stringify(satirlar),
    } as unknown as Response;
  };
}

/** Başlığı yok sayan, hep ilk sayfayı döndüren eski davranış. */
function basligiYokSayanSunucu(toplam: number) {
  return async (_url: unknown, init: { body: string }) => {
    const govde = JSON.parse(init.body) as Cagri;
    const satirlar = Array.from({ length: toplam }, (_, i) => ({ slug: `u-${i}` }))
      .slice(0, govde.p_limit);
    return {
      ok: true,
      status: 200,
      json: async () => satirlar,
      text: async () => JSON.stringify(satirlar),
    } as unknown as Response;
  };
}

async function sunucuyla<T>(sahte: unknown, isle: () => Promise<T>): Promise<T> {
  const gercek = globalThis.fetch;
  globalThis.fetch = sahte as typeof fetch;
  try {
    return await isle();
  } finally {
    globalThis.fetch = gercek;
  }
}

test("p_offset her sayfada sayfa boyutu kadar ilerliyor", async () => {
  const cagrilar: Cagri[] = [];
  const satirlar = await sunucuyla(sahteSunucu(250, cagrilar), () =>
    rpcTumSayfalar<{ slug: string }>("f", {}, {}, { sayfaBoyutu: 100 }),
  );

  assert.deepEqual(
    cagrilar.map((c) => c.p_offset),
    [0, 100, 200],
  );
  assert.equal(satirlar.length, 250);
  assert.equal(new Set(satirlar.map((s) => s.slug)).size, 250);
});

test("eksik sayfa görülünce duruyor, boşuna istek atmıyor", async () => {
  const cagrilar: Cagri[] = [];
  await sunucuyla(sahteSunucu(100, cagrilar), () =>
    rpcTumSayfalar("f", {}, {}, { sayfaBoyutu: 100 }),
  );
  /* 100 satır tam bir sayfa: ikinci istek boş dönüp durmalı. */
  assert.equal(cagrilar.length, 2);
});

test("çağıranın verdiği parametreler korunuyor", async () => {
  const cagrilar: Cagri[] = [];
  await sunucuyla(sahteSunucu(10, cagrilar), () =>
    rpcTumSayfalar("f", { p_slug: "aloe" }, {}, { sayfaBoyutu: 100 }),
  );
  assert.equal((cagrilar[0] as unknown as { p_slug: string }).p_slug, "aloe");
});

test("sayfa sınırı aşılırsa liste şişmiyor", async () => {
  /*
    Canlıdaki hatanın tam senaryosu: sunucu sayfalamayı uygulamıyor.
    Döngü yine de en fazla enFazlaSayfa kez istiyor — ama asıl koruma,
    fonksiyonun artık p_offset alması. Burada üst sınırın çalıştığını
    sabitliyoruz ki sessiz sonsuz döngüye dönmesin.
  */
  const satirlar = await sunucuyla(basligiYokSayanSunucu(100), () =>
    rpcTumSayfalar("f", {}, {}, { sayfaBoyutu: 100, enFazlaSayfa: 3 }),
  );
  assert.equal(satirlar.length, 300);
});

test("boş gövde hata değil: void dönen fonksiyon başarılı sayılıyor", async () => {
  /*
    `returns void` bir fonksiyonda PostgREST 204 ve BOŞ gövde
    dönüyor; `response.json()` orada "Unexpected end of JSON
    input" fırlatıyordu. İşini yapmış bir çağrı başarısız
    görünüyor ve çağıran taraf onu yeniden deneyebiliyordu —
    ziyaret sayacında tam bu oldu (19.10.2026).
  */
  const eski = globalThis.fetch;
  globalThis.fetch = (async () =>
    ({
      ok: true,
      status: 204,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    }) as unknown as Response) as typeof fetch;

  try {
    const sonuc = await rpc("arc_storefront_visit", { p_path: "/" });
    assert.equal(sonuc, null);
  } finally {
    globalThis.fetch = eski;
  }
});
