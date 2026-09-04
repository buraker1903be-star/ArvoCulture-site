# ArvoCulture Group — kurumsal site

Holding sitesi. İki dilli (TR / EN), tamamen statik, veritabanı bağımlılığı yok.

## Çalıştırma

```bash
npm install
npm run dev
```

Derleme `fonts.googleapis.com` erişimi gerektirir (next/font — Newsreader + Archivo).

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run build` | Üretim derlemesi |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Ortam değişkenleri

`.env.example` dosyasını kopyalayın. **`.env` dosyalarını asla commit etmeyin.**

| Değişken | Zorunlu | Açıklama |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Evet | Kanonik adres. Boş kalırsa sitemap, canonical ve OG etiketleri yanlış domaine işaret eder. |
| `RESEND_API_KEY` | Form için | Tanımlı değilse iletişim formu 503 döner ve kullanıcıya hata gösterilir — mesaj sessizce kaybolmaz. |
| `CONTACT_TO_EMAIL` | Hayır | Varsayılan `info@arvoculture.com`. |

## Yapı

```
src/
  app/
    (tr)/          TR rotaları, kök: /markalar, /hakkimizda ...
    (en)/en/       EN rotaları: /en/brands, /en/about ...
    api/contact/   Form gönderim endpoint'i
    sitemap.ts     hreflang alternatifleriyle
    robots.ts
  components/
    views/         Sayfa gövdeleri, locale parametresi alır
  lib/
    site.ts        Marka portföyü, kurum bilgileri, rota haritası
    dictionary.ts  Her iki dildeki tüm metinler
    schema.ts      Organization ve BreadcrumbList JSON-LD
```

İki kök layout (`(tr)` ve `(en)`) kullanılıyor; `<html lang>` bu sayede
dile göre doğru üretiliyor.

### İçerik nasıl değiştirilir

- **Metinler:** `src/lib/dictionary.ts`. Her iki dil yan yana duruyor.
- **Markalar:** `src/lib/site.ts` içindeki `brands` dizisi. Kayıt eklediğinizde
  anasayfa, markalar sayfası, detay sayfası, footer ve sitemap otomatik güncellenir.
- **Yeni sayfa:** `routes` nesnesine anahtar ekleyin, iki dilde de rota dosyası
  oluşturun. `alternatesFor()` hreflang'i otomatik üretir.

## Yayına almadan önce

- [ ] `src/lib/site.ts` → `registry`: MERSİS, vergi dairesi/no, ticaret sicil no
- [ ] `/surdurulebilirlik` → ölçüm metodolojisi ve doğrulanmış sayısal dayanak.
      **Dayanaksız çevresel iddia kullanılmamalı.**
- [ ] KVKK ve Gizlilik metinleri taslak hâlinde — hukuk danışmanı onayı şart.
      Yurt dışı aktarım yapılan sağlayıcılar (Vercel, Resend) açıkça listelenmeli.
- [ ] `/hakkimizda` → kuruluş hikâyesi doğrulanmadı, tarih ve sıralamayı teyit edin
- [ ] `/gelecek` → gerçek proje başlıkları
- [ ] `public/logo.png` ve `public/favicon.ico`
- [ ] Marka sitelerine `parentOrganization` geri referansı (tek yönlü bağ zayıf sinyal)
- [ ] `app.*` ve `lab.*` panelleri `noindex`
- [ ] Analitik eklenirse çerez onay mekanizması gerekir — şu an hiç çerez yok

## Notlar

- İletişim formunda bot tuzağı ve dakikada 5 istek sınırı var. Sınır bellek
  içi tutulur; serverless'ta her örnek kendi sayacını taşır, yani tam koruma
  değil. Kötüye kullanım görülürse Upstash Redis gibi paylaşımlı bir sayaca
  taşıyın.
- Sosyal paylaşım görselleri `opengraph-image.tsx` ile kod üretimli. Tasarlanmış
  bir görsel hazırlanınca bu dosyalar kaldırılabilir.
