import "server-only";
import { env } from "@/lib/env";

/**
 * ARC (arc.arvo-os.com) veri katmanına giden tek çağrı noktası.
 *
 * Bu helper hata durumunda sessizce eski veri döndürmez. Çağıran taraf
 * hatayı görür ve ne yapacağına kendisi karar verir — fiyat gösteren bir
 * yüzeyde eski veri göstermek mesafeli satış mevzuatı açısından risktir.
 */
export class ArcError extends Error {
  constructor(
    readonly rpc: string,
    readonly status: number | null,
    message: string,
  ) {
    super(`ARC ${rpc} başarısız (${status ?? "ağ hatası"}): ${message}`);
    this.name = "ArcError";
  }
}

type RpcOptions = {
  revalidate?: number;
  tags?: string[];
};

export async function rpc<TResult, TParams extends object = object>(
  name: string,
  params: TParams = {} as TParams,
  { revalidate = 60, tags = [] }: RpcOptions = {},
): Promise<TResult[]> {
  const endpoint = new URL(`/rest/v1/rpc/${name}`, env.supabaseUrl);

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
