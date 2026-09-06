# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Arama sonuclari kart duzeninde"
git push
vercel --prod
```

## Bu turda

Arama sayfasındaki sonuçlar **kart ızgarasına** çevrildi. Ürün
kartlarıyla aynı görünüm: büyük görsel, marka, ürün adı, fiyat,
indirim rozeti. Izgara katalog sayfalarıyla aynı — geniş ekranda
beş, mobilde iki sütun.

**Açılır katman liste düzeninde kaldı.** Bu bilinçli: katmanda
dar bir alanda mümkün olduğunca çok sonuç görünmeli ve müşteri
hızlıca taramalı. Kart düzeni orada iki sonuç gösterip alanı
doldururdu.

Bileşen artık `variant` alıyor: `"grid"` arama sayfası için,
`"list"` katman için. Tek bileşen, iki görünüm.
