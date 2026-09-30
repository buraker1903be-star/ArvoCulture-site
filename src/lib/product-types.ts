/**
 * İstemci tarafında da kullanılabilen ürün tipi ve biçimlendiriciler.
 * Veri çekme kodu (server-only) src/lib/products.ts içindedir — ikisi
 * bilinçli olarak ayrıdır, aksi hâlde sunucuya özel modüller sepet gibi
 * istemci bileşenlerine sızar.
 */
export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  eyebrow: string;
  tone: string;
  subtitle: string;
  description: string;
  tags: string[];
  image?: string;
  /** Galeri için tüm görseller. image, bunun ilk elemanıdır. */
  images: string[];
  /**
   * Görselin türü. Kart ve galeri çerçevesi buna göre değişir:
   * paket çekimi nefes almalı, manken fotoğrafı çerçeveyi
   * doldurmalı.
   */
  artStyle: "packshot" | "lifestyle";
  /** Tedarikçi ürünlerinde tablo hâlindeki özellikler. */
  specs: Array<{ label: string; value: string }>;
  sizeGuide: Array<{ label: string; value: string }>;
  /** Stokta olan bedenler. Koleksiyon filtresi bunu kullanır. */
  sizes: string[];
  available?: boolean;
  badge?: string;
  badgeTone?: "green" | "navy" | "gold" | "red";
  bestSeller?: boolean;
  discountPercent?: number;
};

