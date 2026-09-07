# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Hesap paneli sunucu tarafi yapilandirma ile"
git push
vercel --prod
```

**Yeni ortam değişkenine gerek yok.** Zaten tanımlı olan
`ARC_SUPABASE_URL` ve `ARC_SUPABASE_PUBLISHABLE_KEY` kullanılıyor.

## Sorun neydi

Panel `NEXT_PUBLIC_SUPABASE_URL` ve
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` değişkenlerine bağlıydı.

`NEXT_PUBLIC_` önekli değişkenler **derleme anında koda gömülür**.
Vercel panelinde tanımlı olsalar bile, o değişkenler eklenmeden
önce yapılmış bir derleme onları içermez ve sessizce boş kalır —
sayfa da "Hesap sistemi hazırlanıyor" gösterir.

## Çözüm

Bağlantı bilgileri artık sunucu bileşeninden prop olarak
aktarılıyor. `/hesap` bir sunucu bileşeni; zaten çalışan
`ARC_SUPABASE_*` değişkenlerini okuyup panele geçiriyor.

Böylece:
- `NEXT_PUBLIC_` bağımlılığı kalktı
- Ortam değişkeni ekledikten sonra yeniden derleme gerekmiyor
- Tek bir değişken seti hem veri hem kimlik doğrulama için

Publishable anahtar tarayıcıya gidiyor ama bu zaten olması
gereken; güvenlik RLS politikalarından geliyor.
