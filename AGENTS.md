# ArvoCulture

ArvoCulture markasının e-ticaret vitrini. Next.js · Vercel. Veri ve sipariş
hesabı ArvoARC'ta (`arc.arvo-os.com`, ayrı depo: ArvoARC); vitrin yalnızca
gösterir ve siparişi ArvoARC'a iletir. Kurulum için `README.md` ve
`.env.example`.

## Dil

Arayüz metinleri ve kod yorumları **Türkçe**. Yorumlar "ne yaptığını" değil
**neden öyle olduğunu** anlatır; bir hata düzeltiliyorsa eski davranış da
yazılır ("Önceden … gösteriyordu"). Yeni kod bu üsluba uyar.

## Değişmezler

- **Tutarı ArvoARC hesaplar, vitrin aynalar.** PayTR'a giden tutar ArvoARC'ın
  sipariş fonksiyonundan çıkar; vitrindeki rakam yalnızca gösterimdir ama
  ödenenle aynı olmalıdır. Sepet, çekmece, ödeme formu ve SEO şeması kargo,
  ücretsiz kargo ve havale indirimini **yalnızca `lib/order-quote.ts`
  üzerinden** hesaplar. ArvoARC'ta kural değişirse (sipariş fonksiyonu ya da
  `api/storefront/odeme`) bu dosya ve testi aynı gün güncellenir.
  Bu kural bozulunca ne olduğu: 17 Eylül 2026'da ArvoARC iki kuralı değiştirdi,
  vitrine taşınmadı; müşteri ödemede ArvoARC'ın tahsil ettiğinden farklı tutar
  gördü.
- **ArvoARC'ın kuralları** (hepsi kuruş tamsayısıyla):
  - ücretsiz kargo eşiği indirim **öncesi** ara toplamla karşılaştırılır;
  - "Ücretsiz Kargo" kuponu kargoyu sıfırlar;
  - havale indirimi yalnızca mal bedeline (kupon düşülmüş ara toplam)
    uygulanır, kargoya değil; kuruşta yuvarlanır.
- **Birimler.** Vitrin içinde tutarlar **TL**; ArvoARC'la konuşurken **kuruş**.
  Ürün ve varyant fiyatları gelirken `/100` ile TL'ye çevrilir; ArvoARC'a tutar
  gönderen her çağrı `toKurus` kullanır, ArvoARC'tan dönen tutar `/100` ile
  okunur. Bu sınır iki kez hata üretti (ödeme yöntemlerinde 100'e bölünmüş
  tutar, sepet sayfasında kupon ucuna TL gönderilmesi).
- **Sepete her zaman varyant SKU'su yazılır.** ArvoARC SKU yerine ürün
  slug'ı görürse siparişi stokta olan HERHANGİ bir varyanta bağlıyor
  (`arc_create_order`: `order by (v.stock > 0) desc`) — müşteri seçmediği
  tonu/bedeni alır. Bu yüzden:
  - varyant okuması başarısızsa "seçenek yok" sayılmaz; `getProductVariants`
    `okunamadi` döndürür ve satın alma kutusu kapanır (`lib/variants.ts`).
    Boş liste de arızadır: ürün ve katalog fonksiyonları varyant tablosuna
    INNER JOIN ile bağlı;
  - karttan hızlı ekleme KATEGORİYE değil varyant sayısına bakar
    (`/api/varyantlar`, `lib/varyant-ozeti.ts`). "Giyim değilse doğrudan
    ekle" kuralı, kozmetikte renk varyantı çıkınca altı tonlu rujun
    rastgele tonunu sepete yazıyordu;
  - ödeme adımı SKU'suz ve çok varyantlı kalemde siparişi geçirmez
    (eski sepetler müşterinin tarayıcısında duruyor).

