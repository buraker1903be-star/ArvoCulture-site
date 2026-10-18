"use client";

import { useState } from "react";

/*
  MAĞAZANIN LOGOSU.

  Başlık ve altbilgi `public/arvoculture-logo-transparent.png`
  dosyasını doğrudan basıyordu: panele logo yükleyen ikinci bir
  kiracının sitesinde BİZİM logomuz duruyordu — üstelik mağaza
  adıyla birlikte, yani sayfa kendi içinde çelişiyordu.

  ORAN VARSAYILMIYOR. Depodaki logo 320×39; panele yüklenen logo
  başka orandaysa `next/image`'ın koyduğu `aspect-ratio` onu
  eziyor. Paylaşım kartında tam bu olmuştu. Uzak logo bu yüzden
  düz `img` ile basılıyor: tarayıcı görselin KENDİ oranını
  kullanıyor, yükseklik CSS'ten geliyor (`.logo img`,
  `.footer-logo`).

  YÜKLENEMEYEN LOGO KIRIK SİMGE OLMUYOR (18.10.2026).

  Canlıda görüldü: panelde logo değiştirilince depodaki eski dosya
  SİLİNDİ ama tema kaydındaki adres eskisini göstermeye devam etti
  — yani her sayfanın başında 404 veren bir görsel duruyordu.
  Kiracının kendi dosyasına bağlı her yüzeyde bu olabilir: dosya
  silinir, taşınır, depo erişilemez olur.

  Yüklenemezse mağazanın ADI yazılıyor. İsimsiz bir kırık simge,
  müşteriye hangi mağazada olduğunu bile söylemiyor.

  Bu yüzden istemci bileşeni: `onError` yalnızca tarayıcıda
  çalışıyor. Durum tek bir boole; sunucuda çizilen ilk hâli
  logonun kendisi, yani olağan durumda ek bir iş yok.
*/
export function StoreLogo({
  logoUrl,
  storeName,
  className,
  priority = false,
}: {
  logoUrl?: string;
  storeName: string;
  className?: string;
  priority?: boolean;
}) {
  const [bozuk, setBozuk] = useState(false);

  if (logoUrl && !bozuk) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element --
         next/image uzak logonun oranını bilmediği için görseli
         eziyor; ölçü verilemeyen tek yer burası. */
      <img
        className={className}
        src={logoUrl}
        alt={storeName}
        loading={priority ? "eager" : "lazy"}
        onError={() => setBozuk(true)}
      />
    );
  }

  /*
    LOGO YOKSA YA DA YÜKLENEMEDİYSE: MAĞAZANIN ADI.

    Depodaki `arvoculture-logo-transparent.png`'ye düşülmüyor. O
    dosya ArvoCulture'ın logosu ve logosu olmayan ikinci bir
    kiracının başlığında onu göstermek, bu gece kapatılan
    sızıntıların aynısı olurdu — üstelik mağaza adıyla yan yana,
    yani sayfa kendi içinde çelişirdi.

    Yazıyla yazılmış bir mağaza adı, yanlış bir logodan da kırık
    bir simgeden de iyi.
  */
  return (
    <span className={className} data-logo="ad">
      {storeName}
    </span>
  );
}
