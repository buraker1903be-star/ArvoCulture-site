import "server-only";
import { env } from "@/lib/env";

/**
 * ArvoARC (arc.arvo-os.com) veri katmanına giden tek çağrı noktası.
 *
 * Bu helper hata durumunda sessizce eski veri döndürmez. Çağıran taraf
 * hatayı görür ve ne yapacağına kendisi karar verir — fiyat gösteren bir
 * yüzeyde eski veri göstermek mesafeli satış mevzuatı açısından risktir.
 */
export class ArcError extends Error {
  /*
    Alanlar constructor parametresinde DEĞİL, gövdede atanıyor: test
    çalıştırıcısı (node --test) TypeScript'i yalnızca silerek çalışıyor
    ve parametre özelliği silinemiyor — bu dosya testten hiç import
    edilemiyordu.
  */
  readonly rpc: string;
  readonly status: number | null;

  constructor(rpc: string, status: number | null, message: string) {
    super(`ArvoARC ${rpc} başarısız (${status ?? "ağ hatası"}): ${message}`);
    this.name = "ArcError";
    this.rpc = rpc;
    this.status = status;
  }
}

type RpcOptions = {
  /**
   * DİKKAT: BU DEĞER GERÇEKTEN ÖNBELLEĞE ALIYOR (17.10.2026'da
   * ölçüldü).
   *
   * Burada yıl boyunca şu not duruyordu: "PostgREST'te fonksiyon
   * çağrısı POST ile yapılıyor; Next'in veri önbelleği yalnızca GET
   * saklıyor, yani buradaki süre sessizce yok sayılıyor ve her çağrı
   * veritabanına gidiyor." YANLIŞ.
   *
   * Kanıt: ArvoARC'ta satılamaz ürünleri site haritasından çıkaran
   * migration uygulandı ve veritabanı 2.899 ürün vermeye başladı.
   * Canlı site haritası bir saatten uzun süre 3.407 verdi. Sayfanın
   * kendisi tazeydi — statik adreslerin lastmod değeri isteğin
   * saatiydi — yani eski olan yanıt değil, fetch'in kendisiydi.
   * Çağrıya `onbelleksiz` eklenince aynı dakika 2.899'a düştü.
   *
   * SONUÇ: buradaki süre, verinin ne kadar BAYAT olabileceğidir.
   * Fiyat ve stok okuyan çağrılarda bu bilinçli bir karar olmalı;
   * "nasılsa yok sayılıyor" diye bırakılamaz. Ürün sayfası
   * (fiyat, stok, sepete yazılan SKU) bu yüzden `onbelleksiz`
   * okunuyor; liste sayfaları 60 saniyeyi kabul ediyor.
   *
   * Tema bunun istisnası: o `GET` ile çekiliyor ve Next tarafından
   * gerçekten önbelleğe alınıyor.
   */
  revalidate?: number;
  tags?: string[];
  /**
   * Önbelleğe HİÇ girmesin.
   *
   * 17.10.2026'da site haritası bir saatten uzun süre eski listeyi
   * verdi: ArvoARC'ta satılamaz ürünleri dışarıda bırakan migration
   * uygulandı (veritabanı 2.899 ürün diyor) ama sitemap 3.407
   * vermeye devam etti. Sayfanın kendisi tazeydi — statik
   * adreslerin `lastmod` değeri isteğin saatiydi — yani eski olan
   * yanıt değil, FETCH'in kendisiydi. Yukarıdaki not "POST
   * önbelleğe alınmıyor, bu süre yok sayılıyor" diyor; en azından
   * bu çağrı için doğru değil.
   *
   * Bayatlığın kabul edilemez olduğu yerlerde (site haritası arama
   * motoruna "bu adresi indeksle" diyor; sayfa aynı anda
   * "indekslemeyin" diyorsa çelişki üretir) bu seçenek açılır.
   */
  onbelleksiz?: boolean;
  /**
   * İstenen sütunlar, virgülle ayrılmış.
   *
   * PostgREST, tablo döndüren fonksiyonlarda da dikey süzmeyi
   * destekler. Kullanılmayan sütunları istememek büyük fark
   * yaratıyor: katalog listesi tüm sütunlarla 11,9 MB, yalnızca
   * kart için gereken sütunlarla 3,0 MB. Bu veri her istekte
   * Supabase’den sunucuya taşınıyor.
   *
   * Verilmezse fonksiyonun tüm sütunları gelir.
   */
  columns?: string;
};

/**
 * Çağrının kendisi. `rpc` ve `rpcDeger` bunu paylaşıyor.
 *
 * İkiye ayrıldı çünkü PostgREST, fonksiyonun DÖNÜŞ TİPİNE göre farklı
 * şekilde yanıtlıyor: tablo döndüren bir fonksiyon dizi, skaler
 * döndüren (örneğin `returns jsonb`) ise değerin KENDİSİNİ veriyor.
 * Tek bir `rpc` ikisini de "dizi" diye tiplerse, skaler çağıran taraf
 * derlemede doğru görünüp çalışma anında `undefined` okur.
 */
