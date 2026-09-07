# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Gorseli olmayan kalemler icin yer tutucu"
git push
vercel --prod
```

## Durum

Veri tarafı çalışıyor. `SPR#1015` siparişinde görsel yolu dolu
geliyor; o siparişte görseller görünmeli.

`SPR#1017` ve `SPR#1018` siparişlerindeki SKU'lar (27517, 20643,
20422, 20600) güncel katalogda hiç yok — o ürünler ARC'ta kayıtlı
değil. Hiçbir eşleştirme yöntemi olmayan ürünün görselini bulamaz.

## Bu turda

Görseli bulunamayan kalemler için **baş harf yer tutucusu**
eklendi. Boş kare "yükleniyor" izlenimi veriyordu; harf kasıtlı
görünüyor.

"LR" öneki atlanıyor, sonraki iki kelimenin baş harfi alınıyor —
"LR ALOE VIA Güneş Spreyi" için "AV" gibi.

## Eşleşmeyen ürünleri düzeltmek isterseniz

Eski SKU'ların güncel karşılığı varsa `arc_order_items` tablosunda
güncelleyebilirsiniz:

```sql
update arc_order_items set sku = 'YENİ-SKU' where sku = '27517';
```

Ürünler gerçekten katalogdan çıktıysa buna gerek yok; yer tutucu
yeterli.
