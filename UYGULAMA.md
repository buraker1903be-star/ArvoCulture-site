# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Iletisim sayfasi yeniden tasarlandi"
git push
vercel --prod
```

## Doldurulması gerekenler

`src/app/iletisim/page.tsx` içinde iki `TODO` var:

1. **MERSİS, vergi dairesi ve vergi numarası** — şu an "—"
   görünüyor. Mesafeli satış mevzuatı bu bilgilerin tüketici
   tarafından erişilebilir olmasını arıyor.
2. **Telefon / WhatsApp** — eklemek isterseniz `CHANNELS` dizisine
   kart ekleyin. Erişilemeyen bir numara koymayın; cevapsız telefon
   güveni düşürür.

## Bu turda

Sayfa düz metin bloklarıydı. Dört bölüme ayrıldı:

**1. Giriş** — tek cümlelik yönlendirme. "Sipariş numaranızı
eklerseniz daha hızlı dönüş yaparız" cümlesi başa alındı; en çok
zaman kaybettiren şey eksik bilgiyle gelen mesajlar.

**2. İletişim kanalları** — iki kart: doğrudan e-posta ve sipariş
takibi. Takip kartındaki bağlantı konu satırını önceden
dolduruyor.

**3. Belki cevabı burada** — dört tıklanabilir kart: kargo, iade,
SSS, mesafeli satış sözleşmesi. Destek yükünün büyük kısmı bu dört
sorudan geliyor; müşteri yazmadan önce cevabı bulabiliyor.

**4. Satıcı bilgileri** — ticaret unvanı, adres, e-posta, MERSİS
ve vergi bilgileri. Footer'dan ticaret unvanını kaldırdığımız için
bu bilgi burada bulunmak zorunda.
