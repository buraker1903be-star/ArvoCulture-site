# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Hakkimizda sayfasi yeniden tasarlandi"
git push
vercel --prod
```

## Bu turda

Hakkımızda sayfası tek panel içinde metin yığınıydı. Artık ana
sayfayla aynı panel diliyle kurulu, beş bölüm:

**1. Giriş** — manifesto tonunda tek iddia, iki eylem butonu.
Sayfa bir çıkmaz sokak değil; okuyan kişi doğrudan seçkiye
geçebiliyor.

**2. Rakamlar** — ürün, koleksiyon ve kategori sayısı. Katalogdan
canlı çekiliyor, elle güncelleme gerekmiyor. Soyut iddialar somut
sayılarla destekleniyor.

**3. Nasıl çalışıyoruz** — üç ilke (Seçki, Şeffaflık, Özen),
numaralı ve üstü zeytin çizgili sütunlar hâlinde.

**4. ArvoCulture sözü** — koyu panel, sayfanın görsel duraklaması.
Yanında dört güvence kartı: orijinal ürün, 3D Secure, 14 gün iade,
özenli paketleme.

**5. Seçkiden** — beş gerçek ürün. Sayfa metinle değil ürünle
bitiyor; okuyan kişi alışverişe dönüyor.

Sayfa artık `getStorefrontProducts` ve `getStorefrontCollections`
kullanıyor; katalog değiştikçe rakamlar ve ürünler kendiliğinden
güncelleniyor.