export const formatPrice = (n: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(n);

/**
 * Gösterilebilir varyant etiketi.
 *
 * Tek varyantlı ürünler (kozmetik, parfüm, setler) tedarikçi
 * kataloğundan "Default Title" gibi yer tutucu başlıklarla gelir.
 * Bu, ürünün bir özelliği değil veri kaynağının varsayılanı;
 * sepette ürün adının altında göstermek anlamsız.
 *
 * Üstelik iki kat bozuk görünüyordu: sayfa Türkçe olduğu için
 * CSS büyük harfe çevirirken "Title" kelimesindeki i harfini
 * İ yapıyor ve müşteri sepette "DEFAULT TİTLE" okuyordu.
 *
 * Gerçek bir beden ya da varyant adı varsa olduğu gibi döner.
 */
const PLACEHOLDER_VARIANT_TITLES = new Set([
  "default title",
  "default",
  "title",
  "varsayilan",
  "varsayılan",
  "tek beden",
  "standart",
]);

/**
 * Ton ve beden adlarının gösterim biçimi.
 *
 * Tedarikçi verisinde aynı üründe iki ayrı yazım dolaşıyor: dudak
 * kaleminde "Pure Red · rosy-nude · Berry Rose", mat rujda
 * "pure-red · Rosy Nude · Ruby Red" (30.09.2026'da ölçüldü). Müşteri
 * ton seçicisinde bir slug görüyor.
 *
 * YALNIZCA SLUG GÖRÜNÜMLÜ DEĞER DÜZELTİLİYOR: tamamı küçük harf ve
 * içinde tire olan. "Siyah/Beyaz Çizgili" gibi gerçek adlara
 * dokunulmuyor — elle yazılmış bir adı biçimlendirmeye kalkmak
 * kazandırdığından çok bozardı.
 *
 * Büyütme Türkçe yerelle DEĞİL: slug hâline gelmiş değer zaten
 * ASCII'ye indirgenmiş oluyor ve tr-TR "indigo"yu "İndigo" yapardı.
 *
 * Seçim hâlâ HAM değerle yapılıyor; burada değişen yalnızca ekranda
 * okunan metin.
 */
export function renkAdi(deger: string): string {
  const sade = deger.trim();
  if (!sade.includes("-") || sade !== sade.toLowerCase()) return sade;
  return sade
    .split("-")
    .filter(Boolean)
    .map((parca) => parca.charAt(0).toUpperCase() + parca.slice(1))
    .join(" ");
}

export function displayVariantLabel(
  input: { size?: string | null; color?: string | null; title?: string | null } | undefined,
): string | undefined {
  if (!input) return undefined;

  /*
    RENK DE ETİKETE GİRİYOR. Önce yalnızca bedene bakılıyordu; rengi ve
    bedeni olan bir üründe sepette "M" yazıyor, hangi renk olduğu
    kayboluyordu. Kozmetikte beden hiç yok, orada tek ayırt edici renk
    (30.09.2026'da renk seçici eklenince ortaya çıktı).
  */
  const size = input.size?.trim();
  const color = input.color ? renkAdi(input.color) : undefined;
  if (size && color) return `${color} · ${size}`;
  if (size) return size;
  if (color) return color;

  const title = input.title?.trim();
  if (!title) return undefined;

  /* Karşılaştırma ASCII küçük harfle: yer tutucular İngilizce
     geliyor ve Türkçe küçük harf kuralı "Title" kelimesini
     "tıtle" yapıp eşleşmeyi kaçırırdı. */
  return PLACEHOLDER_VARIANT_TITLES.has(title.toLowerCase())
    ? undefined
    : title;
}

/*
  Kategori çıkarımı buraya taşındı (30.09.2026). products.ts'te
  duruyordu ama o modül ortam değişkeni okuyan @/lib/env'i çekiyor:
  saf bir sınıflandırma kuralını test etmek için Supabase adresi
  tanımlamak gerekiyordu. Arama dizini de onu buradan alıyor ve
  artık sunucuya özel modülü boşuna içeri çekmiyor.
*/
/**
 * Ürün kategorisi ad ve tür alanından çıkarılıyor.
 *
 * Arama dizini de aynı sınıflandırmayı kullanmak zorunda; iki ayrı
 * kural kümesi olsaydı aynı ürün koleksiyonda "Giyim", aramada
 * "Kişisel Bakım" görünebilirdi.
 */
export const inferCategory = (row: {
  product_type?: string | null;
  name: string;
}) => {
  const text = `${row.product_type ?? ""} ${row.name}`.toLocaleLowerCase(
    "tr-TR",
  );
  /*
    Giyim anahtar kelimeleri. Tedarikçi kataloğu geldiğinden beri
    liste genişletildi: eşofman, ceket, hırka, pantolon gibi
    ürünler "Kişisel Bakım" olarak sınıflanıyordu.
  */
  if (
    /tişört|tisort|t-shirt|sweat|hoodie|kapüşon|kapuson|giyim|oversize|regular fit|eşofman|esofman|jogger|pantolon|şort|sort|ceket|mont|hırka|hirka|yelek|gömlek|gomlek|elbise|etek|tayt|body|atlet|takım|takim|rüzgarlık|ruzgarlik|kaban|blazer|tulum|bluz|kazak|triko/.test(
      text,
    )
  )
    return "Giyim";
  if (/parfüm|parfum|eau de parfum|eau de toilette| edp| edt/.test(text))
    return "Parfüm";
  /*
    "serum" bu listeye 30.09.2026'da eklendi: "LR ZEITGARD Vitamin C
    Serum" adındaki "vitamin" bir cilt bakım ürününü takviye kovasına
    düşürüyordu. Takviye kovası artık yok ama kural kaldı: serum bir
    kozmetiktir ve "Kişisel Bakım"a düşmesi de yanlış olurdu.
  */
  if (
    /ruj|maskara|fondöten|fondoten|highlighter|makyaj|lipgloss|dudak|eyeliner|concealer|bronzer|pudra|serum/.test(
      text,
    )
  )
    return "Kozmetik";
  /*
    TAKVİYE KOVASI YOK (30.09.2026). Takviye edici gıda satışı
    durduruldu; kova burada dururken katalogda hiç ürünü olmayan bir
    kategori kalıyordu ve menüde, ana sayfada, koleksiyon adresinde
    hâlâ görünüyordu. Kalıp listesi de silindi: yeniden eklenmesi
    gereken gün, o günün ürünlerine göre yazılmalı; bugünün ölü
    kalıplarını taşımanın değeri yok.
  */
  return "Kişisel Bakım";
};
