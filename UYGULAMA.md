# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Hesap paneli yapilandirma eksikken cokmuyor"
git push
vercel --prod
```

## Hata neydi

`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
Vercel'de tanımlı olmadığı için kimlik doğrulama istemcisi istisna
fırlatıyor ve **tüm sayfa çöküyordu** ("This page couldn't load").

Artık yapılandırma eksikse sayfa normal açılıyor; yalnızca hesap
paneli "Hesap sistemi hazırlanıyor" mesajı gösteriyor. Sipariş
takibi bölümü çalışmaya devam ediyor.

## Hesabı gerçekten açmak için

Vercel → ArvoCulture projesi → Settings → Environment Variables:

| Key | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://oahshpkgdzrraqdzjqau.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ARC'ın publishable anahtarı |

Production, Preview ve Development kutularının üçünü de
işaretleyin. Sonra Redeploy edin.

Ayrıca `arc-hesap.zip` içindeki migration'ın Supabase'de
çalıştırılmış olması gerekiyor; yoksa giriş yapılır ama sipariş
listesi boş gelir.
