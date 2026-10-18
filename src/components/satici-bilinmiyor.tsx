/*
  SATICI BİLİNMİYORSA SAYFA BUNU SÖYLÜYOR.

  Hukuki sayfalar satıcı bilgilerini `getSeller()` ile okuyor.
  Okuma başarısız olursa (geçici kesinti, adresi tanınmayan
  mağaza) eskiden `lib/seller.ts`'teki ArvoCulture sabitlerine
  düşülüyordu: ikinci bir kiracının mesafeli satış sözleşmesinde
  BAŞKA bir şirketin unvanı ve vergi numarası görünüyordu. Müşteri
  kiminle sözleşme yaptığını buradan okuyor.

  Artık alanlar boş kalıyor ve sayfanın başında bu uyarı duruyor.
  Eksik bir sözleşme, YANLIŞ taraf gösteren bir sözleşmeden iyi:
  biri görünür bir kusur, diğeri görünmeyen.
*/
export function SaticiBilinmiyor({ seller }: { seller: { legalName: string } }) {
  if (seller.legalName) return null;

  return (
    <p className="list-hint" role="status">
      Satıcı bilgileri şu anda görüntülenemiyor. Sözleşmenin tarafı olan
      firma bilgisi için lütfen daha sonra tekrar deneyin ya da bizimle
      iletişime geçin.
    </p>
  );
}
