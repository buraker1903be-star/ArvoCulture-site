# İKİ REPO — sırayla

## 1) C:\ArvoARC  (asıl düzeltme burada)

`arc-adres-silme.zip` içindeki migration'ı Supabase SQL Editor'de
çalıştırın.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Adres silme duzeltmesi"
git push
vercel --prod
```

## Sorun neydi

Adres defteri her açıldığında `claim_arvoculture_orders`
çağrılıyordu ve o fonksiyon siparişlerden adresleri **yeniden
oluşturuyordu**. Siliyordunuz, sayfa yenilenince geri geliyordu.

Fonksiyonu her açılışta çağırmak, aktarımın gecikmeli çalışan
hesaplarda da tamamlanması içindi — ama silmeyi imkânsız hale
getirmiş.

## Çözüm

Aktarım tamamlandığında kullanıcının profiline
`addresses_imported` işareti yazılıyor. Fonksiyon o işareti
görünce adres aktarımını atlıyor.

Sipariş sahiplenmesi ve ad/telefon aktarımı çalışmaya devam
ediyor — onlar zaten mükerrer kayıt oluşturmuyordu.

Ayrıca silme artık anında görünüyor: kayıt önce ekrandan
kaldırılıyor, sunucu hatasında geri yükleniyor.

## Not

Migration'dan sonra ilk açılışta aktarım bir kez daha çalışıp
işareti koyacak. O turda silinmiş adresler bir defa daha
gelebilir; tekrar silin, bir daha dönmeyecek.
