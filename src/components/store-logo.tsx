import Image from "next/image";

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

  Depodaki yedek `next/image` ile kalıyor: oranı biliniyor ve
  dosya bizim.
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
  if (logoUrl) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element --
         next/image uzak logonun oranını bilmediği için görseli
         eziyor; ölçü verilemeyen tek yer burası. */
      <img
        className={className}
        src={logoUrl}
        alt={storeName}
        loading={priority ? "eager" : "lazy"}
      />
    );
  }

  return (
    <Image
      className={className}
      src="/arvoculture-logo-transparent.png"
      alt={storeName}
      width={320}
      height={39}
      priority={priority}
    />
  );
}