async function istek<TParams extends object>(
  name: string,
  params: TParams,
  { revalidate = 60, tags = [], columns, onbelleksiz = false }: RpcOptions = {},
): Promise<unknown> {
  const endpoint = new URL(`/rest/v1/rpc/${name}`, env.supabaseUrl);
  if (columns) endpoint.searchParams.set("select", columns);

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: env.supabaseKey,
        Authorization: `Bearer ${env.supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
      ...(onbelleksiz
        ? { cache: "no-store" as const }
        : { next: { revalidate, tags: [name, ...tags] } }),
    });
  } catch (cause) {
    throw new ArcError(name, null, (cause as Error).message);
  }

  if (!response.ok) {
    throw new ArcError(
      name,
      response.status,
      await response.text().catch(() => ""),
    );
  }

  /*
    BOŞ GÖVDE HATA DEĞİL.

    `returns void` bir fonksiyonda PostgREST 204 ve BOŞ gövde
    dönüyor; `response.json()` o gövdede "Unexpected end of JSON
    input" fırlatıyordu. Yani işini yapmış bir çağrı başarısız
    görünüyor ve çağıran taraf onu yeniden deneyebiliyordu.
    Ziyaret sayacında tam bu oldu (19.10.2026).
  */
  const metin = await response.text();
  if (metin.trim() === "") return null;
  return JSON.parse(metin);
}

export async function rpc<TResult, TParams extends object = object>(
  name: string,
  params: TParams = {} as TParams,
  options: RpcOptions = {},
): Promise<TResult[]> {
  return (await istek(name, params, options)) as TResult[];
}

/**
 * Skaler döndüren fonksiyonlar için (`returns jsonb` gibi).
 *
 * Kayıt bulunamadığında fonksiyon `null` döndürüyor; burada da `null`
 * geliyor. Çağıran taraf "bulunamadı" ile "okunamadı"yı ayırabilsin
 * diye hata YUTULMUYOR — okunamama `ArcError` olarak fırlıyor.
 */
export async function rpcDeger<TResult, TParams extends object = object>(
  name: string,
  params: TParams = {} as TParams,
  options: RpcOptions = {},
): Promise<TResult | null> {
  return ((await istek(name, params, options)) ?? null) as TResult | null;
}

/**
 * Katalog listeleri gibi, veri gelmediğinde sayfanın çökmesi yerine boş
 * görünmesinin daha doğru olduğu yüzeyler için. Boş liste dürüsttür;
 * eski fiyat değildir.
 */
export async function rpcOrEmpty<TResult, TParams extends object = object>(
  name: string,
  params?: TParams,
  options?: RpcOptions,
): Promise<TResult[]> {
  try {
    return await rpc<TResult, TParams>(name, params, options);
  } catch (error) {
    console.error(error);
    return [];
  }
}

/**
 * Bütün satırları sayfa sayfa getirir.
 *
 * NEDEN VAR: 29.09.2026'da arama dizini sessizce 1000 üründe
 * kesiliyordu. Fonksiyon `limit 20000` diyordu ama PostgREST tek
 * istekte 1000 satır döndürüyor; üstelik dizin `updated_at desc`
 * sıralı olduğu ve tedarikçi içe aktarımı on dakikada bir 15.000
 * varyantı güncellediği için dizin sürekli "en son dokunulan 1000
 * ürün"e dönüşüyordu. Sonuç: müşteri satın alabildiği ürünü arayıp
 * bulamıyordu ("aloe" 0 sonuç, oysa ürün sayfası ve koleksiyon
 * listesi çalışıyor).
 *
 * Kesilme SESSİZDİ: hata yok, eksik veri var. Bu yüzden güvenlik
 * sınırı da koyuldu; aşılırsa günlüğe yazılıyor.
 *
 * SAYFALAMA BAŞLIKLA DEĞİL PARAMETREYLE. İlk sürüm `Range` başlığı
 * gönderiyordu; PostgREST bu RPC uçlarında başlığı YOK SAYIYOR ve her
 * sayfa aynı ilk 1000 satırı döndürüyordu. Canlıda dizin 50 kat
 * tekrarlanmış 49.800 satıra çıktı, aranan ürün yine bulunamadı
 * (30.09.2026'da ölçüldü, geri alındı). Fonksiyonlara `p_offset`
 * eklendi; sayfalar artık gerçekten ilerliyor.
 *
 * Çağrılan fonksiyonun `p_limit` ve `p_offset` alması ZORUNLU —
 * almıyorsa her sayfa aynı satırları getirir ve sessizce yinelenmiş
 * bir liste üretir.
 */
export async function rpcTumSayfalar<TResult, TParams extends object = object>(
  name: string,
  params: TParams = {} as TParams,
  options: RpcOptions = {},
  { sayfaBoyutu = 1000, enFazlaSayfa = 50 }: { sayfaBoyutu?: number; enFazlaSayfa?: number } = {},
): Promise<TResult[]> {
  const hepsi: TResult[] = [];
  for (let sayfa = 0; sayfa < enFazlaSayfa; sayfa += 1) {
    const satirlar = await rpc<TResult>(
      name,
      { ...params, p_limit: sayfaBoyutu, p_offset: sayfa * sayfaBoyutu },
      options,
    );
    hepsi.push(...satirlar);
    if (satirlar.length < sayfaBoyutu) return hepsi;
  }
  console.error(`${name}: sayfa sınırına takıldı (${enFazlaSayfa} sayfa); liste eksik olabilir.`);
  return hepsi;
}
