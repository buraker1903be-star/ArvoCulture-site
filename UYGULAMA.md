# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Koleksiyon ve arama sayfalari panel duzenine alindi"
git push
vercel --prod
```

## Sorun neydi

Koleksiyon sayfası panel sistemine hiç alınmamıştı. `<main>`
etiketinde `shell` sınıfı yoktu, bölümler `panel` değildi. Bu
yüzden başlık ekranın soluna yapışıyor, ürün ızgarası kenardan
kenara uzuyor ve sayfa 1600px hizasının dışında kalıyordu.

Ana sayfayı panel diline çevirirken bu sayfayı atlamışım.

## Ne değişti

**Sayfa panel düzenine alındı.** Başlık kendi panelinde, ürün
ızgarası kendi panelinde. Ana sayfayla aynı hizada, aynı
gölgelerde.

**Başlık bölümü düzenlendi.** Ölçek 26–42px arası, açıklama metni
soluk ve 62 karakter genişliğinde sınırlı.

**Filtre satırı ayrıldı.** Ürün sayısı solda, sıralama sağda,
altında ince bir çizgi. Öncesinde ikisi yan yana sıkışıktı.

**Sayfalama butonlaştı.** "Önceki" ve "Sonraki" artık hap biçimli
butonlar; üzerine gelince koyu zemine geçiyor. Üstünde ayraç
çizgisi var.

**Arama sayfası** da aynı panel düzenine alındı.
