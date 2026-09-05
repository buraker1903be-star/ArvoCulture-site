# 1. Aşama — Tasarım sistemi + ana sayfa

**Bu paketi `yeniden-tasarim` dalına uygulayın, `main`'e değil.**

```powershell
cd C:\ArvoCulture-site
git checkout -b yeniden-tasarim     # ilk kez ise
```

Zip'i klasöre açın, üzerine yazın. Sonra:

```powershell
git rm src/lib/supabase-public.ts src/app/dynamic.css
git add -A
git commit -m "1. asama: tasarim sistemi ve ana sayfa"
git push -u origin yeniden-tasarim
```

Vercel dal için otomatik önizleme adresi verecek. `arvoculture.com`
mevcut haliyle yayında kalır.

## Ne yapıldı

**Eski CSS tamamen silindi.** 1442 satırlık minified `dynamic.css` ve
eski `globals.css` gitti. Yerine üç okunabilir dosya geldi:

| Dosya | İçerik |
| --- | --- |
| `tokens.css` | Renk, boşluk, tipografi, yarıçap — tek kaynak |
| `globals.css` | Sıfırlama, temel tipografi, buton/rozet/fiyat |
| `components.css` | Kart, ızgara, hero, şeritler |

`!important` yok, minified kod yok, her blok yorumlu.

**Ölçek mağaza düzeyinde.** En büyük başlık 46px (hero), bölüm
başlıkları 20–26px. Öncesinde bölüm başlıkları 72px'e çıkıyordu.

**Sıralama önceliğinize göre:** fiyatı birinci sıraya koydunuz, bu
yüzden indirimli ürünler kategorilerden de önce geliyor.

```
Hero → Güvence → Arama + kupon → İNDİRİMDEKİLER → Kategoriler
→ Çok satanlar → Kampanya → Öne çıkanlar → Yardım
```

**Ürün kartı yeniden yazıldı.** Kırmızı indirim rozeti, büyük fiyat,
üstü çizili eski fiyat, tabana yapışık sepet butonu. Kartlar eşit
yükseklikte. Mobilde iki sütun.

**Izgara:** geniş ekranda 5, 1280px'te 4, 980px'te 3, mobilde 2.

## Bu aşamada eksik olanlar

Ürün sayfası galerisi ve beden seçici geçici olarak sadeleştirildi —
2. aşamada yeniden yazılacak. Koleksiyon ve arama sayfaları yeni kart
sistemini kullanıyor ama kendi stilleri henüz yazılmadı.

## Sonraki aşamalar

2. Ürün + koleksiyon sayfaları
3. Sepet + üyelik
4. PayTR ödeme + sipariş takibi

## Sizden

- Kargo kuralı: 2.000 TL eşiği doğru mu, altında kaç TL alınacak?
- PayTR: üyelik aktif mi, test mağazası var mı, merchant bilgileri elde mi?
