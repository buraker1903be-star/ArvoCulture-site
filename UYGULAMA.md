# Ana sayfa — yeniden yazım ve kullanılabilirlik düzeltmeleri

Zip'i `C:\ArvoCulture-site` içine açın, üzerine yazın. Sonra:

```powershell
cd C:\ArvoCulture-site
git rm src/lib/supabase-public.ts
git add -A
git commit -m "Ana sayfa yeniden yazildi, calisan hizli ekleme, arama girisi"
git push
```

## Düzeltilen gerçek hata

**"Hızlı ekle +" çalışmıyordu.** Ürün kartındaki o etiket bir `<span>`
idi ve ürün bağlantısının içinde duruyordu; tıklayınca sepete eklemek
yerine ürün sayfasına gidiyordu. Artık gerçek bir buton ve gerçekten
sepete ekliyor.

Giyim ürünlerinde hızlı ekleme yapılmıyor — beden seçimi zorunlu
olduğu için buton "Beden seç" diyerek ürün sayfasına götürüyor.
Tükenmiş ürünlerde buton pasif.

## Yeni ana sayfa sıralaması

```
Hero → Güven şeridi → Arama → Kupon → Çok satanlar → Kategoriler
→ İndirimdekiler → [ARC bölümleri] → Dünyalar → Yardım şeridi
```

Arama girişi eklendi: katalogda 200'den fazla ürün ve 40'tan fazla alt
koleksiyon var, aradığını bilen ziyaretçi için en kısa yol bu. Altında
beş popüler koleksiyona kısayol etiketi duruyor.

## ARC paneli bozulmadı

`data-arvo-section` (5) ve `data-arvo-field` (11) korundu. Panelden
bölüm gizleme (`show_*`), sıralama (`order_*`) ve canlı metin düzenleme
aynen çalışıyor.

## Doldurulması gerekenler

- ARC'ta ürünleri **"çok satan"** işaretleyin (4'ten azsa ray katalog
  sırasıyla doluyor).
- `/koleksiyon/firsatlar` koleksiyonunu doldurun.
- ARC temasında **"Hızlı ekle" seçeneğini açın** (`show_quick_add`);
  kapalıysa buton hiç görünmez.
- `src/components/home-search.tsx` içindeki kısayol etiketlerini kendi
  popüler koleksiyonlarınıza göre düzenleyin.
- `src/components/assurance-bar.tsx` içindeki kargo eşiği ve iade
  süresini duyuru çubuğuyla tutarlı tutun.
