# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Beyaz motifli arka plan, mobil menu duzeltmesi, logo boyutu"
git push
vercel --prod
```

## Bu turda

**Mobil menü masaüstünde görünüyordu.** Sarmalayıcı `.mobile-menu`
idi ve hiç stillendirilmemişti. Artık masaüstünde tamamen gizli,
mobilde yalnızca `.open` sınıfı varken açılıyor.

**Arka plan beyaz, motifli ve hareketli.** İki katman:

1. Seyrek zeytin noktalardan oluşan doku (26px ızgara), 90 saniyede
   bir kare kayarak sonsuz döner — kesintisiz görünür.
2. Üstünde iki yumuşak ışık lekesi (zeytin ve altın), 26 saniyede
   yavaşça nefes alır.

İkisi de `position: fixed`, yani sayfa kayarken yerinde durur.
`background-attachment: fixed` kullanılmadı; o özellik mobil
Safari'de titriyor.

Hareket, işletim sisteminde "hareketi azalt" açıksa duruyor.

**Logo 30px'ten 22px'e indi.**

## Not

Arka plan açık renge döndüğü için `.panel-clear` bölümlerinin metin
rengi beyazdan koyuya çevrildi; yoksa okunmazdı.
