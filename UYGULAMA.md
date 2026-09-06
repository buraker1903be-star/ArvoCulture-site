# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Footer yeniden duzenlendi"
git push
vercel --prod
```

## ÖNEMLİ: İki logo dosyası eklemeniz gerekiyor

```
public/rozet/etbis.png
public/rozet/lr.png
```

Kare formatta, tercihen 68×68px (retina için 2x). Dosyalar
yoksa rozetler yalnızca metin olarak görünür, sayfa bozulmaz.

**ETBİS logosu** için Ticaret Bakanlığı'nın ETBİS paneline girip
kendi işletmenize ait doğrulama görselini indirin. Bakanlık ayrıca
tıklanabilir bir doğrulama betiği veriyor; onu kullanmak isterseniz
söyleyin, rozeti ona bağlayayım.

**LR logosu** için LR'nin bağımsız iş ortaklarına verdiği görsel
kitini kullanın. LR'nin marka kullanım kuralları var; "bağımsız iş
ortağı" ibaresinin logoyla birlikte nasıl kullanılacağı orada
tanımlı, ona uyun.

## Yapılan değişiklikler

**1. Logo düzeltildi.** Koyu zemin için beyaza çeviren filtre
kaldırıldı (footer açık renkte), boyut 22px'e indirildi. Önceden
görünmez haldeydi.

**2. Bağlantılar sağa hizalandı ve yakınlaştırıldı.** Marka solda,
üç bağlantı grubu sağda toplu duruyor. Öncesinde sayfa boyunca
yayılıyor ve aralarında ölü boşluk kalıyordu.

**3. ETBİS rozeti** — logo + "ETBİS'e kayıtlıdır" ibaresi.

**4. LR rozeti** — logo + "LR Health & Beauty bağımsız iş
ortağıdır" ibaresi.

**5. Ödeme işaretleri** — Visa, Mastercard, Troy, Amex ve PayTR.
Kart markaları basit işaretler olarak çizildi; resmi logo dosyası
kullanmak isterseniz PayTR'nin sağladığı görsel kitini
`public/rozet/` altına koyup bana söyleyin, değiştireyim.

**6. Ticaret unvanı kaldırıldı**, yerine "Bir ArvoCulture Group
markasıdır" yazıyor.

### Yasal not

Ticaret unvanını footer'dan kaldırdık ama mesafeli satış mevzuatı
satıcının tam unvanının sitede erişilebilir olmasını istiyor. Bu
bilgi `/iletisim` ve `/mesafeli-satis-sozlesmesi` sayfalarında
bulunmalı. Oralarda yoksa eklenmeli.
