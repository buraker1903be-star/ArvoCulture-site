# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Duyuru seridi sabit ve ortalanmis"
git push
vercel --prod
```

## Bu turda

Duyuru şeridi artık **sabit ve ortalanmış**. Kayan bant, okumaya
çalışan kullanıcıyı metnin geçmesini beklemeye zorluyordu; kargo
eşiği ve kupon kodu gibi bilgilerin sabit durması gerekir.

İşaretlemede aynı grup iki kez vardı (kayan bandın kesintisiz
görünmesi için). İkincisi zaten `aria-hidden` idi, sabit düzende
CSS ile gizlendi — `header.tsx` değişmedi.

Maddeler arasına ince bir nokta ayracı kondu. Dar ekranda satır
kaydırıyor, kesilmiyor.

Şerit de 1600px hizasına alındı.
