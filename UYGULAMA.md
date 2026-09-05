# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "1600px hizalama: header, footer ve mega menu panellerle ayni genislikte"
git push
vercel --prod
```

## Bu turda

Site genişliği **1600px** olarak sabitlendi. Header (logo, menü,
ara/hesap/sepet), footer ve mega menü artık hero ve diğer
panellerle **aynı hizada** başlayıp bitiyor.

### Nasıl çalışıyor

`--rail` adında tek bir değişken var:

```css
--shell-max: 1600px;
--rail: max(var(--edge), calc((100% - var(--shell-max)) / 2 + var(--edge)));
```

Ekran 1600px'ten genişse fazlalığı kenar dolgusuna çevirir, darsa
normal kenar boşluğunu kullanır. Header ve footer'ın **zemini tam
genişlikte kalır** (sticky başlık ve alt bilgi kenardan kenara
uzanır), yalnızca içerikleri hizalanır.

İç sarmalayıcı eklemeye gerek kalmadı; `header.tsx` ve
`layout.tsx` değişmedi.

Aynı hizalama mega menü paneline ve mobil alt gezinme çubuğuna da
uygulandı.

Duyuru şeridi bilinçli olarak hizalanmadı — kayan bir bant, kenardan
kenara akması gerekiyor.
