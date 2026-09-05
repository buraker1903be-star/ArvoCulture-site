# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Font zinciri ve mega menu duzeltmesi"
git push
vercel --prod
```

## Bu turda düzeltilen iki hata

**Font serif çıkıyordu.** `--font` değişkeni `:root` üzerinde
tanımlıydı ve içinde `var(--font-poppins)` vardı. Ama next/font
`--font-poppins`'i `<body>` üzerinde tanımlıyor. CSS özel
değişkenleri tanımlandıkları elemanda çözüldüğü için `:root`'ta
`--font-poppins` bulunamıyordu, zincir kırılıyor ve tarayıcı
varsayılan serif'e düşüyordu.

Artık `body` doğrudan `var(--font-poppins)` kullanıyor, ara
değişken yok.

**Mega menüler hep açıktı.** Yapıyı yanlış okumuşum: `.mega-menu`
sarmalayıcı, açılır kutu ise `.mega-panel`. Ben gizleme kuralını
sarmalayıcıya yazmıştım, panele değil — bu yüzden hepsi aynı anda
görünüyordu.

Artık `.mega-panel` varsayılan olarak gizli; üzerine gelindiğinde
veya klavyeyle içine odaklanıldığında açılıyor.
