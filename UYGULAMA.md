# Premium sprint — uygulama

Zip'i `C:\ArvoCulture-site` içine açın, üzerine yazın. Sonra:

```powershell
cd C:\ArvoCulture-site

# Ölü dosya: içinde hardcoded Supabase anahtarı var, artık hiçbir yerden
# kullanılmıyor. Zip üzerine yazma bunu silmez.
git rm src/lib/supabase-public.ts

git add -A
git status
git commit -m "Urun sayfasi premium katmani, kirik gorsel ve olu dosya temizligi"
git push
```

## Vercel'de yapılması gereken tek ayar

Site hem `arvoculture.com` hem `www.arvoculture.com` üzerinden açılıyor
ama canonical `arvoculture.com` diyor. Bu, arama motoru sinyallerini
ikiye böler.

Vercel → Settings → Domains: `www.arvoculture.com` girdisinde
**Redirect to arvoculture.com** seçeneğini işaretleyin (308).
Ya da tersini yapıp `NEXT_PUBLIC_SITE_URL` değerini
`https://www.arvoculture.com` olarak güncelleyin. Hangisi olursa olsun
ikisi aynı yeri göstermeli.
