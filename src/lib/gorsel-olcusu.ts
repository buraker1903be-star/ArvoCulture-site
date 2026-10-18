/*
  GÖRSELİN KENDİ ÖLÇÜSÜ.

  Kart logoyu 1920×231 oranında varsayıyordu — depodaki ArvoCulture
  logosunun oranı. Panele yüklenen logo başka orandaysa
  `objectFit: contain` onu o kutunun içine sıkıştırıyor ve logo
  minicik çıkıyor (18.10.2026'da canlıda böyle oldu).

  Ölçü baytlardan okunuyor: satori uzak görseli kendisi ölçmüyor,
  genişlik ve yüksekliği bizim vermemiz gerekiyor. PNG'de ölçü
  IHDR'nin ilk sekiz baytında, JPEG'de SOF işaretçisinde.
*/
export function gorselOlcusu(dataUri: string): { en: number; boy: number } | null {
  const virgul = dataUri.indexOf(",");
  if (virgul < 0) return null;
  const bayt = Buffer.from(dataUri.slice(virgul + 1), "base64");

  /* PNG: 8 baytlık imza, 4 bayt uzunluk, "IHDR", sonra en/boy. */
  if (bayt.length > 24 && bayt.toString("ascii", 12, 16) === "IHDR") {
    return { en: bayt.readUInt32BE(16), boy: bayt.readUInt32BE(20) };
  }

  /* JPEG: işaretçileri atlaya atlaya SOF0–SOF3 / SOF5–SOF15 aranıyor. */
  if (bayt.length > 4 && bayt[0] === 0xff && bayt[1] === 0xd8) {
    let i = 2;
    while (i + 9 < bayt.length) {
      if (bayt[i] !== 0xff) {
        i += 1;
        continue;
      }
      const tur = bayt[i + 1];
      /* Ölçü taşıyan çerçeve başlıkları; 0xC4/0xC8/0xCC ölçü değil. */
      if (tur >= 0xc0 && tur <= 0xcf && tur !== 0xc4 && tur !== 0xc8 && tur !== 0xcc) {
        return { boy: bayt.readUInt16BE(i + 5), en: bayt.readUInt16BE(i + 7) };
      }
      i += 2 + bayt.readUInt16BE(i + 2);
    }
  }

  return null;
}
