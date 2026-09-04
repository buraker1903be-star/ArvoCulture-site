# Ana sayfa — satış düzenlemesi

Zip'i `C:\ArvoCulture-site` içine açın, üzerine yazın. Sonra:

```powershell
cd C:\ArvoCulture-site
git rm src/lib/supabase-public.ts
git add -A
git commit -m "Satis odakli ana sayfa, global Poppins, urun sayfasi iyilestirmeleri"
git push
```

## Ana sayfada ne değişti

Yeni sıralama: Hero → Güven şeridi → Kupon → Çok satanlar → İndirimdekiler
→ (mevcut bölümler)

**Güven şeridi.** Hero'nun hemen altında, kaydırmadan görünür. Dört madde:
ücretsiz kargo eşiği, iade süresi, güvenli ödeme, orijinallik. Hepsi
tıklanabilir ve iddianın arkasındaki sayfaya gidiyor.

**Kupon şeridi.** Kod tek tıkla panoya kopyalanıyor. Eskiden müşteri kodu
elle yazmak zorundaydı; her elle yazım bir terk noktası.

**Çok satanlar rayı.** 8 ürün. ARC'ta "çok satan" işaretli ürünler
kullanılıyor; yeterli işaretli ürün yoksa stoktaki ilk ürünlerle doluyor.

**İndirimdekiler rayı.** 8 ürün, indirim oranına göre sıralı. Yalnızca
stokta olanlar.

Her iki ray da mobilde yatay kaydırılabilir. Alt alta yığmak sayfayı
uzatıp diğer bölümleri görünmez kılıyordu.

Önceden ana sayfada **toplam 4 ürün** görünüyordu; katalogda 200'den
fazla ürün var. Artık 16 ürün ana sayfadan doğrudan erişilebilir.

## Doldurulması gerekenler

- ARC panelinde ürünleri "çok satan" olarak işaretleyin; şu an
  işaretli ürün yoksa ray katalog sırasıyla doluyor.
- `/koleksiyon/firsatlar` koleksiyonunun dolu olduğundan emin olun.
- `src/components/assurance-bar.tsx` içindeki kargo eşiği ve iade
  süresi sabit yazılı. Değiştirirseniz duyuru çubuğuyla birlikte
  güncelleyin.
