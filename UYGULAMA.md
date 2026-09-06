# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Baslik eylemleri ikona cevrildi"
git push
vercel --prod
```

## Bu turda

**Ara / Hesap / Sepet artık yalnızca ikon.** Üçü de 40px'lik
yuvarlak dokunma alanına oturdu; üzerine gelince zemini
renkleniyor.

Sepete kendi ikonu (alışveriş çantası) eklendi; öncesinde düz
"Sepet" yazısıydı.

**Sayaç rozet oldu.** Ürün sayısı ikonun sağ üst köşesinde küçük
kırmızı bir baloncukta. Sıfırken de görünüyor — Türkiye'de
alışıldık davranış bu.

**Metin etiketleri gizlendi, silinmedi.** Ekran okuyucular için
`aria-label` zaten vardı; metinler de DOM'da duruyor ve ekran
okuyucuya görünür. Yalnızca gözle görünmüyorlar.

Dokunma hedefi 40×40px — mobilde parmakla isabet için gereken
asgari ölçü.
