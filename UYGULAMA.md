# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Menu: marka listesi genisletildi, sac bakimi bolundu"
git push
vercel --prod
```

## Bu turda

**Marka eşleşmesi başlık üzerinden yapılıyor.** Slug yerine
koleksiyon başlığına bakılıyor; ARC'ta slug'lar tutarsız olabiliyor
ama başlıklar sabit. Eşleşme Türkçe büyük/küçük harfe duyarsız ve
kısmi — "Zeitgard" yazmanız, "LR ZEITGARD Serisi" başlığını da
yakalar.

Marka listesi:

```
Aloe Via · Zeitgard · Microsilver · Beauty Diamonds
Platinum · Racine · Nanogold · L-Recapin · Serox
Colostrum · Profesyonel Bakım
```

**Saç Bakımı üçe bölündü:**

- SAÇ BAKIMI — şampuan ve yağ dışındakiler
- ŞAMPUANLAR — başlığında "şampuan" geçenler
- YAĞLAR — başlığında "yağ" geçenler

Kişisel Bakım menüsü artık sekiz sütun:

```
MARKA KOLEKSİYONLARI · CİLT BAKIMI · SAÇ BAKIMI
ŞAMPUANLAR · YAĞLAR · VÜCUT BAKIMI
DİĞER BAKIMLAR · İHTİYACA GÖRE
```

Boş kalan sütun render edilmiyor.

## Yeni marka eklerken

`src/components/header.tsx` içindeki `BRAND_NAMES.care` listesine
markanın adını yazın. Slug'a gerek yok, başlıkta geçmesi yeterli.
