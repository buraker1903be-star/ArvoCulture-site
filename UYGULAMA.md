# İKİ REPO — sırayla

## 1) C:\ArvoARC

`arc-esitleme.zip` içindeki migration'ı Supabase SQL Editor'de
çalıştırın.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Gecmis siparislerden profil ve adres aktarimi"
git push
vercel --prod
```

## Ne yapıldı

Sahiplenme fonksiyonu genişletildi. Önceden yalnızca siparişleri
hesaba bağlıyordu; artık ad, telefon ve adresleri de aktarıyor.

**Ad ve telefon** en güncel siparişten alınır. Profilde zaten
değer varsa **üzerine yazmaz** — müşterinin kendi girdiği bilgi
korunur.

**Adresler** siparişlerdeki `metadata.address` alanından
oluşturulur. Aynı açık adres + ilçe zaten kayıtlıysa atlanır, bu
yüzden fonksiyon her çağrıldığında mükerrer kayıt oluşmaz.

Birden fazla farklı adresle sipariş verilmişse hepsi ayrı kayıt
olur ("Kayıtlı adres", "Kayıtlı adres 2"…). İlki varsayılan olur —
kullanıcının başka varsayılan adresi yoksa.

Aktarılan adresler hem fatura hem teslimat olarak işaretlenir;
müşteri dilerse düzenler.

**Adres defteri açıldığında da tetiklenir.** Müşteri profil
sekmesine hiç girmese bile adresleri görür.

## Test

Hesabınıza girip Adreslerim sekmesini açın. Eski siparişlerinizdeki
adresler listelenmeli. Hesap bilgilerim sekmesinde ad ve telefon
dolu gelmeli.

Gelmezse eski siparişlerin `metadata` alanında `address` ve
`phone` bilgisi olmayabilir — ARC'a elle girdiğiniz siparişlerde
bu alanlar boş olabilir. O durumda haber verin, ARC'taki farklı
bir alandan okuyacak şekilde düzenlerim.
