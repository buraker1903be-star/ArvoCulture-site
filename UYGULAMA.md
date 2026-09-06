# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Sepete ucma animasyonu, urun sayilari ve kupon tasarimi"
git push
vercel --prod
```

## 1. Sepete uçma animasyonu

Ürün görselinin bir kopyası karttan başlıktaki sepet ikonuna
uçuyor, varışta ikon kısa bir nabız atıyor. Buton yazısının
"Sepete eklendi" olması tek başına gözden kaçıyordu.

"Hareketi azalt" tercihi açık kullanıcılarda animasyon çalışmıyor;
ekleme yine olur, sadece uçuş yok.

## 2. Kart görselleri beyaz zeminde

Ürün fotoğrafları beyaz fonlu çekildiği için kırık beyaz zemin
kenarlarda görünür bir çerçeve bırakıyordu. Tüm sitede beyaz oldu.

## 3. İndirimli ürünler eksikti

Ana sayfa katalogdan yalnızca ilk 120 ürünü çekiyordu; indirimli
ürünlerin bir kısmı bu sınırın dışında kalıyordu. 200'e çıkarıldı,
dördü de görünecek.

## 4. Çok satanlar 10 ürün

Önceden ARC'ta işaretli ürün sayısı kadar gösteriyordu. Artık
işaretliler önce gelir, eksik kalırsa katalogdan 10'a tamamlanır.

## 5. Kupon bölümü yenilendi

Kırmızı dolgulu bir kopyalama butonu, yumuşak gölge, hafif kırmızı
zeminli hap biçimli kart. "KOPYALA" etiketi butonun içinde ayrı bir
rozet oldu. Eskiden kesik çizgili ve soluk duruyordu; sayfanın en
güçlü teklifi olduğu için görsel ağırlığı artırıldı.
