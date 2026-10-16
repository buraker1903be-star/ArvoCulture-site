import { SELLER } from "@/lib/seller";

/*
  CAYMA SÜRESİ — vitrinin aynası.

  Kural ArvoARC'ta: iade talebi oluşturan iki fonksiyon
  (arc_storefront_return_request / create_arvoculture_return_request)
  sipariş tarihinden itibaren ON DÖRT GÜNDEN eski siparişe talep
  açtırmıyor ve "İade süresi dolmuş." diyor.

  Burada ikinci bir kural değil, AYNI kuralın gösterimi var: vitrin
  düğmeyi süresi geçmiş siparişte göstermesin. Önce hiç bakmıyordu —
  müşteri formu açıyor, ürünü seçiyor, sebebini yazıyor ve ancak
  "Talebi gönder"den sonra duvara tosluyordu. 16.10.2026'da fonksiyon
  30 günden 14'e çekilirken görüldü.

  Tek sayı burada: ArvoARC'ta değişirse bu dosya ve testi aynı gün
  güncellenir (AGENTS: "ArvoARC'ta kural değişirse vitrin aynı gün").
*/

/*
  GÜN SAYISI TEK KAYNAKTAN: SELLER.withdrawalDays. Burada ayrı bir 14
  yazmıştım; oysa aynı sayı cayma hakkı sayfasında ve ürün şemasının
  `merchantReturnDays` alanında zaten o sabitten okunuyordu. İki kopya,
  biri değişince ötekinin sessizce eski kalması demek — müşteriye
  politikada bir süre, düğmede başka bir süre göstermek.

  ArvoARC'taki `v_days > 14` ile aynı sayı olmalı; orada da sabit
  (mağaza ayarlarında böyle bir alan yok).
*/
export const IADE_GUNU: number = SELLER.withdrawalDays;

const GUN = 86_400_000;

/**
 * Siparişe hâlâ iade talebi açılabilir mi?
 *
 * Gün sayısı ArvoARC'taki gibi TAM GÜN farkıyla ölçülüyor
 * (`extract(day from now() - created_at)`): on dördüncü gün hâlâ
 * içeride, on beşinci gün dışarıda. Saat farkı aşağı yuvarlanıyor,
 * yani müşteri lehine.
 */
export function iadeAcikMi(createdAt: string, now: number = Date.now()): boolean {
  const an = Date.parse(createdAt);
  /* Okunamayan tarihte düğme GÖSTERİLİYOR: kararı fonksiyon verir ve
     müşteriyi haksız yere kapıda bırakmaktansa sunucuya sorması iyidir. */
  if (Number.isNaN(an)) return true;
  return Math.floor((now - an) / GUN) <= IADE_GUNU;
}

/** Düğme yerine yazılan açıklama. */
export const iadeSuresiGectiMetni = `İade süresi doldu. Kullanılmamış ürünler teslimattan itibaren ${IADE_GUNU} gün içinde iade edilebilir.`;
