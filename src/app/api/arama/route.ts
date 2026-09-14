import "server-only";
import { NextResponse } from "next/server";
import { getCachedSearchIndex } from "@/lib/search-cache";
import { searchProducts } from "@/lib/search";

/**
 * Arama ucu.
 *
 * Arama dizini eskiden istemciye gömülüyordu: 3.100 ürünlük liste
 * ana sayfada 1,8 MB, arama sayfasında 1,3 MB yer tutuyordu ve her
 * ziyaretçi — tek bir arama yapmayacak olan da dahil — bunu
 * indiriyordu. Mobil bağlantıda bu, sayfanın açılmasını doğrudan
 * geciktiren bir yük.
 *
 * Artık dizin sunucuda kalıyor, istemci yalnızca yazdıkça sorguyu
 * gönderiyor ve en fazla birkaç kilobaytlık sonuç alıyor.
 */

const MAX_LIMIT = 48;

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("q") ?? "").slice(0, 100);

  const istenenLimit = Number(params.get("limit") ?? MAX_LIMIT);
  const limit =
    Number.isFinite(istenenLimit) && istenenLimit > 0
      ? Math.min(MAX_LIMIT, Math.floor(istenenLimit))
      : MAX_LIMIT;

  if (query.trim().length === 0) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const items = await getCachedSearchIndex();
    /*
      Toplam da dönüyor: sonuçlar en fazla 48 ile sınırlı ve sayı
      yalnızca listeden okununca 300 eşleşmeli bir arama "48 sonuç"
      diyordu.
    */
    const matches = searchProducts(items, query);
    return NextResponse.json({
      results: matches.slice(0, limit),
      total: matches.length,
    });
  } catch (error) {
    /*
      Hata boş sonuç olarak gösterilmiyor. "Sonuç bulunamadı" demek,
      müşteriye kataloğun boş olduğunu söylemektir; arıza ile
      gerçekten sonuç olmaması ayrı şeyler.
    */
    console.error("Arama başarısız:", error);
    return NextResponse.json(
      { results: [], error: "Arama şu anda kullanılamıyor." },
      { status: 503 },
    );
  }
}