- **Stok uygunluğu tek fonksiyondan.** "Satılabilir mi" sorusunu
  ArvoARC'ta yalnızca `arc_variant_available(stock, allow_backorder,
  supplier)` yanıtlar; tedarikçi tamponunu bilen tek yer orası. Ham
  `stock > 0 or allow_backorder` ifadesi altı vitrin fonksiyonunda
  duruyordu: kart "Sepete ekle" derken sipariş "Insufficient stock"
  diyordu (ArvoARC migration 20261017120705).

- **Kupon geçerliliği sunucudadır.** `evaluateCoupon` yalnızca anlık geri
  bildirim içindir; kullanım sınırı ve kişi başı sınırı vitrin bilemez.
  Ödeme formu kod indirimini bu yüzden toplamdan düşmez, notla belirtir.
- **Mağaza ayarları ArvoARC'tan okunur.** Kargo ücreti, ücretsiz kargo eşiği,
  havalenin açık olup olmadığı ve havale oranı mağaza panelinden değişir;
  vitrin bunları `get_arvoculture_storefront_settings` ile okur
  (`lib/store-settings.ts`, 30 sn önbellek) ve `CartContext.salesRules`
  ile bileşenlere taşır. Okunamazsa `lib/shipping.ts` ve `lib/seller.ts`'teki
  sabitlere düşülür — vitrin açık kalır. Hesaplarda bu sabitleri doğrudan
  kullanmayın; `salesRules` kullanın.
  Metinler de aynı kaynaktan: yasal sayfalar, teslimat, SSS, ürün sayfası,
  ana sayfa güvence şeridi ve `llms.txt` kargo cümlesini `shippingTerms`
  (`lib/order-quote.ts`) ile kurar; yasal sayfalar değerleri `getSeller()`
  üzerinden alır. Sayfaya "120 TL" / "2.000 TL" yazmayın. Tek istisna
  tema duyurusunun yedek metni (`storefront-theme.ts`); duyuru panelden
  yönetiliyor.
- **Önbellek yalnızca müşteriden bağımsız, yavaş değişen veriye**
  (koleksiyon, indirim tanımı). Fiyat, stok, sepet ve sipariş verisi
  önbelleğe girmez (`lib/ttl-cache.ts`).
  `rpc`'ye verilen `revalidate` GERÇEKTEN önbelleğe alıyor — dosyadaki
  eski not "POST önbelleğe alınmıyor, süre yok sayılıyor" diyordu ve
  yanlıştı (17.10.2026'da ölçüldü: site haritası bir saatten uzun
  süre eski listeyi verdi). Yani o süre, verinin ne kadar BAYAT
  olabileceğidir ve fiyat/stok okuyan çağrılarda bilinçli bir karar
  olmalı. Site haritası `onbelleksiz: true` okuyor (`force-dynamic`
  bir rota, çelişki yok).

  **Ürün sayfası ÖNBELLEKSİZ OKUYAMAZ** ve bu denendi: rota
  `export const revalidate = 60` ile saklanıyor, Next saklanacak bir
  sayfanın içinde `cache: "no-store"` görünce rotayı hiç çizemiyor
  ve BÜTÜN ürün sayfaları 500 verdi (17.10.2026). Asıl ders: o sayfa
  zaten altmış saniye bayat ve bayatlığı belirleyen fetch değil ROTA
  önbelleği; fetch'i tazelemek hiçbir şey kazandırmıyor. Fiyatı
  gerçekten taze göstermek rota önbelleğinden vazgeçmek demek —
  3.400 ürün sayfasını her istekte yeniden çizmek, yani bir başarım
  kararı. Taahhüt eden rakam zaten orada değil: tutarı ArvoARC
  hesaplıyor ve sepet/ödeme sayfaları (rota önbelleği olmayan
  dinamik sayfalar) o hesabı okuyor.

- **Vitrin ÇOK MAĞAZALI; mağaza adresten çözülür.** Veri katmanı
  `arc_storefront_*` ailesini çağırır ve ilk parametre olarak konağı
  verir (`lib/konak.ts`). ArvoCulture'a özel `get_arvoculture_*`
  aile artık kullanılmıyor — tek mağazaya sabitlenmiş bir vitrin,
  ikinci müşteri alan adını bağladığı gün ona BAŞKASININ mağazasını
  gösterirdi ve hata vermezdi.
  **İki kip var ve ayrımın sebebi önbellek:** `VITRIN_KONAGI`
  tanımlıysa adres ortam değişkeninden gelir ve `headers()` hiç
  çağrılmaz (ürün sayfasının ISR önbelleği korunur); boşsa adres
  istekten okunur ve o sayfalar dinamikleşir.
  **Süreç içi önbellek (`ttlCache`) ANAHTAR İSTER** ve anahtar
  mağazanın adresidir: anahtarsız bir önbellek A'nın satış
  kurallarını (kargo ücreti, havale indirimi) B'nin müşterisine
  gösterirdi — hata vermeyen, yanlış fiyat gösteren bir sızıntı
  (`tests/ttl-cache.test.ts`).

- **Tanıtım sayfalarının metni KİRACININ.** Hakkımızda, SSS ve iletişim
  sayfaları metni `arc_store_pages`'ten okuyor
  (`arc_storefront_pages(p_host)` → `lib/magaza-sayfasi-oku.ts`); satır
  yoksa sayfa kendi YANSIZ varsayılanını çiziyor. Bu sayfalara marka
  anlatısı, telefon, e-posta ya da şirket unvanı YAZILMAZ:
  - iletişim bilgileri ve ticaret unvanı `getSeller()`'dan gelir
    (`lib/seller-source.ts`);
  - kargo cümlesi `shippingTerms()`'ten gelir.
  Önceden üçü de kodda sabitti ve ArvoCulture'ın kendi metniydi
  ("ArvoCulture; giyim, kişisel bakım ve koku dünyasını…",
  `info@arvoculture.com`, `wa.me/905074370507`, şirketin unvanı ve
  adresi). İkinci bir kiracı bu sayfalarla yayına giremezdi: müşterisine
  BAŞKA bir şirketin unvanını ve bizim WhatsApp hattımızı gösterirdi —
  mesafeli satış mevzuatı açısından da hatalı.
  **Kiracı yazdıysa bizim sesimiz çekilir.** Hakkımızda'daki "nasıl
  çalışıyoruz"/"söz" blokları ve SSS'teki varsayılan liste, kiracının
  kendi metni olduğunda çizilmiyor. Birleştirmek, kiracının ağzından
  bizim verdiğimiz sözleri ya da çelişen iki yanıtı aynı sayfada
  gösterirdi.
  Düz metin biçimlendirme kuralları (paragraf, soru-cevap bloğu)
  `lib/magaza-sayfasi.ts`'te ve ArvoARC'taki **ikiziyle aynı** olmak
  zorunda; biri değişirse diğeri aynı gün değişir
  (`tests/magaza-sayfasi.test.ts`).

## Testler

```bash
npm test
```

Node TypeScript tiplerini kendisi siler; `tests/register.mjs` yalnızca `@/`
kısayolunu `src/`'ye çözer. Derleme adımı ve ek bağımlılık yok. Bir hata
düzeltince onu sabitleyen testi de ekleyin.

## Kontroller

`npm run typecheck`, `npm run lint`, `npm run check:css`, `npm test`,
`npm run check:schema`, `npm run check:onbellek` — hepsi CI'da
(`.github/workflows/ci.yml`) çalışır. Derleme CI'da yapılmaz.

**Önbellek denetimi** (`npm run check:onbellek`): fiyat, stok ve site
haritası okuyan ArvoARC fonksiyonları `onbelleksiz: true` ile
çağrılmak zorunda. `rpc`'ye verilen `revalidate` gerçekten önbelleğe
alıyor; dosyadaki eski not "POST önbelleğe alınmıyor" diyordu ve
yanlış olduğu bir yıl sonra ortaya çıktı (site haritası bir saatten
uzun süre eski listeyi verdi). Kural yalnızca yorumda yazdığı için
fark edilmedi; artık denetimde.

**Şema sözleşmesi** (`npm run check:schema`): koddaki tablo, sütun ve RPC
adları canlı şemanın kataloğuyla (`supabase/schema/katalog.json`)
karşılaştırılır. Supabase istemcisi tipsiz olduğu için yanlış sütun adı
derlemede görünmez; üretimde sorgu hata verir ve çoğu yerde hata yakalanıp
boş veri gösterilir (Platform → Ödemeler bu yüzden iki gün "sorun yok"
gösterdi). Yeni sütun/fonksiyon kullanan kodu, migration canlıya uygulanıp
katalog yenilendikten sonra birleştirin.

**Katalog ArvoARC'ın kataloğudur.** Vitrin ArvoARC'ın Supabase projesini
okuyor (`obaskcdxaaezjglayash`), bu yüzden `supabase/schema/katalog.json`
ArvoARC'takinin kopyasıdır; ArvoARC'ta migration uygulanıp katalog
yenilendiğinde buraya da kopyalanır:

```
cp ../ArvoARC/supabase/schema/katalog.json supabase/schema/katalog.json
```

27.09.2026'ya kadar burada 19 Eylül AYRILMASINDAN ÖNCEKİ ortak projenin
dökümü duruyordu: 91 tablo, içlerinde bu veritabanında hiç olmayan 20
ArvoOS tablosu (`crm_*`, `hr_*`, `billing_*`) ve bugün vitrinin okumaya
başladığı `arc_shipments` eksik. Denetim yeşil yanıyordu ama yanlış
veritabanına bakıyordu — yani var olmayan bir tabloya yapılan sorguyu
yakalayamazdı.
