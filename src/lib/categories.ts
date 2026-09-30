/**
 * Ana sayfadaki kategori listesi.
 *
 * page.tsx içinde duruyordu; iki yerden okunuyor (kategori kartları ve
 * hero'nun altındaki kısayol şeridi) ve o dosya sunucuya özel modüller
 * çektiği için test edilemiyordu. Ayrı ve saf bir modülde durunca
 * tests/kategori.test.ts listeyi doğrulayabiliyor.
 *
 * `href`in son parçası aynı zamanda GÖRSEL ANAHTARIDIR: kart
 * `public/kategori/<anahtar>.jpg` dosyasını basar. Dosya yoksa ana
 * sayfada kırık görsel çıkar ve hiçbir şey uyarmaz — test bu yüzden
 * her anahtarın dosyasını arıyor.
 */
export type SiteCategory = { label: string; href: string };

export const CATEGORIES: SiteCategory[] = [
  { label: "Giyim", href: "/koleksiyon/giyim" },
  { label: "Kişisel Bakım", href: "/koleksiyon/bakim" },
  { label: "Kozmetik", href: "/koleksiyon/kozmetik" },
  { label: "Parfüm", href: "/koleksiyon/parfum" },
];

/** "/koleksiyon/bakim" → "bakim" */
export const categoryKey = (href: string): string => href.split("/").pop() ?? "";
