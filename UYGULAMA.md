# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Menu: marka koleksiyonlari ayri sutuna alindi"
git push
vercel --prod
```

## Sorun neydi

ARC'taki `menu_group` alanı iki farklı ekseni tek grupta topluyordu.
"CİLT BAKIMI" başlığı altında hem markalar (Aloe Via, Zeitgard,
Microsilver Plus, Beauty Diamonds) hem ürün tipleri (Nemlendiriciler,
Temizleyiciler, Serumlar) yan yana duruyordu.

Müşteri "Zeitgard ürünlerini görmek istiyorum" ile "nemlendirici
arıyorum" arasında farklı düşünür; ikisini aynı listede aramak
zorunda kalıyordu.

## Yeni yapı

**Giyim**
- MARKA KOLEKSİYONLARI: The Society Collection
- KESİME GÖRE: Oversize, Basic, Regular Fit

**Kişisel Bakım**
- MARKA KOLEKSİYONLARI: Aloe Via, Zeitgard, Microsilver Plus,
  Beauty Diamonds, Profesyonel Bakım (ZG Pro)
- ÜRÜN TİPİNE GÖRE: Nemlendiriciler, Temizleyiciler, Serumlar,
  Vücut Losyonları, Duş Jelleri, Ağız & Diş, Deodorant, Erkek,
  Bebek & Çocuk
- İHTİYACA GÖRE: Yaşlanma Karşıtı, Akne, Kuru Cilt, Güneş Koruması,
  Yağlı Cilt, Saç Dökülmesi

**Parfüm**
- MARKA KOLEKSİYONLARI: Mood Infusion, Iconic Elixirs
- KİME GÖRE: Kadın, Erkek

**Takviyeler**
- MARKA KOLEKSİYONLARI: LR LifeTakt
- İHTİYACA GÖRE: Bağışıklık, Vitamin, Spor

**Kozmetik** — MAKYAJ (Ten, Göz, Dudak). Marka koleksiyonu yok.

## Nasıl çalışıyor

Markalar `header.tsx` içindeki `BRANDS` listesinde slug ile
tanımlı. Başlık ve ürün sayısı yine ARC'tan geliyor — yani bir
koleksiyonun adını ARC'ta değiştirirseniz menüde de değişir.

Marka koleksiyonları diğer sütunlardan otomatik çıkarılıyor, iki
yerde birden görünmüyorlar.

Boş kalan sütun hiç render edilmiyor.

### Yeni marka eklerken

`src/components/header.tsx` içindeki `BRANDS` nesnesine slug'ı
ekleyin. ARC'ta koleksiyon zaten varsa menüde belirir.
