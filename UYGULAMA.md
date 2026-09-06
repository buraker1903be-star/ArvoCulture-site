# HANGİ REPO: C:\ArvoCulture-site

```powershell
cd C:\ArvoCulture-site
git add -A
git commit -m "American Express logosu eklendi"
git push
vercel --prod
```

## Beklenen dosya adı

```
public/rozet/americanexpress.png
```

Dosyanız farklı adlandırılmışsa (`amex.png` gibi) ya dosyayı
yeniden adlandırın ya da `src/app/layout.tsx` içindeki
`pay-cards` listesinde `file: "americanexpress"` değerini
değiştirin.

Beş kart logosu sırayla: Visa, Mastercard, Troy, Maestro,
American Express.
