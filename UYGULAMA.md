# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Sepet cekmecesi ve yeni sepet sayfasi"
git push
vercel --prod
```

ARC tarafında yeni migration yok. Not alanı ödeme isteğine
gönderiliyor ama ARC henüz kaydetmiyor — istersen sipariş
fonksiyonuna ekleyebiliriz.

## Sepet çekmecesi

Başlıktaki sepet ikonuna basınca sağdan açılıyor. Müşteri sayfayı
terk etmiyor, alışverişe kaldığı yerden devam edebiliyor.

İçinde: ücretsiz kargoya kalan tutar uyarısı, ürünler adet
değiştiriciyle, ara toplam, "Ödemeye geç" ve "Sepet detayına git".

Escape ve dışarı tıklama kapatıyor, açıkken arka plan kaymıyor.
Kapanışta animasyon tamamlanıyor.

## Sepet sayfası

**İndirim kodu** girilebiliyor. Kod saklanıyor ve ödeme adımında
ARC'a gönderiliyor. İndirim tutarı burada hesaplanmıyor — sunucu
hesaplıyor. İstemcide hesaplasaydık gerçek tutarla çelişebilirdi.

**Sipariş notu** 500 karaktere kadar. "Kapıcıya teslim edilebilir",
"hediye paketi yapılsın" gibi.

Ürünler büyük görselleriyle, adet değiştirici ve birim fiyatla
listeleniyor. Sağda yapışkan özet paneli: ara toplam, kargo,
toplam ve ücretsiz kargoya kalan tutar.

Sepet boşken ayrı bir görünüm çıkıyor, koleksiyonlara yönlendiriyor.
