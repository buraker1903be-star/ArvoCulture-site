# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Mega menu yeniden tasarlandi"
git push
vercel --prod
```

## Mega menü tasarımı

Eskiden bağlantılar düz bir liste hâlindeydi; müşteri kalabalık
sütunlarda aradığını gözle taramak zorundaydı. Değişenler:

**Her bağlantı tıklanabilir bir satır oldu.** Dolgusu var, üzerine
gelince zemini renkleniyor. Hedef alanı büyüdü — özellikle dokunmatik
ekranda fark yaratır.

**Sütun başlıkları ayrıştı.** Zeytin yeşili, büyük harf, geniş harf
aralığı ve yanında ince bir çizgi. Bağlantılarla karışmıyor.

**Ürün sayısı rozet oldu.** Sağ tarafta sessiz bir baloncuk.
Okumayı bölmüyor ama "Aloe Via 50 ürün, Serumlar 6 ürün" bilgisi
seçim yaparken işe yarıyor.

**"Tümünü gör" butona dönüştü.** Sağ üstte, üzerine gelince koyu
zemine geçiyor. Kategorinin tamamını görmek isteyen kaybolmuyor.

**Tetikleyicideki ok animasyonlu.** Menü açıkken 180 derece dönüyor,
hangi menünün açık olduğu net.

Panel açılırken yumuşak bir yükselme hareketi var; anında belirip
kaybolmuyor.
