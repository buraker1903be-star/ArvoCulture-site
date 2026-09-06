# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Kategori ikonlari yeniden cizildi"
git push
vercel --prod
```

## Bu turda

**Siluetler ayrıştırıldı.** Önceki ikonların üçü (Kişisel Bakım,
Kozmetik, Parfüm) dikdörtgen şişeydi; uzaktan bakıldığında
ayırt edilemiyorlardı. Her kategoriye farklı bir temel biçim
verildi:

| Kategori | Biçim |
| --- | --- |
| Giyim | Askı — üçgen siluet |
| Kişisel Bakım | Damlalıklı serum şişesi — ince uzun boyun |
| Kozmetik | Ruj — eğik uç |
| Parfüm | Flakon — geniş omuz, sprey başlığı |
| Takviyeler | Tek kapsül, eğik |

**Çizgi inceltildi.** 1.3'ten 1.05'e; kalın kontur ikonları oyuncak
gibi gösteriyordu. Renk zeytin yeşilinden koyu mürekkebe geçti ve
%78 saydamlıkla duruyor — üzerine gelince yeşile döner ve tam
opaklığa çıkar.

**Halka etkileşimi.** Üzerine gelince halka beyaza döner, hafifçe
yükselir ve gölge alır. Statik bir görsel değil, tıklanabilir bir
şey olduğu belli olur.

### İkon değiştirmek

`src/components/home-blocks.tsx` içindeki `CATEGORY_ICONS`.
24×24 kutuya çizilmiş SVG yolları; kategori adıyla eşleşir.
