import "server-only";
import { cache } from "react";
import { rpcDeger } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { vitrinKonagi } from "@/lib/konak";
import { metinVar, type SayfaMetni } from "@/lib/magaza-sayfasi";

/*
  MAĞAZANIN KENDİ SAYFA METNİNİ OKUMA.

  Üç sayfa (hakkımızda, SSS, iletişim) tek çağrıda geliyor: üçünün
  bağlantısı her sayfanın altbilgisinde duruyor ve ziyaretçi
  aralarında dolaşıyor; sayfa başına bir çağrı, aynı veriyi üç kez
  getirmek olurdu.

  TABLO DEĞİL FONKSİYON. `arc_store_pages` RLS ile üyelere kapalı ve
  vitrin yalnızca yayınlanabilir anahtar taşıyor (servis anahtarı
  vitrine verilmiyor — o anahtar bütün kiracıların siparişlerini
  okuyabilir). Tabloyu doğrudan sorsaydık yanıt sessizce BOŞ
  gelirdi: RLS oturumsuz isteği eliyor, hata vermiyor. Okuma bu
  yüzden `arc_storefront_pages(p_host)` üzerinden.

  Anahtar mağazanın adresi: anahtarsız bir önbellek A mağazasının
  "hakkımızda" metnini B'nin müşterisine gösterirdi (lib/ttl-cache).

  BOŞ NESNE DE SAKLANIYOR. "Bu mağazanın kendi metni yok" geçerli ve
  kalıcı bir yanıt; her istekte yeniden sormanın anlamı yok.
  Varsayılan metinle çalışan bir mağaza (bugün ArvoCulture) aksi
  halde her sayfa çiziminde boşuna sorgu atardı.
*/
type SayfaKumesi = Record<string, SayfaMetni>;

const yukle = ttlCache<SayfaKumesi>(
  async (konak) =>
    (await rpcDeger<SayfaKumesi>(
      "arc_storefront_pages",
      { p_host: konak },
      { revalidate: 300, tags: ["storefront-pages"] },
    )) ?? {},
  5 * 60 * 1000,
  () => true,
);

const kume = cache(async (): Promise<SayfaKumesi> => {
  try {
    const konak = await vitrinKonagi();
    if (!konak) return {};
    return await yukle(konak);
  } catch (hata) {
    /*
      OKUNAMAZSA VARSAYILAN METİN. Metni okuyamamak, sayfayı hiç
      göstermemek için yeterli bir sebep değil: ziyaretçi kusurlu
      bir sayfa yerine çalışan ama genel bir sayfa görür.
    */
    console.error("Mağaza sayfa metinleri okunamadı:", hata);
    return {};
  }
});

/** Mağazanın yazdığı metin; yoksa null (sayfa varsayılanını çizer). */
export async function magazaSayfasi(anahtar: string): Promise<SayfaMetni | null> {
  const sayfa = (await kume())[anahtar];
  if (!metinVar(sayfa)) return null;
  return { baslik: sayfa.baslik.trim(), govde: sayfa.govde.trim() };
}
