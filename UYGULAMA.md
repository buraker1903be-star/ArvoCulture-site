# Ana sayfa — yoğunluk geçişi

```powershell
cd C:\ArvoCulture-site
git rm src/lib/supabase-public.ts
git add -A
git commit -m "Ana sayfa yogunluk gecisi: urunler yukari, olcek magaza duzeyine"
git push
```

## Sorun neydi

Sayfa dergi ölçeğinde kurulmuştu. Global `h2` kuralı bölüm başlıklarını
**72px**'e kadar çıkarıyordu ve her bölümde 70px dolgu vardı. Sonuç:
ilk ekranda tek bir ürün görünmüyordu, ürüne ulaşmak dört ekran
kaydırmak gerektiriyordu.

## Ne değişti

**Ölçek mağaza düzeyine indi.** Bölüm başlıkları 72px yerine 22–30px.
Bölüm dolguları 70px'ten 38px'e indi. Kategori görselleri küçüldü,
kampanya bandı ve dünya bölümleri kısaldı.

**Arama ve kupon tek satırda birleşti.** İkisi ayrı bölümken toplam
200px dikey alan kaplıyor ve ürünü ekran dışına itiyorlardı. Artık
solda arama, sağda kupon, tek şerit.

**Güven şeridi inceldi.** Dört madde aynı ama satır yüksekliği yarıya
indi.

**Geniş ekranda 5'li ürün ızgarası** (1400px üstü). Öncesinde 4'lüydü.

Yeni sıralama:

```
Hero → Arama + Kupon → Güven şeridi → ÇOK SATANLAR → Kategoriler
→ İndirimdekiler → [ARC bölümleri] → Dünyalar → Yardım
```

Ürünler artık en fazla bir kaydırma uzakta.

## ARC paneli

`data-arvo-section` ve `data-arvo-field` bağlantıları korundu. Panelden
bölüm gizleme, sıralama ve canlı düzenleme çalışmaya devam ediyor.

## Yapılması gerekenler

- ARC'ta ürünleri **"çok satan"** işaretleyin.
- ARC temasında **"Hızlı ekle"** seçeneğini açın (`show_quick_add`),
  yoksa sepete ekleme butonu kartlarda görünmez.
- `/koleksiyon/firsatlar` koleksiyonunu doldurun.
