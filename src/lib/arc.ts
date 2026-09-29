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
   * DİKKAT: Bu değer tek başına bir şey yapmıyor.
   *
   * PostgREST'te fonksiyon çağrısı POST ile yapılıyor; Next'in veri
   * önbelleği ise yalnızca GET isteklerini saklıyor. Yani buradaki
   * süre sessizce yok sayılıyor ve her çağrı veritabanına gidiyor.
   *
   * Değer yine de veriliyor: niyeti belgeliyor ve Next'in ileride
   * POST önbelleklemesi gelirse yerinde duruyor. Ama gerçekten
   * önbelleğe alınması gereken çağrılar `ttlCache` ile sarılmalı —
   * koleksiyonlar, indirimler ve arama dizini öyle yapıyor.
   *
   * Tema bunun istisnası: o `GET` ile çekiliyor ve Next tarafından
   * gerçekten önbelleğe alınıyor.
   */
  revalidate?: number;
  tags?: string[];
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

export async function rpc<TResult, TParams extends object = object>(
  name: string,
  params: TParams = {} as TParams,
  { revalidate = 60, tags = [], columns }: RpcOptions = {},
): Promise<TResult[]> {
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
      next: { revalidate, tags: [name, ...tags] },
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

  return (await response.json()) as TResult[];
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
