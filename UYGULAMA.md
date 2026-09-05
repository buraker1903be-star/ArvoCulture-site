# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Menu: urun sayilari kaldirildi, tum koleksiyonlar gorunur"
git push
vercel --prod
```

## Bu turda

**Ürün sayıları kaldırıldı.**

**Sınırlar kaldırıldı.** Asıl eksiklik sebebi buydu: her sütunda
6–8 kayıtlık bir sınır vardı ve üç sütun da tam sınıra dayanmıştı.
ARC'ta daha fazla koleksiyon vardı ama menü kesiyordu. Artık ARC'ta
ne varsa hepsi görünüyor.

**Sütunlar ekrana göre açılıyor.** Sabit sayı yerine 200px tabanlı
esnek ızgara: geniş ekranda dört-beş sütun, dar ekranda iki.
Listeler farklı uzunlukta olsa da üstten hizalı duruyor.

**Marka sütunu ayrıldı.** İlk sütun sağ kenarında ince bir çizgiyle
diğerlerinden ayrılıyor — müşterilerin çoğu markayla aradığı için
görsel olarak öne çıkıyor.

## Eksik marka koleksiyonu varsa

`src/components/header.tsx` içindeki `BRANDS.care` listesine slug
ekleyin. Şu an tanımlı olanlar:

```
aloe-vera-cilt-bakim-urunleri
lr-zeitgard
lr-microsilver-plus-urunleri
beauty-diamonds-cilt-bakim-serisi
zg-pro-cilt-bakim-cihazlari-ve-setleri
lr-racine
lr-serox
lr-colostrum
lr-aloe-via-men
lr-vitalbeauty
```

Son beşini LR ürün ailelerine bakarak ekledim; ARC'ta bu slug'larla
koleksiyon yoksa menüde görünmezler, hata vermezler.

Listede olmayan bir marka koleksiyonu "ürün tipine göre" sütununda
çıkar. Menüde yanlış yerde duran bir marka görürseniz slug'ını bu
listeye ekleyin.

ARC panelinde koleksiyon slug'larını görmek için Koleksiyonlar
sayfasına bakabilirsiniz.
