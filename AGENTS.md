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
- **Mağaza ayarları şimdilik vitrinde sabit.** Kargo ücreti ve eşiği
  (`lib/shipping.ts`) ile havale oranı (`lib/seller.ts`) ARC'ta mağaza
  panelinden değiştirilebilir hâle geldi ama vitrine açık bir uçtan
  okunmuyor. ARC'taki ayar değişirse bu sabitler de elle güncellenmeli.
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
