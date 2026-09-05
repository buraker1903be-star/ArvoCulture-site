# YENİ TASARIM — sabit arka plan + yüzen paneller

## HANGİ REPO

**`C:\ArvoCulture-site`** — vitrin reposu. (ARC'a değil.)

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Yeni tasarim: sabit arka plan, yuzen paneller"
git push
```

Silinecek dosya yok.

## Tasarım sistemi

**Sabit arka plan.** Gövdenin arkasında kaymayan koyu bir katman
duruyor (`body::before`, sabit konumlu). Sayfa kaydıkça arka plan
sabit kalıyor, içerik onun üzerinde akıyor.

`background-attachment: fixed` yerine sabit konumlu bir katman
kullanıldı; o özellik mobil Safari'de güvenilir çalışmıyor.

**Yüzen paneller.** Her bölüm bir panel: kendi beyaz zemini,
14px yarıçapı ve gölgesi var. Paneller arasındaki boşluktan koyu
arka plan görünüyor. Ürün kartları da üzerine gelindiğinde bir kat
daha yükseliyor.

Yüzme hissi tek bir gölge tanımından (`--float`) geliyor; her
bileşende ayrı gölge yazılmadı, bu yüzden tutarlı.

**Sınıf yapısı**

| Sınıf | Kullanım |
| --- | --- |
| `.shell` | Sayfa kabuğu, panelleri dizer |
| `.panel` | Standart beyaz panel |
| `.panel-tight` | Dar dolgulu panel (şeritler) |
| `.panel-soft` | Kırık beyaz zemin |
| `.panel-clear` | Zeminsiz, arka planı gösteren |

## Ana sayfa sıralaması

```
Hero → Güvence → Arama + kupon → İndirimdekiler → Kategoriler
→ Çok satanlar → Kampanya → Öne çıkanlar → Yardım
```

İndirimler kategorilerden önce; fiyatı birinci öncelik olarak
belirlediğiniz için.

## Ölçüler

- Ürün ızgarası: geniş ekran 5, 1280px'te 4, 980px'te 3, mobil 2
- Bölüm başlıkları 19–25px (hero 32–54px)
- Kategori kısayolları yuvarlak, mobilde 3'lü

## Deploy sorunu

Vercel yeni commit'leri yayına almıyordu; dağıtım kimliği
saatlerdir değişmemişti. Push'tan sonra Deployments sekmesinde yeni
kaydın **Ready** olduğunu doğrulayın. Olmuyorsa:

```powershell
npm i -g vercel
vercel --prod
```

Bu, git bağlantısını atlayıp doğrudan yayına gönderir.
