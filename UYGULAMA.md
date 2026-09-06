# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Canli arama: ilk harften itibaren sonuc"
git push
vercel --prod
```

## Bu turda

**Canlı arama.** İlk harften itibaren sonuç geliyor; arama
butonuna basmak gerekmiyor. Hem `/arama` sayfasında hem ana
sayfadaki açılır katmanda aynı bileşen çalışıyor.

### Nasıl çalışıyor

Sunucu, katalogdan **hafif bir dizin** üretip istemciye gönderiyor:
slug, ad, marka, kategori, fiyat, görsel. Tüm ürün nesnesi
gönderilseydi açıklama metinleriyle yüzlerce kilobayt olurdu.

Filtreleme tarayıcıda yapılıyor — her tuşta ağ isteği atılmıyor,
sonuç anında geliyor.

### Türkçe arama

"parfum" yazınca "parfüm", "sampuan" yazınca "şampuan" bulunuyor.
Türkçe karakterler ASCII karşılığına indirgeniyor;
`toLocaleLowerCase` tek başına bunu yapmıyor.

Çok kelimeli arama çalışıyor: "zeitgard serum" her iki kelimeyi de
içeren ürünleri getiriyor.

Sıralama: adında geçenler önce, sonra marka, sonra kategori.

### Sonuç kartları

Her sonuçta küçük görsel, marka, ürün adı ve fiyat var. İndirimli
ürünlerde üstü çizili eski fiyat da görünüyor. Katmanda 8 sonuç,
arama sayfasında 48.

### Diğer

- Yazarken sayaç: "12 sonuç" / "Sonuç bulunamadı"
- Sonuç yoksa tüm ürünlere yönlendirme
- Temizle butonu
- Arama sayfası `noindex` — arama sonuçlarının dizine girmesi
  kalitesiz sonuç üretir
