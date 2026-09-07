# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Cekmecede anlik indirim, kayitli adres, telefon sablonu"
git push
vercel --prod
```

ARC tarafında migration yok.

## 1. Çekmecede anlık indirim

Kod yazıldığı anda uygulanıyor; butona basmak gerekmiyor. Ara
toplam, indirim, kargo ve toplam anında güncelleniyor.

Geçersiz kodda sebep yazıyor: "Bu kod geçerli değil" ya da "Bu kod
2.000 TL ve üzeri sepetlerde geçerli."

**Not:** buradaki hesap yalnızca gösterim içindir. Gerçek indirim
ARC'ta veritabanındaki kayıttan hesaplanır ve PayTR'a giden tutar
odur. İki taraf ayrılırsa sunucu kazanır — istemcide hesaplanan
bir tutara güvenmek fiyat manipülasyonuna açık kapı bırakırdı.

## 2. Kayıtlı adresler ödeme sayfasında

Giriş yapmış müşterinin adresleri kart olarak geliyor; varsayılan
adres form alanlarına otomatik doluyor. Müşteri her siparişte
adres yazmıyor.

"Yeni adres" kartı formu boşaltıp elle girişe açıyor. Seçili adres
düzenlenebiliyor — formdaki değişiklik adres defterini değiştirmez,
yalnızca o siparişe uygulanır.

Adresi olmayan üyede ad, e-posta ve telefon profilden dolduruluyor.

## 3. Telefon şablonu

Alan `+90 (5XX) XXX XX XX` biçiminde. Müşteri ne yazarsa yazsın
(0532…, +90532…, 90 532…) girerken biçimlendiriliyor.

Doğrulama: 5 ile başlayan 10 hane zorunlu. Geçersizken alanın
altında uyarı çıkıyor ve "Ödemeye geç" butonu pasif kalıyor.

Sunucuya `+905XXXXXXXXX` biçiminde gönderiliyor — kargo firmasına
giden veri tek biçimde oluyor.

Açık adres zaten zorunluydu (en az 8 karakter), öyle kalıyor.

## 4. Sepet notu

"Hediye paketi" örneği kaldırıldı. Yerine "Kapıcıya teslim
edilebilir, öğleden sonra evdeyim" yazıyor.

## 5. Sepet düğmesi

Daire zemin tamamen kaldırıldı. Üzerine gelince yalnızca ikon
rengi değişiyor. Klavye odağı halkası duruyor, o erişilebilirlik
için gerekli.
