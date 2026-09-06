# HANGİ REPO: C:\ArvoCulture-site

## Önce iki dosya indirin

```
public/rozet/paytr.png           — PayTR logosu
public/rozet/paytr-kartlar.png   — PayTR resmi kart logo bandı
```

PayTR panelinize girin → **Mağaza Yönetimi** altında logo/banner
bölümü var. Oradan:

1. **PayTR logosu** (şeffaf zeminli PNG, ~84×26 oranında)
2. **Logo bandı** — Visa, Mastercard, Troy ve American Express
   logolarını tek görselde barındıran resmi bant

Bulamazsanız PayTR destek ekibinden "üye iş yeri logo paketi"
isteyin; bu görselleri sitede kullanmanız zaten bekleniyor.

Dosyalar yoksa alanlar boş görünür ama sayfa bozulmaz.

## Sonra

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Odeme bolumu PayTR resmi gorselleriyle"
git push
vercel --prod
```

## Bu turda

Elle çizdiğim kart işaretleri kaldırıldı. Visa, Mastercard, Troy ve
Amex logoları tescilli markalardır; taklit çizim hem hukuken riskli
hem de amatör görünüyordu.

Yerine PayTR'nin resmi görselleri geldi:

- **Solda:** PayTR logosu ve altında açıklama — "Ödemeler PayTR
  altyapısı üzerinden 3D Secure ile alınır. Kart bilgileriniz
  mağazamıza iletilmez."
- **Sağda:** PayTR'nin kart logo bandı

Bu düzen ödeme kuruluşunun PayTR olduğunu, kart markalarının ise
kabul edilen ödeme araçları olduğunu doğru şekilde ayırıyor.
Türkiye'de üye iş yerlerinin standart gösterimi budur.
