# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "SSS sayfasi yeniden tasarlandi"
git push
vercel --prod
```

## Bu turda

**5 soru → 15 soru, dört başlık altında.** Sipariş ve kargo, İade
ve değişim, Ödeme, Ürünler. Tek uzun liste aradığını bulmayı
zorlaştırıyordu.

Eklenen konular: kargo ücreti (120 TL), sipariş takibi, yurt dışı
gönderim, iade edilemeyen ürünler, beden değişimi, kabul edilen
kartlar, kart güvenliği, indirim kodu kullanımı, fatura, stok
bildirimi, ürün seçimi.

**Akordeon yenilendi.** Sağda artı işareti, açılınca eksiye
dönüyor. Üzerine gelince başlık yeşile çalıyor. Hangi sorunun
açık olduğu net.

**FAQPage şeması eklendi.** Bu, sayfayı Google sonuçlarında
açılır soru olarak gösterilebilir kılıyor ve ChatGPT, Perplexity
gibi yapay zekâ arama motorlarının yanıtları doğru alıntılamasını
sağlıyor. GEO tarafında en yüksek getirili tek işlem budur —
15 sorunun tamamı şemaya dahil.

**Alt çağrı eklendi.** "Cevabını bulamadınız mı?" — WhatsApp
butonu ve iletişim sayfası bağlantısı.

## Kontrol

Kargo ücretini 120 TL olarak yazdım (100 TL + %20 KDV). Müşteriye
gösterilen tutar bu olmalı; farklıysa `src/app/sss/page.tsx`
içinde düzeltin. Aynı rakam ödeme sayfasında ve ARC'taki sipariş
fonksiyonunda da geçiyor, üçü tutarlı olmalı.
