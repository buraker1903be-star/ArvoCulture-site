# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Urun kartinda ikinci gorsel gecisi"
git push
vercel --prod
```

## Bu turda

Ürün kartına gelindiğinde **ikinci görsel** gösteriliyor. Tişörtlerde
ön ve arka tasarım ayrı fotoğrafta olduğu için müşteri arkayı
görmek üzere ürün sayfasına girmek zorunda kalmıyor.

**İkinci görseli olmayan üründe** bu eleman hiç render edilmiyor;
ilk görsel sabit kalıyor. Boş kutu ya da titreme olmuyor.

Geçiş saf CSS ile yapılıyor, JavaScript yok. Yumuşak bir opaklık
geçişi (260ms).

**Dokunmatik cihazlarda kapalı.** Telefonda hover durumu tıklama
sonrası takılı kalıyor ve yanlış görsel kalabiliyor; orada ilk
görsel her zaman görünür.

Klavyeyle kart üzerine gelindiğinde de (focus) ikinci görsel
açılıyor.

## ARC tarafında

Görsel sırası ARC'taki ürün kaydındaki sıraya göre. Tişörtlerde
ön yüzün birinci, arka yüzün ikinci sırada olduğundan emin olun.
