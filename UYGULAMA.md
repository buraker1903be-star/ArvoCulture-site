# İKİ REPO — sırayla

## 1) C:\ArvoARC  (önce bu)

`arc-adres-normal.zip` içindeki migration'ı Supabase SQL
Editor'de çalıştırın.

## 2) C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Siparis detayinda teslimat ve fatura adresi"
git push
vercel --prod
```

## Sorun neydi

RPC adresi bulduğu yapıda döndürüyordu. Shopify aktarımında alan
adı `address1`, vitrin siparişinde `line`. Arayüz `line` beklediği
için Shopify yapısındaki adres boş görünüyordu.

Fatura adresi ise hiç döndürülmüyordu.

## Çözüm

**Adresler tek şemaya normalleştiriliyor.** Kaynak ne olursa olsun
RPC şu yapıyı döndürüyor:

```
{ line, district, city, postal, name, phone,
  company, tax_office, tax_number }
```

Arayüz tek bir yapı okuyor, kaynağın ne olduğuyla ilgilenmiyor.
`address1` ve `address2` birleştiriliyor, posta kodundaki Excel
artığı kesme işareti temizleniyor.

**Sipariş detayında artık:**

- Teslimat adresi — ad, telefon, açık adres, ilçe/il, posta kodu
- Fatura adresi — teslimatla aynıysa "Fatura adresi teslimat
  adresiyle aynı" yazıyor, tekrar göstermiyor
- Kurumsal fatura bilgileri (firma unvanı, vergi dairesi, vergi
  no) varsa adresin altında
- Sipariş notu

## Not alanı hakkında

Vitrin notu ödeme isteğine gönderiyor ama ARC'ın sipariş
fonksiyonu `note` parametresi almıyor; şu an kaydedilmiyor.
Sipariş detayında not alanı hazır, veri gelince görünecek.

İsterseniz sipariş fonksiyonuna not parametresini ekleyeyim.
