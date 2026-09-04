# Uygulama

Zip'i `C:\ArvoCulture-site` içine açın, üzerine yazın. Sonra:

```powershell
cd C:\ArvoCulture-site

# Ölü dosya: içinde hardcoded Supabase anahtarı var, hiçbir yerden
# kullanılmıyor. Zip üzerine yazma bunu silmez.
git rm src/lib/supabase-public.ts

git add -A
git status
git commit -m "Tipografi, urun sayfasi ve kirik gorsel duzeltmeleri"
git push
```

## Bu pakette ne var

**Tipografi**
- Butonlar, input, select ve textarea artık Poppins kullanıyor. Tarayıcılar
  form elemanlarına font'u kalıtım yoluyla geçirmez; bunlar işletim
  sisteminin arayüz fontuyla render ediliyordu.
- ARC panelindeki "modern" ve "minimal" tema seçenekleri başlık fontunu
  Arial'a çeviriyordu. Artık yalnızca ağırlığı değiştiriyorlar.
- Fiyatlar ve tutarlar tabular rakam kullanıyor, sütunlarda kaymıyor.
- `adjustFontFallback` eklendi: Poppins yüklenirken sayfa zıplamıyor.

**Ürün sayfası**
- Çalışan beden seçimi. Eskiden butonlar durum tutmuyordu ve seçim sepete
  taşınmıyordu — müşteri beden seçtiğini sanıp bedensiz sipariş verebilirdi.
- Görsel galerisi. ARC her üründe birden çok görsel tutuyor ama yalnızca
  ilki gösteriliyordu.
- Görünür ekmek kırıntısı ve stok durumu satırı.

**Düzeltmeler**
- Anasayfadaki Shopify'dan kalma kırık görsel (`arvoculture.com/cdn/shop/...`)
- `supabase-public.ts` ölü dosyası

## Vercel

Ortam değişkenleri zaten tanımlı, ek ayar gerekmiyor.
