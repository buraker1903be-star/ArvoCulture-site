# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Hesap sayfasi yeniden duzenlendi"
git push
vercel --prod
```

## Bu turda

Sayfa iki panele ayrıldı:

**Sipariş takibi** — bugün gerçekten çalışan yol. Üç adımlı
görsel akış (numaranı bul → bize yaz → durumu öğren), altında
WhatsApp ve e-posta butonları.

**ArvoCulture hesabı — yakında** — planlanan özellikler ve giriş
yöntemleri (Google, Facebook, e-posta) kesik çizgili etiketler
hâlinde. **Tıklanabilir değiller.** Çalışmayan bir butona basmak,
hiç göstermemekten daha kötü bir deneyim.

## Üyelik sistemi için gereken iş

Giriş formu tek başına yeterli değil; arkasında çalışan bir
altyapı olmalı. ARC tarafında yapılacaklar:

1. **Supabase Auth'ta müşteri kaydı.** ARC'ın mevcut `authenticated`
   rolü personel için; RLS politikaları `organization_memberships`
   üzerinden çalışıyor. Müşteriler için ayrı bir politika katmanı
   gerekiyor, aksi hâlde müşteri hesabıyla giriş yapan kişi hiçbir
   veri göremez.

2. **Siparişleri müşteriye bağlama.** `arc_orders` şu an
   `customer_email` tutuyor ama kullanıcı kimliğiyle ilişkili
   değil. Müşterinin kendi siparişlerini görebilmesi için
   `user_id` alanı ve buna dayalı bir RLS politikası gerekiyor.

3. **Şifre sıfırlama ve e-posta doğrulama.** Supabase Auth
   sağlıyor ama e-posta şablonlarının Türkçeleştirilmesi ve
   gönderim alan adının doğrulanması gerekiyor.

4. **Google / Facebook girişi.** Supabase Auth destekliyor. Her
   sağlayıcı için OAuth uygulaması açıp anahtarları Supabase'e
   girmeniz gerekiyor — Google Cloud Console ve Meta for
   Developers üzerinden.

Bunlar hazır olduğunda bu sayfa giriş/kayıt sekmelerine dönüşür.
