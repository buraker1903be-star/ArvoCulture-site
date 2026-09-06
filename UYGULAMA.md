# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Kampanya paneli yeniden tasarlandi"
git push
vercel --prod
```

## Sorun neydi

"İlk seçimine özel" paneli okunmuyordu: metin beyazdı ama zemin
açık kalıyordu. Panel okunabilirliği kampanya görselinin varlığına
bağlıydı; görsel tanımlı değilken ya da açık renkliyken yazı
kayboluyordu.

## Ne yapıldı

**Panel kendi koyu zeminini taşıyor.** Zeytin-siyah gradyan,
sol üstten gelen hafif bir aydınlanma. Kampanya görseli varsa
%28 opaklıkla üzerine biniyor — okunabilirlik artık görsele bağlı
değil.

**Kupon kodu ayrı bir karta alındı.** Eskiden "ARVO10 koduyla %10
indirim" cümlesinin içinde geçiyordu ve gözden kaçıyordu. Artık
kesik çizgili bir kart içinde büyük harflerle, yanında beyaz
kopyalama butonuyla duruyor.

**Üst etiket eklendi:** "YENİ MÜŞTERİLERE ÖZEL". Teklifin kime
olduğu başlıktan önce anlaşılıyor.

Başlık ve açıklama yine ARC panelinden yönetiliyor
(`campaign_title`, `campaign_description`); kupon kodu indirim
kaydından otomatik geliyor.
