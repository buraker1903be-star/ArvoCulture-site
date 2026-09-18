# ArvoCulture

ArvoCulture markasının e-ticaret vitrini. Next.js · Vercel. Veri ve sipariş
hesabı ARC'ta (`arc.arvo-os.com`, ayrı depo: ArvoARC); vitrin yalnızca
gösterir ve siparişi ARC'a iletir. Kurulum için `README.md` ve
`.env.example`.

## Dil

Arayüz metinleri ve kod yorumları **Türkçe**. Yorumlar "ne yaptığını" değil
**neden öyle olduğunu** anlatır; bir hata düzeltiliyorsa eski davranış da
yazılır ("Önceden … gösteriyordu"). Yeni kod bu üsluba uyar.

## Değişmezler

- **Tutarı ARC hesaplar, vitrin aynalar.** PayTR'a giden tutar ARC'ın
  sipariş fonksiyonundan çıkar; vitrindeki rakam yalnızca gösterimdir ama
  ödenenle aynı olmalıdır. Sepet, çekmece, ödeme formu ve SEO şeması kargo,
  ücretsiz kargo ve havale indirimini **yalnızca `lib/order-quote.ts`
  üzerinden** hesaplar. ARC'ta kural değişirse (sipariş fonksiyonu ya da
  `api/storefront/odeme`) bu dosya ve testi aynı gün güncellenir.
  Bu kural bozulunca ne olduğu: 17 Eylül 2026'da ARC iki kuralı değiştirdi,
  vitrine taşınmadı; müşteri ödemede ARC'ın tahsil ettiğinden farklı tutar
  gördü.
- **ARC'ın kuralları** (hepsi kuruş tamsayısıyla):
  - ücretsiz kargo eşiği indirim **öncesi** ara toplamla karşılaştırılır;
  - "Ücretsiz Kargo" kuponu kargoyu sıfırlar;
  - havale indirimi yalnızca mal bedeline (kupon düşülmüş ara toplam)
    uygulanır, kargoya değil; kuruşta yuvarlanır.
- **Birimler.** Vitrin içinde tutarlar **TL**; ARC'la konuşurken **kuruş**.
  Ürün ve varyant fiyatları gelirken `/100` ile TL'ye çevrilir; ARC'a tutar
  gönderen her çağrı `toKurus` kullanır, ARC'tan dönen tutar `/100` ile
  okunur. Bu sınır iki kez hata üretti (ödeme yöntemlerinde 100'e bölünmüş
  tutar, sepet sayfasında kupon ucuna TL gönderilmesi).
- **Kupon geçerliliği sunucudadır.** `evaluateCoupon` yalnızca anlık geri
  bildirim içindir; kullanım sınırı ve kişi başı sınırı vitrin bilemez.
  Ödeme formu kod indirimini bu yüzden toplamdan düşmez, notla belirtir.
- **Mağaza ayarları ARC'tan okunur.** Kargo ücreti, ücretsiz kargo eşiği,
  havalenin açık olup olmadığı ve havale oranı mağaza panelinden değişir;
  vitrin bunları `get_arvoculture_storefront_settings` ile okur
  (`lib/store-settings.ts`, 30 sn önbellek) ve `CartContext.salesRules`
  ile bileşenlere taşır. Okunamazsa `lib/shipping.ts` ve `lib/seller.ts`'teki
  sabitlere düşülür — vitrin açık kalır. Hesaplarda bu sabitleri doğrudan
  kullanmayın; `salesRules` kullanın.
  Hâlâ sabit olan yalnızca bilgilendirme metinleri: hukuki sayfalar ve SSS'deki
  "120 TL" / "2.000 TL" yazıları (`SELLER.shippingFee`,
  `SELLER.freeShippingThreshold`) ve `llms.txt`. Panelde tarife değişirse
  bunlar da elle güncellenmeli.
- **Önbellek yalnızca müşteriden bağımsız, yavaş değişen veriye**
  (koleksiyon, indirim tanımı). Fiyat, stok, sepet ve sipariş verisi
  önbelleğe girmez (`lib/ttl-cache.ts`).

## Testler

```bash
npm test
```

Node TypeScript tiplerini kendisi siler; `tests/register.mjs` yalnızca `@/`
kısayolunu `src/`'ye çözer. Derleme adımı ve ek bağımlılık yok. Bir hata
düzeltince onu sabitleyen testi de ekleyin.

## Kontroller

`npm run typecheck`, `npm run lint`, `npm run check:css`, `npm test` — dördü
de CI'da (`.github/workflows/ci.yml`) çalışır. Derleme CI'da yapılmaz.

**Şema sözleşmesi** (`npm run check:schema`): koddaki tablo, sütun ve RPC
adları canlı şemanın kataloğuyla (`supabase/schema/katalog.json`)
karşılaştırılır. Supabase istemcisi tipsiz olduğu için yanlış sütun adı
derlemede görünmez; üretimde sorgu hata verir ve çoğu yerde hata yakalanıp
boş veri gösterilir (Platform → Ödemeler bu yüzden iki gün "sorun yok"
gösterdi). Yeni sütun/fonksiyon kullanan kodu, migration canlıya uygulanıp
katalog yenilendikten sonra birleştirin.
