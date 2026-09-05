# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Menu: her koleksiyon grubu ayri sutunda"
git push
vercel --prod
```

## Bu turda

Kişisel Bakım menüsünde gruplar birleştirilmişti; artık her
`menu_group` kendi sütununda:

```
MARKA KOLEKSİYONLARI · CİLT BAKIMI · SAÇ BAKIMI
VÜCUT BAKIMI · DİĞER BAKIMLAR · İHTİYACA GÖRE
```

Birleştirilmiş hâlde müşteri "saç ürünü arıyorum" derken cilt ve
vücut ürünlerinin arasında aramak zorunda kalıyordu.

Sütunlar 230px sabit genişlikte ve sola dayalı; ekrana sığdığı
kadarı yan yana, kalanı alt satıra geçiyor. Boş kalan grup hiç
render edilmiyor.
