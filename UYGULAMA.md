# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Kategoriler cizim ikonla"
git push
vercel --prod
```

## Bu turda

Kategori halkalarında ürün fotoğrafı yerine **çizgi ikon**
kullanılıyor.

Fotoğraf tek bir ürünü temsil ediyordu ve kategoriyi yanlış
daraltıyordu: "Kişisel Bakım" bir tüp aloe kremi gibi görünüyor,
"Giyim" tek bir beyaz tişörte indirgeniyordu. Çizgi ikon kategoriyi
bütün olarak anlatır ve katalog değiştiğinde eskimez.

İkonlar marka yeşilinde, üzerine gelince koyulaşıyor. Halkalara
ince bir çerçeve eklendi; boş görünmesinler diye.

Beş ikon: tişört, bakım tüpü, ruj, parfüm şişesi, kapsül.

### İkon değiştirmek

`src/components/home-blocks.tsx` içindeki `CATEGORY_ICONS` nesnesi.
Her kayıt 24×24 kutuya çizilmiş SVG yolları taşır; kategori adıyla
eşleşir.
