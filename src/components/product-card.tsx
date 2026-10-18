import Image from "next/image";
import Link from "next/link";
import { QuickAdd } from "@/components/quick-add";
import { formatPrice, type Product } from "@/lib/product-types";
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
  cokSatanRozeti = true,
}: {
  product: Product;
  /**
   * "Çok satan" rozeti basılsın mı.
   *
   * Bölümün KENDİSİ çok satanlardan oluşuyorsa kapanıyor: on kartın
   * onunda aynı rozet, başlığın ("Çok satanlar") altında hiçbir şey
   * ayırt etmiyor, yalnızca gürültü ekliyor.
   */
  cokSatanRozeti?: boolean;
}) {
  const off = discountOf(product);
  /* Tükenen üründe "çok satan" yazmak alay gibi duruyor: müşteri
     satın alamayacağı bir ürünün ne kadar sevildiğini okuyor. */
  const cokSatan =
    cokSatanRozeti && product.bestSeller && product.available !== false;
  const href = `/urun/${product.slug}`;
  const second = product.images?.[1];

  return (
    <article className="card">
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
            {product.available === false ? (
              <b className="tag tag-out">Tükendi</b>
            ) : (
              /*
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
              */
              off > 0 && <b className="tag tag-off">%{off} İNDİRİM</b>
            )}
            {/*
              "ÇOK SATAN" DA ROZET OLDU (18.10.2026).

              İndirim rozeti görselden alınıp künye satırına
              taşınmış, sonra cam hap olarak görsele dönmüştü; "çok
              satan" o taşımada künye satırında kalmıştı ve markanın
              yanında, 10 punto soluk büyük harfle duruyordu —
              kaydırırken kimse görmüyordu. İkisi de aynı köşede,
              aynı hapta: biri fırsatı, diğeri KANITI söylüyor.

              Rengi ayrı: indirim kırmızı, çok satan mürekkep. İki
              kırmızı hap üst üste gelince hangisinin fiyatla ilgili
              olduğu kayboluyordu.
            */}
            {cokSatan && <b className="tag tag-best">Çok satan</b>}
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
        <b>{formatPrice(product.price)}</b>
        {product.oldPrice && product.oldPrice > product.price && (
          <del>{formatPrice(product.oldPrice)}</del>
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
