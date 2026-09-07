# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "Sepet cekmecesi portal ile en one alindi"
git push
vercel --prod
```

## İki düzeltme

**Çekmece arkada kalıyordu.** Sepet düğmesi başlığın içinde;
başlık `position: sticky` ve `z-index: 40` ile kendi yığın
bağlamını oluşturuyor. Çekmece o bağlamın içinde render edildiği
için `z-index: 70` değeri işe yaramıyordu — bir yığın bağlamının
içindeki eleman, o bağlamın dışına çıkamaz.

Çözüm: çekmece artık React portal ile doğrudan `<body>` altına
basılıyor. Başlığın yığın bağlamından tamamen bağımsız.

**Sepet düğmesinde kalıcı halka.** Tıklandıktan sonra düğme odakta
kalıyor ve tarayıcı odak halkası bırakıyordu. Artık yalnızca
klavyeyle gezinildiğinde gösteriliyor; fareyle tıklamada
görünmüyor.

Erişilebilirlik korundu — klavye kullanıcısı hangi öğede
olduğunu görmeye devam ediyor.
