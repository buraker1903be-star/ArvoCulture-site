# Ödeme akışı — vitrin tarafı

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Odeme akisi: adres formu, onaylar, PayTR yonlendirme"
git push
```

Silinecek dosya yok.

## Eklenenler

| Sayfa | İşlev |
| --- | --- |
| `/odeme` | Adres formu, yasal onaylar, sipariş özeti, PayTR'a yönlendirme |
| `/siparis/tamam` | Ödeme sonrası dönüş |
| `/siparis/hata` | Başarısız ödeme |

## Önemli tasarım kararı

Ödeme sayfasındaki tutarlar **yalnızca gösterim içindir**. Sunucuya
gönderilen tek bilgi hangi ürünün kaç adet istendiğidir; fiyat, indirim,
kargo ve toplam ARC'ta veritabanından hesaplanır ve PayTR'a giden tutar
odur. Bu olmadan tarayıcı konsolundan fiyat değiştirilebilir.

`/siparis/tamam` sayfası "ödemeniz alındı" demez, "siparişiniz alındı"
der. Ödemeyi kesinleştiren tek şey PayTR'ın ARC'a gönderdiği sunucudan
sunucuya bildirimdir; müşterinin tarayıcısının bu sayfaya ulaşması
ödemenin geçtiğini kanıtlamaz.

## Onay kutuları

Üçü de zorunlu: Ön Bilgilendirme Formu, Mesafeli Satış Sözleşmesi, KVKK
Aydınlatma Metni. Mesafeli Sözleşmeler Yönetmeliği gereği ön
bilgilendirme onayı olmadan sipariş alınamaz.

## Test sırası

1. ARC'ta `PAYTR_TEST_MODE=1` olduğundan emin olun
2. PayTR panelinde bildirim URL'si tanımlı olmalı:
   `https://arc.arvo-os.com/api/storefront/paytr-bildirim`
3. Vitrinden sepete ürün ekleyin, `/odeme`'ye gidin, formu doldurun
4. PayTR test kartıyla ödeyin
5. ARC panelinde siparişi kontrol edin:
   - Önce `pending` düşmeli
   - Ödeme sonrası `paid` + `confirmed` olmalı
   - Stok düşmeli

Hepsi doğruysa `PAYTR_TEST_MODE=0` yapıp yeniden dağıtın.

## Bilinen eksik

Kupon kodu ödeme sayfasında henüz uygulanmıyor. Altyapısı ARC tarafında
hazır (`p_coupon_code` parametresi), vitrine alanı eklenecek.
