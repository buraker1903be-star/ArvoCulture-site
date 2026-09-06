# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Arama katmani: acilir pencere ve gorselli populer aramalar"
git push
vercel --prod
```

## Bu turda

**Arama artık açılır katman.** Kutuya basınca sayfa değişmiyor;
üstten inen bir panel açılıyor. Müşteri aradığını bulamazsa
Escape'e basıp kaldığı yerden devam ediyor — sayfa geçişi
yapıldığında sepet akışı bölünüyordu.

Katman açıkken arka plan kaymıyor, imleç otomatik giriş alanına
gidiyor, Escape ve dışarı tıklama kapatıyor.

**Popüler aramalar görselli kutu oldu.** Metin etiketi yerine
kare görselli kutular: kremi ya da parfümü görmek, adını okumaktan
daha hızlı karar verdiriyor.

Görseller sabit dosya değil — her kutu, katalogda adı eşleşen ilk
ürünün görselini kullanıyor. Katalog değişince kutular da
kendiliğinden güncelleniyor.

Altı kutu: Serum, Parfüm, Oversize tişört, Güneş koruma,
Nemlendirici, Vitamin. Mobilde üçlü ızgaraya düşüyor.

### Kutuları değiştirmek

`src/app/page.tsx` içindeki `SEARCH_TILES` dizisi. Her kayıt üç
alan taşır: `label` (görünen ad), `href` (gidilecek koleksiyon),
`match` (görseli seçmek için ürün adında aranacak kelime).
