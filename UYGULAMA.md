# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Kategori ikonlari eskiz tarzinda"
git push
vercel --prod
```

## Bu turda

Kategori ikonları **eskiz (sketch) tarzına** çevrildi. El çizimi
hissi iki şeyden geliyor:

**1. Çizgiler tam düz değil.** Her kenar hafif bir eğri taşıyor.
Bir askının omzu, bir şişenin gövdesi elle çekilmiş gibi minik
sapmalar içeriyor. Düz `L` komutları yerine `C` eğrileri
kullanıldı.

**2. Kalemin ikinci geçişi.** Ana çizginin altında hafifçe kaymış
(0.55px sağa, 0.7px aşağı, 0.4 derece dönük) soluk bir kopya var.
Kurşun kalemle iki kez geçilmiş bir çizimin izlenimi bu şekilde
oluşuyor.

Çizgi kalınlığı 1px, uçlar yuvarlak. Üzerine gelince yeşile
dönüyor ve tam opaklığa çıkıyor.

Siluetler önceki turdaki gibi ayrı kalıyor: askı, damlalıklı şişe,
ruj, flakon, kapsül.

### İkon değiştirmek

`src/components/home-blocks.tsx` içindeki `CATEGORY_ICONS`.
Eskiz hissini korumak için düz çizgi (`L`) yerine hafif eğri (`C`)
kullanın; hayalet katman bileşende otomatik ekleniyor.
