import { NextResponse, type NextRequest } from "next/server";
import { SABIT_KONAK } from "@/lib/konak";
import { konagiTemizle, yolaYaz } from "@/lib/konak-yolu";

/*
  ADRES YOLDA TAŞINIYOR.

  (Dosya adı `proxy.ts`: Next 16'da `middleware` adlandırması
  kullanımdan kalkıyor ve derlemede uyarı veriyor.)

  NEDEN: vitrin çok mağazalı ve mağaza adresten çözülüyor. Adresi
  istek başlığından okumak (`headers()`) bir sayfayı DİNAMİK
  yapıyor; `generateStaticParams` olan ürün sayfasında ise Next
  statik üretmeye çalışıp DYNAMIC_SERVER_USAGE fırlatıyor ve sayfa
  500 veriyor. 18.10.2026'da canlıda bütün ürün sayfaları (3.400)
  bu yüzden kapandı.

  Adres YOLUN parçası olunca sorun kökünden kalkıyor: sayfa onu
  `params` ile alıyor, başlık okunmuyor, rota önbelleği çalışıyor
  ve önbellek anahtarı adresi içerdiği için her mağaza KENDİ
  sayfasını saklıyor. Tek mağaza kipinde de aynı yol işliyor; iki
  kip arasındaki ayrım kalktı.

  Müşteri bu segmenti GÖRMÜYOR: `rewrite` adres çubuğunu
  değiştirmiyor, yalnızca hangi rotanın çizileceğini söylüyor.

  NE YENİDEN YAZILMIYOR:
  - `/_next/*` — derleme çıktısı ve görsel iyileştirici.
  - `/api/*` — uç noktalar dinamik, konağı kendileri okuyor.
  - `public/` dosyaları (uzantılı adresler) — orada gerçek dosya var.
  - `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` — bunlar
    Next'in KÖK DİZİNE ÖZGÜ sözleşmeleri. `[konak]` altına
    taşındıklarında rota listesinden tamamen düştüler (robots ve
    manifest hiç üretilmedi, site haritası tuhaf bir adres aldı);
    o yüzden kökte duruyorlar ve konağı kendileri okuyor. Zaten
    dinamik rotalar, `headers()` orada sorun değil.

  `/llms.txt` uzantılı AMA sıradan bir rota klasörü; `[konak]`
  altında kalıyor ve yeniden yazılıyor.
*/

export function proxy(request: NextRequest) {
  /*
    Konak: Vercel özgün adresi `x-forwarded-host`ta taşıyor; `host`
    iç yönlendirmeden sonra dağıtım adresine dönüşebiliyor.
    `VITRIN_KONAGI` tanımlıysa O KAZANIYOR — tek mağaza dağıtımı
    kendi adresine sabitlenir ve uydurma bir `Host` başlığıyla
    başka bir mağaza açılamaz.
  */
  const konak =
    SABIT_KONAK ||
    konagiTemizle(
      request.headers.get("x-forwarded-host") ?? request.headers.get("host"),
    );

  const yeniYol = yolaYaz(request.nextUrl.pathname, konak);
  if (!yeniYol) return NextResponse.next();

  const hedef = request.nextUrl.clone();
  hedef.pathname = yeniYol;
  return NextResponse.rewrite(hedef);
}

export const config = {
  /* Eşleşme deseni geniş; eleme fonksiyonun içinde yapılıyor ki
     gerekçeler tek yerde ve okunur dursun. */
  matcher: ["/((?!_next/static|_next/image).*)"],
};
