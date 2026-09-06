# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Tek gorselli urunlerde hover bosluk hatasi giderildi"
git push
vercel --prod
```

## Hata neydi

İkinci görsel geçişini yazarken kuralı iki parçaya bölmüştüm:
"ikinci görseli göster" ve "birinci görseli gizle". İlki ikinci
görsel yoksa çalışmıyordu ama **ikincisi her zaman çalışıyordu** —
bu yüzden tek görselli üründe kart hover'da bomboş kalıyordu.

## Düzeltme

Görsel bağlantısına `data-multi="true"` niteliği eklendi, yalnızca
ikinci görsel varken. Her iki CSS kuralı da bu niteliğe bağlandı.

Tek görselli üründe hover'da hiçbir şey değişmiyor; görsel sabit
kalıyor.
