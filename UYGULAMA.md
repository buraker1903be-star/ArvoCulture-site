# İKİ REPO — sırayla

## 1) C:\ArvoARC  (önce bu)

`arc-adres.zip` içindeki migration'ı Supabase SQL Editor'de
çalıştırın. Adres tablosu olmadan vitrin tarafı çalışmaz.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Tam profilli hesap sayfasi"
git push
vercel --prod
```

## Ne yapıldı

Hesap sayfası **üç sekmeli tam profile** dönüştü:

**Siparişlerim** — geçmiş siparişler, durum, tarih, tutar ve
kalemler. Sipariş takibiyle ilgili yönlendirme metinleri
kaldırıldı; takip kodunu sipariş başına siz ekleyeceksiniz.

Durum etiketleri güncellendi: `fulfilled` ve `delivered` artık
"Teslim edildi" gösteriyor.

**Adreslerim** — ekleme, düzenleme, silme. Bir adres aynı anda
hem fatura hem teslimat adresi olabilir; Türkiye'de en sık durum
bu olduğu için iki ayrı liste yerine kayıtta iki bayrak var.

Kurumsal fatura alanları (firma unvanı, vergi dairesi, vergi no)
yalnızca "fatura adresi" işaretliyken görünüyor — bireysel alıcıyı
gereksiz alanlarla yormuyor.

Varsayılan adres tekil: birini varsayılan yapınca diğeri
otomatik düşüyor. Bu veritabanı tetikleyicisiyle garanti altında.

**Hesap bilgilerim** — ad soyad ve telefon. E-posta değiştirilemez
(hesabın kimliği), alan pasif gösteriliyor.

## Güvenlik

Adres tablosunda RLS `auth.uid()` üzerinden çalışıyor. Müşteri
yalnızca kendi adreslerini görebilir, değiştirebilir, silebilir.

Kayıt sırasında `user_id` istemciden gelse bile tetikleyici onu
oturum sahibine sabitliyor — başkasının adına adres kaydedilemez.
