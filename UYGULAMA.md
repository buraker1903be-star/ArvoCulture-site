# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Adres etiketleri ve kurumsal fatura rozeti"
git push
vercel --prod
```

ARC tarafında migration yok — vergi numarası alanı zaten vardı.

## Bu turda

**Hazır etiketler.** Adres başlığı alanının altında "Ev" ve "İş"
düğmeleri. Tıklayınca başlığa yazılıyor. Serbest yazım da açık —
"Yazlık", "Annem" gibi isterse kendi etiketini girebiliyor.

Hazır seçenek koymamın sebebi tutarlılık: herkes elle yazınca
listede "ev", "EV", "Ev adresi" gibi farklı yazımlar oluşuyor.

**Kurumsal fatura rozeti otomatik.** Adreste vergi numarası ya da
firma unvanı doluysa başlık "Ev / Kurumsal fatura" şeklinde
görünüyor. Ayrı bir işaretleme gerekmiyor — vergi numarası girmek
zaten kurumsal fatura istemek demek.

İkinci kısım daha soluk renkte; başlığı bastırmıyor, yanında
duruyor.

Aynı rozet ödeme sayfasındaki adres seçicide de görünüyor. Müşteri
kurumsal mı bireysel mi fatura keseceğini seçim anında görüyor.
