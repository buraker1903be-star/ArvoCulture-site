# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Menu sutun genisligi ve gruplama duzeltmesi"
git push
vercel --prod
```

## Bu turda

**Sütunlar daraldı ve sola toplandı.** Esnek ızgara kullanılınca üç
sütun 1800px'lik paneli paylaşıyor ve her biri 600px oluyordu;
bağlantılar boşlukta kayboluyordu. Artık her sütun sabit 230px ve
sola dayalı. Ekran genişledikçe sütunlar yayılmıyor, sadece yeni
sütun sığıyorsa ekleniyor.

**Başlık çizgisi kısaldı.** Eskiden sütunu boydan boya kesen bir
çizgi vardı ve boşluğu vurguluyordu. Artık başlığın altında kısa
bir zeytin vurgu çizgisi var.

**Saç ürünleri yanlış sütundaydı.** "Saç Kremi" ve "Saç Maskesi"
ihtiyaç değil ürün tipi; "Ürün Tipine Göre" sütununa taşındı.
"Saç Dökülmesi" ihtiyaç sütununda kaldı, orası doğru.

**Panel yüksekliği sınırlandı.** Uzun listelerde ekranı taşırmıyor,
kendi içinde kayıyor.

## Marka koleksiyonu eksikse

Şu an görünenler: Aloe Via, Zeitgard, Microsilver Plus, Beauty
Diamonds, Profesyonel Bakım.

Başka bir marka koleksiyonu ARC'ta varsa ve menüde "Ürün Tipine
Göre" sütununda çıkıyorsa, slug'ını `src/components/header.tsx`
içindeki `BRANDS.care` listesine ekleyin.
