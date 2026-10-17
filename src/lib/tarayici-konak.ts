/*
  TARAYICIDAKİ MAĞAZA ADRESİ.

  Hesap alanındaki çağrılar (siparişlerim, iadelerim, iade talebi)
  tarayıcıdan doğrudan veritabanına gidiyor; oturum orada. Mağazayı
  çözen fonksiyonlar adres istiyor ve adres burada window'dan
  okunuyor.

  GÜVENLİK AÇISINDAN SORUN DEĞİL: istemci başka bir mağazanın
  adresini yollasa bile fonksiyonlar `auth.uid()` ile süzüyor —
  kullanıcı yine yalnızca KENDİ siparişlerini görür, yalnızca o
  mağazadakileri. Adres "hangi mağazanın vitrinindeyim" sorusunun
  yanıtı, bir yetki değil.

  Sunucu tarafındaki karşılığı lib/konak.ts; o headers() okuyor ve
  tek mağaza kipini de biliyor.
*/
export function tarayiciKonagi(): string {
  if (typeof window === "undefined") return "";
  return window.location.host.toLowerCase();
}
