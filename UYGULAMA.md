# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Urun detay sayfasi yeniden tasarlandi"
git push
vercel --prod
```

ARC tarafında migration yok.

## Bu turda

**Galeri geri geldi.** ARC her üründe birden çok görsel tutuyor
ama sayfa yalnızca ilkini gösteriyordu. Artık büyük görselin
altında küçük şerit var; tişörtlerde arka yüz, bakım ürünlerinde
içerik etiketi görülebiliyor. Galeri kaydırırken yerinde kalıyor
(sticky).

**Beden seçimi çalışıyor.** Seçili beden görünür durumda, seçim
sepete taşınıyor, seçmeden eklemeye çalışınca uyarı çıkıyor.

**Adet seçici eklendi.** Müşteri sepete gidip tek tek artırmıyor.

**Fiyat bloğu güçlendi.** İndirimli üründe üstü çizili eski fiyat
ve "şu kadar tasarruf" rozeti var.

**Güvenceler butonun hemen altında** — kargo, iade, güvenli ödeme.
Üçü de tıklanabilir, ilgili sayfaya gidiyor. Satın alma kaygısı
en çok butona basmadan hemen önce yükseliyor; cevabı orada olmalı.

**Ayrıntılar akordeon oldu:** ürün açıklaması, teslimat, iade
koşulları. Açıklama varsayılan olarak açık.

**Benzer ürünler bölümü eklendi.** Aynı kategoriden, stokta olan
beş ürün. Aradığını bulamayan müşteri boş dönmüyor.

**İndirim ve çok satan rozetleri** galerinin sol üstünde.

## Bedenli ürünler için hatırlatma

Beden artık sepete doğru taşınıyor ama ARC tarafında hâlâ doğru
varyanta bağlanmıyor — sipariş fonksiyonu slug üzerinden stokta
olan en ucuz varyantı seçiyor. Giyim satışına başlamadan önce
bunu halletmemiz gerekiyor.
