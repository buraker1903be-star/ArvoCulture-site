import "server-only";
import { cache } from "react";
import { rpcDeger } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";
import { vitrinKonagi } from "@/lib/konak";
import { metinVar, type SayfaMetni } from "@/lib/magaza-sayfasi";
import type { Dil } from "@/lib/dil-onek";

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
/*
  RPC SATIRI DÖRT ALAN TAŞIYOR. `baslik`/`govde` kiracının Türkçe
  metni, `baslik_en`/`govde_en` İngilizcesi (ArvoARC migration
  20261022221425). İngilizce alanlar YOKSA eski bir dağıtıma
  bakıyoruz demektir ve `undefined` geliyor — tip bunu söylüyor ki
  kod "boş İngilizce" ile "alan hiç yok"u aynı yerden geçirsin.
*/
type SayfaSatiri = {
  baslik?: string | null;
  govde?: string | null;
  baslik_en?: string | null;
  govde_en?: string | null;
};

type SayfaKumesi = Record<string, SayfaSatiri>;

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

/*
  DİLE GÖRE METİN — TÜRKÇEYE DÜŞMÜYOR.

  İngilizce istenip İngilizcesi yazılmamışsa `null` dönüyor ve sayfa
  KENDİ İngilizce varsayılanını çiziyor. Türkçe metne düşmek kolay
  olurdu ama İngilizce bir sayfada Türkçe bir paragraf, çevirinin
  yarıda kaldığını göstermekten başka bir şey yapmaz — üstelik
  kiracının marka anlatısı, okuyamayan bir ziyaretçiye hiçbir şey
  anlatmıyor.

  Ters yön de aynı: Türkçe istenip Türkçesi boşsa İngilizceye
  DÜŞMÜYOR.
*/
export async function magazaSayfasi(
  anahtar: string,
  dil: Dil = "tr",
): Promise<SayfaMetni | null> {
  const sayfa = (await kume())[anahtar];
  if (!sayfa) return null;

  const secilen: SayfaMetni | null =
    dil === "en"
      ? { baslik: sayfa.baslik_en ?? "", govde: sayfa.govde_en ?? "" }
      : { baslik: sayfa.baslik ?? "", govde: sayfa.govde ?? "" };

  if (!metinVar(secilen)) return null;
  return { baslik: secilen.baslik.trim(), govde: secilen.govde.trim() };
}
