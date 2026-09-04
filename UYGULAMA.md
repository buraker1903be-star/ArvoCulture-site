# Bu paketi repoya nasıl uygularsınız

Zip'i `C:\ArvoCulture-site` klasörünün **içine** açın, dosyaların üzerine
yazılmasına izin verin. GitHub web arayüzüne yüklemeyin.

Ardından PowerShell'de:

```powershell
cd C:\ArvoCulture-site

# Bu dosya artık kullanılmıyor; zip üzerine yazma onu silmez.
git rm src/lib/supabase-public.ts

git add -A
git status
```

`git status` çıktısını kontrol edin. Beklenen: 14 değişmiş dosya,
8 yeni dosya, 1 silinmiş dosya (`supabase-public.ts`). Doğruysa:

```powershell
git commit -m "Veri katmani, SEO ve guvenlik iyilestirmeleri"
git push
```

## Vercel ortam değişkenleri — bunlar olmadan build başarısız olur

Yapılandırma artık doğrulanıyor. Vercel panelinde şu üçünü tanımlayın:

| Değişken | Değer |
| --- | --- |
| `ARC_SUPABASE_URL` | `https://oahshpkgdzrraqdzjqau.supabase.co` |
| `ARC_SUPABASE_PUBLISHABLE_KEY` | ARC projenizin publishable anahtarı |
| `ARC_ORGANIZATION_ID` | `f00ab7ef-e9be-467b-9e95-db8f753275c3` |
| `NEXT_PUBLIC_SITE_URL` | `https://arvoculture.com` |

Aynı üçünü GitHub'da da tanımlayın (Settings → Secrets and variables →
Actions), yoksa CI build adımı başarısız olur.

Bu değerler daha önce `.env.production` içindeydi ve o dosya artık
takip edilmiyor. Yerelde çalışmak için `.env.example` dosyasını
`.env.local` olarak kopyalayıp doldurun — `.env.local` gitignore'da.
