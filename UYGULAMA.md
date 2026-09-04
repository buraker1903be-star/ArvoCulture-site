# Ana sayfa — baştan yazıldı

Zip'i `C:\ArvoCulture-site` içine açın, üzerine yazın. Sonra:

```powershell
cd C:\ArvoCulture-site
git rm src/lib/supabase-public.ts
git add -A
git commit -m "Ana sayfa yeniden yazildi, global Poppins, urun sayfasi iyilestirmeleri"
git push
```

## Yeni sıralama

```
Hero → Güven şeridi → Kupon → Çok satanlar → Kategoriler
→ İndirimdekiler → [ARC bölümleri] → Dünyalar → Yardım şeridi
```

Sayfa artık bir satın alma hunisi olarak diziliyor: önce güven, sonra
teklif, sonra ürün, sonra marka anlatısı, en sonda kalan soruların
kapatılması.

## ARC paneli bozulmadı

`data-arvo-section` (5 adet) ve `data-arvo-field` (11 adet) nitelikleri
korundu. Paneldeki canlı düzenleme, bölüm gizleme (`show_*`) ve
sıralama (`order_*`) aynen çalışıyor. Öne çıkanlar, kampanya ve
değerler bölümlerinin sırası hâlâ panelden yönetiliyor.

## Doldurulması gerekenler

- ARC'ta ürünleri **"çok satan"** olarak işaretleyin. İşaretli ürün
  4'ten azsa ray katalog sırasıyla doluyor — çalışır ama gerçek
  verinin yerini tutmaz.
- `/koleksiyon/firsatlar` koleksiyonunu doldurun.
- `src/components/assurance-bar.tsx` içindeki kargo eşiği ve iade
  süresi sabit yazılı; duyuru çubuğuyla tutarlı tutun.
