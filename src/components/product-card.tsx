import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { type Product } from "@/lib/product-types";
import { Fiyat } from "@/components/para-birimi";
import { FavouriteButton } from "@/components/favourite-button";
import { CardGallery } from "@/components/card-gallery";

/** İndirim yüzdesi: rozet ve sıralama için tek kaynak. */
export function discountOf(product: Product) {
  if (product.discountPercent) return product.discountPercent;
  if (product.oldPrice && product.oldPrice > product.price) {
    return Math.round((1 - product.price / product.oldPrice) * 100);
  }
  return 0;
}

export function ProductCard({
  product,
  onek = "",
}: {
  product: Product;
  /*
    DİL ÖNEKİ ("" ya da "/en"). İngilizce ağacın içindeki kart
    İngilizce ürün sayfasına gitmeli; Türkçe sayfaya düşerse ayrı
    adres kurmanın bütün anlamı kaybolur (lib/dil-onek).

    Varsayılan boş: Türkçe çağıranların hiçbiri değişmedi. Sunucu
    bileşeni olduğu için yolu kendisi okuyamıyor — istemci
    bileşenleri (quick-add, son gezilenler) `usePathname` ile
    çıkarıyor.
  */
  onek?: string;
}) {
  const off = discountOf(product);
  /* Tükenen üründe "çok satan" yazmak alay gibi duruyor: müşteri
     satın alamayacağı bir ürünün ne kadar sevildiğini okuyor. */
  /*
     "Çok satanlar" bölümünde bir ara kapatılmıştı — gerekçe, on
     kartın onunda aynı rozetin başlığı tekrarlamasıydı. Yanlıştı:
     rozet orada da aranıyor. Raf yatay kayıyor, başlık ekrandan
     çıkıyor ve kart tek başına kaldığında neden orada olduğunu
     söyleyen tek şey rozet. Ayrıca bölümdeki her ürün çok satan
     değil; koleksiyon boşsa işaretli ürünlere düşülüyor.
  */
  const cokSatan = product.bestSeller && product.available !== false;
  const href = `${onek}/urun/${product.slug}`;
  const second = product.images?.[1];

  return (
    /*
      `data-urun` GİZLEME İÇİN. Yurtdışı modunda gönderilemeyen
      ürünlerin kartları sunucuda basılan bir CSS kuralıyla
      gizleniyor ve kuralın tutunacağı yer bu nitelik
      (lib/yurtdisi-gizleme). Niteliği kaldırmak, o kartların
      yurtdışı vitrininde yeniden görünmesi demek.
    */
    <article className="card" data-urun={product.slug}>
      <Link
        href={href}
        className="card-art"
        aria-label={product.name}
        data-multi={second ? "true" : undefined}
        /*
          Görsel türü. Manken fotoğrafı çerçeveyi doldurur,
          paket çekimi nefes alır. Ayrım katalog katmanında
          yapılıyor (bkz. products.ts).
        */
        data-art={product.artStyle}
      >
        {/*
          Görsel üzerindeki rozetler: Tükendi | %X İNDİRİM | Çok satan.

          Bir ara hepsi buradan kaldırılmıştı ve gerekçe doğruydu:
          dört doygun kırmızı DİKDÖRTGEN yan yana gelince sayfanın en
          gürültülü öğesi onlar oluyor, göz ürünlerden önce rozetlere
          gidiyordu. Sorun rozetin yeri değil biçimiydi; cam hapa
          geçince ikisi de geri döndü (aşağıdaki notlar).

          Aynı anda en fazla ikisi çıkıyor: tükenen üründe indirim
          ve "çok satan" basılmıyor.
        */}
        {(product.available === false || off > 0 || cokSatan) && (
          <span className="card-flags">
            {/*
              SIRA: ÖNCE "ÇOK SATAN", SONRA İNDİRİM.

              Haplar yukarıdan aşağıya diziliyor ve ikisi birden
              çıktığında üstteki önce okunuyor. Üstte kanıt, altta
              fiyat: müşteri önce ürünün tercih edildiğini görüyor,
              indirimi onun üstüne biniyor. Ters sırada indirim tek
              başına okunuyordu ve "ucuz olduğu için mi" sorusu
              kanıttan önce geliyordu.
            */}
            {cokSatan && <b className="tag tag-best">Çok satan</b>}

            {/*
              İNDİRİM ROZETİ GÖRSELE GERİ DÖNDÜ (18.10.2026).

              Rozet buradan alınıp fiyatın yanına taşınmıştı ve
              gerekçesi doğruydu: dört DOYGUN KIRMIZI DİKDÖRTGEN
              yan yana gelince sayfanın en gürültülü öğesi onlar
              oluyor, göz ürünlerden önce rozetlere gidiyordu.

              Sorun rozetin yeri değil BİÇİMİYDİ. Bu sefer cam
              bir hap: beyaz yarı saydam zemin, indirim rengiyle
              yazı, küçük. Göz önce ürünü görüyor, oranı hemen
              sonra — ama kaydırırken fırsatı kaçırmıyor.

              Metin "−%25" değil "%25 İNDİRİM": tek başına bir
              eksi işareti ve sayı, ne olduğunu söylemiyordu.
              Kelimeyi yazmak rozeti bir fiyat etiketinden
              FIRSAT bildirimine çeviriyor.

              Fiyatın yanındaki ikinci oran kaldırıldı: aynı
              bilgiyi iki kez göstermek karta gürültü ekliyordu.
            */}
            {product.available === false ? (
              <b className="tag tag-out">Tükendi</b>
            ) : (
              off > 0 && <b className="tag tag-off">%{off} İNDİRİM</b>
            )}
          </span>
        )}
        {/*
          Dokunmatikte kaydırılabilir galeri, masaüstünde tek
          görsel. İki ayrı düzen: masaüstünde hover ile ikinci
          görsel zaten çalışıyor ve daha az etkileşim istiyor.
        */}
        {/*
          `sizes` ölçülen kart genişliği: telefonda ekranın %38–40'ı,
          tablette %28'i, masaüstünde %16–21'i (en fazla ~265px).
          "50vw / 33vw / 25vw / 20vw" kartı büyük bildiriyordu.
        */}
        {product.images.length > 1 ? (
          <CardGallery
            images={product.images.slice(0, 4)}
            alt={product.name}
            sizes="(max-width: 640px) 40vw, (max-width: 980px) 29vw, (max-width: 1280px) 21vw, min(17vw, 270px)"
          />
        ) : (
          product.image && (
            <Image
              className="card-img"
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 40vw, (max-width: 980px) 29vw, (max-width: 1280px) 21vw, min(17vw, 270px)"
            />
          )
        )}

      </Link>

      <FavouriteButton slug={product.slug} label={product.name} />

      {/*
        Künye satırı: marka ve "çok satan" işareti. İkisi de aynı
        büyük harf dilinde, aralarında ince bir ayraç. Marka boşsa
        ayraç da basılmaz.
      */}
      {/* "Çok satan" buradan görsele taşındı; satırda yalnızca marka
          kaldı. İki yerde göstermek aynı bilgiyi tekrar etmek olurdu. */}
      {product.eyebrow && (
        <p className="card-brand">
          <span>{product.eyebrow}</span>
        </p>
      )}
      <h3>
        <Link href={href}>{product.name}</Link>
      </h3>

      <div className="price">
        {/* Fiyat seçili para biriminde: dolar seçiliyse tarayıcı
            çeviriyor, sunucu her zaman TL basıyor — ürün sayfasının
            rota önbelleği bu yüzden bozulmuyor (para-birimi.tsx). */}
        <b><Fiyat lira={product.price} /></b>
        {product.oldPrice && product.oldPrice > product.price && (
          <del><Fiyat lira={product.oldPrice} /></del>
        )}
        {/* İndirim oranı görselin üstündeki rozette; burada
            tekrarlanmıyor. */}
      </div>

      <div className="card-action">
        <QuickAdd product={product} />
      </div>
    </article>
  );
}
