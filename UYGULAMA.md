# İKİ REPO — sırayla uygulayın

## 1) C:\ArvoARC  (önce bu)

`arc-hesap.zip` içindeki migration'ı repoya koyun ve Supabase SQL
Editor'de çalıştırın. Ayrıntılar o pakette `KURULUM.md` içinde.

ARC hazır olmadan vitrin tarafı çalışmaz.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Musteri hesap sistemi"
git push
vercel --prod
```

### Vercel'de iki yeni ortam değişkeni

| Değişken | Değer |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oahshpkgdzrraqdzjqau.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ARC'ın publishable anahtarı |

Bunlar tarayıcıya açılır — sorun değil, güvenlik RLS'ten gelir.
Bu yüzden `NEXT_PUBLIC_` öneki gerekli.

Ekledikten sonra Redeploy edin.

## Ne yapıldı

**Gerçek hesap sistemi.** E-posta ve şifreyle kayıt, giriş, şifre
sıfırlama. Supabase Auth üzerinde çalışıyor.

**Sipariş geçmişi.** Giriş yapan müşteri kendi siparişlerini
durumu, tarihi, tutarı ve kalemleriyle görüyor.

**Misafir siparişleri hesaba bağlanıyor.** Müşteri önce misafir
olarak sipariş verip sonra kayıt olursa, e-postasını doğruladığı
anda o siparişler hesabına geçiyor.

**Güvenlik:** müşteri yalnızca kendi siparişlerini okuyabilir.
Sipariş numarası tahmin ederek başkasının siparişine erişmek
mümkün değil — RPC `auth.uid()` üzerinden çalışıyor.

**Hata mesajları Türkçe.** Supabase İngilizce döner; sık görülenler
çevrildi ("E-posta veya şifre hatalı", "Bu e-posta ile zaten bir
hesap var" gibi).

**Misafir alışveriş açık kalıyor.** Üyelik zorunlu değil, bir
kolaylık.

## Google / Facebook

Supabase Auth destekliyor ama OAuth uygulaması açmanız gerekiyor
(Google Cloud Console ve Meta for Developers). Anahtarları
Supabase'e girdikten sonra haber verin, butonları etkinleştireyim.
Şu an "yakında" etiketi olarak duruyorlar.
