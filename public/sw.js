/*
  ArvoCulture — servis çalışanı (service worker).

  Amaç, siteyi telefonda uygulama gibi hissettirmek: ikinci
  açılışta yazı tipleri, ikonlar, betikler ve görseller ağdan
  değil cihazdan geliyor. Ölçtüğümüz fark burada; sayfanın
  "yüklenmesi" değil, "açılması" hissi.

  Bilinçli olarak yapmadığımız şey: ürün sayfalarının HTML'ini
  önbelleğe almak. Bir mağazada önbellekten sunulan sayfa demek,
  müşteriye eski fiyatı ve eski stok durumunu göstermek demek.
  Hız uğruna yanlış fiyat göstermeyi kabul etmiyoruz. Bu yüzden:

    - sayfa istekleri (navigation)  → önce ağ, ağ yoksa çevrimdışı ekranı
    - /_next/static, ikon, rozet    → önce önbellek (dosya adları
                                      içeriğe göre damgalı, eskimez)
    - /_next/image, ürün görselleri → önbellekten ver, arkada tazele
    - /api, POST, kimlik istekleri  → hiç dokunma

  Böylece hızlanan şey sayfanın iskeleti; değişebilen her şey
  (fiyat, stok, sepet, sipariş) her zaman ağdan geliyor.
*/

const SURUM = "arvo-v1";
const KABUK = `${SURUM}-kabuk`;
const VARLIK = `${SURUM}-varlik`;
const GORSEL = `${SURUM}-gorsel`;

/* Çevrimdışı ekranı ve markanın görünmesi için gereken en az şey. */
const ON_YUKLENEN = [
  "/cevrimdisi",
  "/arvoculture-logo-transparent.png",
  "/icon/icon-192.png",
];

/* Görsel önbelleği sınırsız büyümesin: kataloğumuz 3.400 ürün. */
const GORSEL_SINIRI = 120;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(KABUK)
      /*
        addAll tek bir dosya bile başarısız olursa hepsini iptal
        eder ve servis çalışanı hiç kurulmaz. Tek tek ekliyoruz ki
        eksik bir rozet dosyası yüzünden çevrimdışı desteği
        tamamen kaybolmasın.
      */
      .then((cache) =>
        Promise.all(ON_YUKLENEN.map((yol) => cache.add(yol).catch(() => {}))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((adlar) =>
        Promise.all(
          adlar
            .filter((ad) => ad.startsWith("arvo-") && !ad.startsWith(SURUM))
            .map((ad) => caches.delete(ad)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/* Yeni sürüm hazır olduğunda sayfa bekletmeden geçebilsin. */
self.addEventListener("message", (event) => {
  if (event.data === "arvo:skip-waiting") self.skipWaiting();
});

/** Önbelleği baştan sona kırpmak yerine en eskisini atıyoruz. */
async function budaKirp(adi, sinir) {
  const cache = await caches.open(adi);
  const anahtarlar = await cache.keys();
  if (anahtarlar.length <= sinir) return;
  await Promise.all(
    anahtarlar.slice(0, anahtarlar.length - sinir).map((k) => cache.delete(k)),
  );
}

/** Önce önbellek: içerik damgalı, değişmeyen dosyalar için. */
async function onceOnbellek(request, cacheAdi) {
  const cache = await caches.open(cacheAdi);
  const kayitli = await cache.match(request);
  if (kayitli) return kayitli;

  const yanit = await fetch(request);
  if (yanit.ok) cache.put(request, yanit.clone());
  return yanit;
}

/** Önbellekten ver, arkada tazele: görseller için. */
async function verVeTazele(request, cacheAdi, sinir) {
  const cache = await caches.open(cacheAdi);
  const kayitli = await cache.match(request);

  const ag = fetch(request)
    .then((yanit) => {
      if (yanit.ok) {
        cache.put(request, yanit.clone()).then(() => budaKirp(cacheAdi, sinir));
      }
      return yanit;
    })
    .catch(() => kayitli);

  return kayitli ?? ag;
}

/**
 * Önce ağ: sayfalar için. Fiyat ve stok asla eski gösterilmez.
 *
 * Ağ yoksa çevrimdışı ekranına *yönlendiriyoruz*, o ekranın
 * HTML'ini istenen adreste sunmuyoruz. Fark önemli: Next
 * sayfaları adresine göre canlanıyor; /urun/... adresinde
 * /cevrimdisi sayfasının HTML'ini döndürmek, tarayıcıyı iki
 * farklı sayfayı birbirine bindirmeye zorlar ve ekran bomboş
 * kalabilir. Yönlendirmede adres de içerik de tutarlı.
 */
async function onceAg(request) {
  try {
    return await fetch(request);
  } catch {
    const url = new URL(request.url);

    if (url.pathname !== "/cevrimdisi") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/cevrimdisi" },
      });
    }

    /* Çevrimdışı ekranının kendisi isteniyor: kurulumda indirdik. */
    const cache = await caches.open(KABUK);
    const sayfa = await cache.match("/cevrimdisi");
    return (
      sayfa ??
      /* Kurulum sırasında indirilememişse en azından bir şey göster;
         boş tarayıcı hatasından iyidir ve döngü kurmaz. */
      new Response(
        "<!doctype html><meta charset=utf-8><title>Bağlantı yok</title><p>İnternet bağlantısı yok.",
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        },
      )
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  /* Yalnızca GET. Sepete ekleme, sipariş, giriş — hiçbiri
     önbellekten geçmemeli. */
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* Sayfa istekleri: önce ağ. */
  if (request.mode === "navigate") {
    event.respondWith(onceAg(request));
    return;
  }

  /* Başka alan adları: yalnızca ürün görselleri.
     Diğer her şey (ödeme, ARC, analiz) doğrudan geçsin. */
  if (url.origin !== self.location.origin) {
    if (request.destination === "image") {
      event.respondWith(verVeTazele(request, GORSEL, GORSEL_SINIRI));
    }
    return;
  }

  /* API ve kimlik uçları: dokunma. */
  if (url.pathname.startsWith("/api/")) return;

  /* Next'in ürettiği damgalı dosyalar ve statik görseller. */
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon/") ||
    url.pathname.startsWith("/rozet/") ||
    url.pathname.startsWith("/kategori/")
  ) {
    event.respondWith(onceOnbellek(request, VARLIK));
    return;
  }

  /* Next görsel iyileştirici ve public/ altındaki görseller. */
  if (
    url.pathname.startsWith("/_next/image") ||
    request.destination === "image"
  ) {
    event.respondWith(verVeTazele(request, GORSEL, GORSEL_SINIRI));
    return;
  }

  /* Geri kalan her şey (RSC yükleri dahil) doğrudan ağdan. */
});
