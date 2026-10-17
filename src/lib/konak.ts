import "server-only";
import { headers } from "next/headers";

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
