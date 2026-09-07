# İKİ REPO — sırayla

## 1) C:\ArvoARC  (önce bu)

`arc-siparis-detay.zip` içindeki migration'ı Supabase SQL
Editor'de çalıştırın. Bu olmadan sipariş detayları gelmez.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Hesap tek sayfa, siparis detaylari genisletildi"
git push
vercel --prod
```

## Ne değişti

**Sekmeler kalktı.** Hesap bilgileri ve adres defteri üstte yan
yana, siparişler altta tam genişlikte. Müşteri hepsini tek ekranda
görüyor, sekme değiştirmiyor.

**Sipariş kalemlerinde ürün görseli var.** Ürün adı tıklanabilir,
ürün sayfasına gidiyor. Yanında adet ve birim fiyat.

**Tam tutar dökümü:** ara toplam, indirim (kupon kodu da yazıyor),
kargo, toplam. İndirim kırmızı gösteriliyor.

**Teslimat adresi** her siparişin altında.

## Sipariş detayları için ARC notu

Tutar dökümü `arc_orders` tablosundaki `subtotal`, `shipping` ve
`metadata.discount` alanlarından okunuyor. Adres
`metadata.address` içinden.

Eski siparişleri ARC'a elle girdiyseniz bu alanlar boş olabilir —
o durumda ara toplam ve kargo sıfır görünür, adres bölümü hiç
çıkmaz. Sipariş ve kalemler yine listelenir.

Görseller kalemin bağlı olduğu varyant üzerinden ürüne gidilerek
bulunuyor. Elle girilen siparişlerde `variant_id` boşsa görsel
gelmez, yer tutucu görünür.
