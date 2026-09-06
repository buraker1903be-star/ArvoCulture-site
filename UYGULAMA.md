# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Mega menu sutunlari tek satirda"
git push
vercel --prod
```

## Bu turda

Sütunlar sabit 230px genişlikteydi. Kişisel Bakım'da sekiz sütun
var; 8 × 230px + boşluklar 1600px'e sığmıyor ve "İhtiyaca Göre"
alt satıra düşüyordu.

Artık sütunlar mevcut genişliği **eşit paylaşıyor** ve tek satırda
kalıyor. Sütun sayısı arttıkça hepsi birlikte daralır.

240px'lik bir üst sınır var — bu, az sütunlu menülerde (Kozmetik
tek sütun) sütunun sayfa boyunca yayılmasını engelliyor. Daha önce
bu yüzden bağlantılar boşlukta kalıyordu.

900px altında tek satır zorlaması kalkıyor, sütunlar alt alta
geçiyor.

Uzun koleksiyon adları sütuna sığmazsa üç nokta ile kesiliyor;
üzerine gelince tam adı görünür.
