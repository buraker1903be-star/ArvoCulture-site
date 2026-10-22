import type { Dil } from "@/lib/dil-onek";

/*
  MENÜ ETİKETLERİNİN İNGİLİZCESİ.

  Menünün üç katmanı var ve üçü AYRI yerden geliyor:

  1. Ana başlıklar ("Erkek", "Parfüm") — header.tsx'te sabit dizi.
  2. Sütun başlıkları ("ÜST GİYİM") — koleksiyonun `menu_group`
     alanı, ArvoARC'ta kiracının girdiği düz metin.
  3. Yapraklar ("Men's T-Shirt") — koleksiyonun `title_en` alanı.

  Yalnızca ÜÇÜNCÜSÜ çeviriliydi: canlıda menü açıldığında yapraklar
  İngilizce, üstündeki iki katman Türkçe görünüyordu (23.10.2026).

  NEDEN SÖZLÜK, NEDEN VERİTABANI DEĞİL: ana başlıklar zaten kodda
  sabit; `menu_group` ise kiracının yazdığı bir etiket ve ona
  İngilizce sütun eklemek üçüncü bir migration demekti. Burada
  eşleşmeyen etiket OLDUĞU GİBİ kalıyor — ikinci bir kiracının
  kendi grup adları Türkçe görünür ama menü çalışmaya devam eder,
  yani kusur görünür ve onarılabilir.

  ÜST DÜZEY KOLEKSİYONLARIN KARŞILIĞI BURAYA YAZILMADI: "Erkek",
  "Kadın", "Çocuk" ve "Aksesuar" zaten birer koleksiyon ve
  `title_en` alanları dolu. Aynı şeyi iki yerde tutmak, birinin
  değişip diğerinin kalması demek — `menuEtiketiCevir` o yüzden
  önce koleksiyonlara bakıyor.
*/
const MENU_SOZLUGU = new Map<string, string>([
  // Ana başlıklar
  ["yeni & çok satan", "New & bestsellers"],
  ["kişisel bakım", "Personal care"],
  ["kozmetik", "Beauty"],
  ["parfüm", "Fragrance"],
  // Sütun başlıkları (menu_group)
  ["üst giyim", "Tops"],
  ["alt giyim", "Bottoms"],
  ["dış giyim", "Outerwear"],
  ["alt üst takım", "Co-ords"],
  ["iç giyim", "Underwear"],
  ["giyim", "Clothing"],
  ["aksesuar", "Accessories"],
  ["kime göre", "Shop by"],
  ["cilt bakımı", "Skincare"],
  ["saç bakımı", "Hair care"],
  ["vücut bakımı", "Body care"],
  ["diğer bakımlar", "Other care"],
  ["sorununa göre", "By concern"],
  ["i̇htiyaca göre", "By concern"],
  ["ihtiyaca göre", "By concern"],
  ["makyaj", "Make-up"],
  ["marka koleksiyonları", "Brand collections"],
  ["kampanyalar", "Offers"],
  ["çocuk", "Kids"],
  ["diğer", "Other"],
]);

/**
 * Menü etiketini çevirir. Karşılığı yoksa etiket OLDUĞU GİBİ döner:
 * eksik bir çeviri, menüyü boş bırakmaktan iyidir.
 *
 * `koleksiyonlar` verilirse önce oraya bakılıyor — "Erkek" gibi
 * etiketlerin karşılığı zaten koleksiyon kaydında.
 */
export function menuEtiketiCevir(
  etiket: string,
  dil: Dil,
  koleksiyonlar?: Array<{ title: string; title_en?: string | null }>,
): string {
  if (dil !== "en") return etiket;

  const sade = etiket.trim().toLocaleLowerCase("tr");

  const koleksiyon = koleksiyonlar?.find(
    (k) => k.title?.trim().toLocaleLowerCase("tr") === sade && k.title_en,
  );
  if (koleksiyon?.title_en) return koleksiyon.title_en;

  return MENU_SOZLUGU.get(sade) ?? etiket;
}

/*
  BÜYÜK HARF DİLE GÖRE. Türkçe yerelde "i" harfi "İ" oluyor ve
  İngilizce bir başlık "INTERNATİONAL" diye yazılıyordu — canlıda
  görüldü (18.10.2026). Sütun başlıkları CSS ile değil burada
  büyütülüyor, o yüzden yerel burada da seçilmeli.
*/
export function menuBasligiBuyut(etiket: string, dil: Dil): string {
  return etiket.toLocaleUpperCase(dil === "en" ? "en-GB" : "tr-TR");
}

/*
  SÜTUN BAŞLIĞI ZATEN CİNSİYETİ SÖYLÜYOR, yaprakta tekrarı atılıyor:
  "Erkek T-Shirt" → "T-Shirt". Türkçede bu zaten yapılıyordu ama
  İngilizce yaprak `title_en`'den geldiği için önek İNGİLİZCE
  oluyor ve Türkçe desen onu bulamıyordu — menüde "Men's T-Shirt",
  "Men's Sweatshirt", "Men's Jumper" diye tekrar ediyordu.
*/
const ONEKLER: Record<string, RegExp> = {
  erkek: /^(men's|mens|men)\s+/i,
  kadın: /^(women's|womens|women|ladies)\s+/i,
  çocuk: /^(kids'|kids|children's|children)\s+/i,
};

export function cinsiyetOnekiniAt(baslik: string, cinsiyet: string, dil: Dil): string {
  if (dil !== "en") {
    return baslik.replace(new RegExp(`^${cinsiyet}\\s+`), "");
  }
  const desen = ONEKLER[cinsiyet.trim().toLocaleLowerCase("tr")];
  if (!desen) return baslik;
  const kalan = baslik.replace(desen, "").trim();
  /* Önek atılınca geriye bir şey kalmıyorsa başlık olduğu gibi
     kalıyor: "Men's" tek başına bir koleksiyon adı. */
  return kalan.length > 0 ? kalan : baslik;
}
