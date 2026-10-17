import "server-only";
import { headers } from "next/headers";
import { rpcDeger } from "@/lib/arc";
import { ttlCache } from "@/lib/ttl-cache";

/*
  VİTRİN HANGİ MAĞAZANIN?

  ArvoARC çok mağazalı: `arc_storefront_*` fonksiyonları ilk
  parametre olarak ADRESİ alıyor ve mağazayı ondan çözüyor
  (arc_storefront_org). Bu dosya o adresi veriyor.

  İKİ KİP VAR ve ayrımın sebebi ÖNBELLEK:

  * TEK MAĞAZA (VITRIN_KONAGI tanımlı) — adres ortam değişkeninden
    geliyor, istek başlığına HİÇ bakılmıyor. Önemi şu: `headers()`
    çağırmak Next'te rotayı dinamikleştiriyor ve ürün sayfasının
    altmış saniyelik rota önbelleğini düşürüyor (canlıda ölçüldü:
    x-vercel-cache HIT → MISS). ArvoCulture kendi dağıtımında bu
    kiple çalışıyor ve önbelleğini koruyor.

  * ÇOK MAĞAZA (VITRIN_KONAGI boş) — adres istekten okunuyor. Aynı
    dağıtım bütün mağazalara hizmet ediyor; bedeli, adresi okuyan
    sayfaların dinamikleşmesi.

  Tek kipe indirmek mümkündü ama ikisinden biri bedava değil:
  hepsini dinamik yapmak ArvoCulture'ın önbelleğini siler, hepsini
  sabit yapmak ikinci mağazayı imkânsız kılar. Yük sorun olursa
  sıradaki adım adresi YOLA taşımak (middleware ile) — o zaman çok
  mağazalı kipte de önbellek geri gelir.
*/

/** Tek mağaza kipi: tanımlıysa adres hep bu. */
export const SABIT_KONAK = (process.env.VITRIN_KONAGI ?? "").trim().toLowerCase();

export const tekMagazaKipi = () => SABIT_KONAK.length > 0;

/*
  Şema, port ve yol ArvoARC tarafında da düşürülüyor
  (arc_storefront_org) — burada yalnızca küçük harfe iniyoruz.
  İki tarafın da sadeleştirmesi var ve bu bilinçli: fonksiyon
  tek başına da doğru çalışmalı, vitrine güvenmemeli.
*/
export async function vitrinKonagi(): Promise<string> {
  if (SABIT_KONAK) return SABIT_KONAK;
  const baslik = await headers();
  /* Vercel özgün konağı x-forwarded-host'ta taşıyor; host, iç
     yönlendirmeden sonra dağıtım adresine dönüşebiliyor. */
  return (baslik.get("x-forwarded-host") ?? baslik.get("host") ?? "").toLowerCase();
}


/*
  ADRESTEN KURUM KİMLİĞİ.

  Vitrin fonksiyonlarının çoğu kurumu kendisi çözüyor (konağı alıp
  arc_storefront_org'u çağırıyorlar) ve bu yüzden burada kimliğe
  ihtiyaç yok. İki yer istisna: mağaza durumu
  (arc_store_stage(p_organization_id)) ve tema — ikisi de kurum
  kimliğiyle okunuyor ve ikisi de vitrinin ÇOK MAĞAZALI olmasından
  önce yazıldı.

  Bu fonksiyon o boşluğu kapatıyor. ENV'DEN OKUNAN SABİT KİMLİK
  KALDIRILDI: tek mağazaya sabitlenmiş bir kimlik, ikinci müşterinin
  vitrininde ArvoCulture'ın temasını ve mağaza durumunu gösterirdi.

  Önbellek konak başına: kurum kimliği değişmeyen bir eşleme, her
  istekte sormanın anlamı yok.
*/
const kurumlar = ttlCache(
  (konak: string) => rpcDeger<string>("arc_storefront_org", { p_host: konak }, { revalidate: 300 }),
  5 * 60 * 1000,
  /* null saklanmıyor: doğrulanmamış alan adı birkaç dakika sonra
     doğrulanmış olabilir, "bu adres hiçbir mağazaya ait değil"i beş
     dakika taşımak gereksiz. */
  (deger) => Boolean(deger),
);

/** Adresin ait olduğu mağazanın kimliği; eşleşme yoksa null. */
export async function vitrinKurumu(): Promise<string | null> {
  const konak = await vitrinKonagi();
  if (!konak) return null;
  try {
    return await kurumlar(konak);
  } catch (hata) {
    console.error("Mağaza kimliği çözülemedi:", hata);
    return null;
  }
}


/*
  VİTRİNİN KENDİ ADRESİ (şemayla birlikte).

  Kanonik adres, site haritası, robots ve OG görselleri bununla
  kuruluyor. Sabit bir adres (env.siteUrl) ikinci müşterinin site
  haritasına ArvoCulture'ın adreslerini yazardı — arama motoruna
  "bu sayfalar benim" diyen bir dosyada başka bir markanın adresi.

  Tek mağaza kipinde değer yine ortam değişkeninden gelir ve
  headers() çağrılmaz; o kipte bu fonksiyon yalnızca şemayı ekler.
*/
export async function vitrinAdresi(): Promise<string> {
  const konak = await vitrinKonagi();
  if (konak) return `https://${konak}`;
  /* Ne konak ne ayar: yerel geliştirme. */
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
