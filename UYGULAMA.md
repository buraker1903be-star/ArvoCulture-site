# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Siparisler kart halinde, detay sayfasi eklendi"
git push
vercel --prod
```

ARC tarafında yeni migration yok.

## Bu turda

**Siparişler kart ızgarasında.** Her sipariş kendi kutusunda:
numara, durum etiketi, ürün görsellerinden oluşan küçük şerit,
tarih ve tutar. Üzerine gelince kart yükseliyor.

Görsel şeridi dört ürün gösteriyor, fazlası "+3" olarak
belirtiliyor. Müşteri hangi siparişin ne olduğunu içeriğini
okumadan görselden tanıyor.

**Detay sayfası eklendi:** `/hesap/siparis/{numara}`

İçinde: ekmek kırıntısı, sipariş numarası, durum ve tarih; solda
ürünler görselleri ve birim fiyatlarıyla, sağda yapışkan özet
paneli (ara toplam, indirim, kargo, toplam) ve teslimat adresi.

## Güvenlik

Detay sayfası siparişi `get_arvoculture_my_orders` üzerinden
çekiyor; o fonksiyon `auth.uid()` ile çalıştığı için başkasının
sipariş numarasını adres çubuğuna yazmak işe yaramıyor —
"Sipariş bulunamadı" görünür.

Giriş yapılmamışsa sayfa hesaba yönlendiriyor.
