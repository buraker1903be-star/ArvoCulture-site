# HANGİ REPO: C:\ArvoCulture-site

Zip'i açıp içindeki `arvoculture-site` klasörünün **içindekileri**
`C:\ArvoCulture-site` üzerine kopyalayın. Sonra:

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Eksik sayfa stilleri eklendi"
git push
vercel --prod
```

`vercel --prod` klasördeki dosyalardan yayınlar, git'i beklemez.

## Bu turda düzeltilen

Önceki pakette eski `dynamic.css` silinmişti ama içindeki **header,
mega menü, footer, koleksiyon, ürün, sepet ve bilgi sayfası
stilleri** yeniden yazılmamıştı. Sadece ana sayfa ve ödeme stilleri
vardı. Bu yüzden arka plan geliyor ama sayfanın geri kalanı çıplak
kalıyordu.

`src/app/layout.css` eklendi: eksik olan tüm bölümler yeni panel
diliyle yeniden yazıldı.

CSS artık 21 KB (öncesi 12 KB).

## Stil dosyaları

| Dosya | İçerik |
| --- | --- |
| `tokens.css` | Renk, boşluk, tipografi, gölge |
| `globals.css` | Sıfırlama, sabit arka plan, panel, buton, fiyat |
| `components.css` | Hero, ürün kartı, ızgara, ana sayfa, ödeme |
| `layout.css` | Başlık, mega menü, footer, iç sayfalar |
