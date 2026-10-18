/*
  ÖDEME FORMUNDA NE EKSİK?

  NEDEN AYRI DOSYA: karar saf olmalı ki test edilebilsin ve düğmenin
  davranışı bir bileşenin içinde gömülü kalmasın.

  NEDEN VAR (18.10.2026, canlıda ölçüldü): "Ödemeye geç" düğmesi
  form tamamlanana kadar DEVRE DIŞIydı. Müşteri on iki alanı
  doldurup 2.150 piksel aşağı kaydırıyor ve karşısında gri bir
  düğme buluyordu — hangisinin eksik olduğunu söyleyen hiçbir şey
  yoktu. Boş formla düğmeye basmak hiçbir şey yapmıyordu: hata
  yok, odak yok, kaydırma yok.

  Düğme artık açık; basınca eksik alan SÖYLENİYOR ve oraya
  gidiliyor. Sıra sayfadaki sırayla aynı: müşteriyi en üstteki
  eksiğe götürmek, aşağıdakine götürüp sonra yukarı çıkarmaktan
  iyi.
*/

export type OdemeFormu = {
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  line: string;
};

export type OdemeOnaylari = {
  distance: boolean;
  preInfo: boolean;
  privacy: boolean;
};

export type EksikAlan = {
  /* Sayfadaki alanı bulmak için: `data-alan` niteliği. */
  alan: string;
  mesaj: string;
};

/*
  Telefon denetimi bileşenle AYNI olmalı; buraya kopyalanmadı,
  çağıran taraf veriyor. Kopyalansaydı iki kural zamanla ayrışır ve
  düğme "eksik yok" derken gönderim reddedilirdi.
*/
export function eksikAlanlar(
  form: OdemeFormu,
  onaylar: OdemeOnaylari,
  kalemSayisi: number,
  telefonGecerli: (deger: string) => boolean,
  /*
    YURTDIŞINDA İLÇE ZORUNLU DEĞİL. "İl / ilçe" Türkiye'nin adres
    düzeni; pek çok ülkede ikinci bir idari kademe yok ya da adreste
    yazılmıyor. Zorunlu tutmak, müşteriyi uydurma bir ilçe yazmaya
    zorlamak olurdu ve kargo etiketine o uydurma değer basılırdı.
  */
  yurtDisi = false,
): EksikAlan[] {
  const eksik: EksikAlan[] = [];

  if (form.name.trim().length <= 2) {
    eksik.push({ alan: "name", mesaj: "Ad soyad" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email)) {
    eksik.push({ alan: "email", mesaj: "Geçerli bir e-posta adresi" });
  }
  if (!telefonGecerli(form.phone)) {
    eksik.push({ alan: "phone", mesaj: "Geçerli bir telefon numarası" });
  }
  if (form.city.trim().length <= 1) {
    eksik.push({ alan: "city", mesaj: "İl" });
  }
  if (!yurtDisi && form.district.trim().length <= 1) {
    eksik.push({ alan: "district", mesaj: "İlçe" });
  }
  if (form.line.trim().length <= 8) {
    eksik.push({ alan: "line", mesaj: "Açık adres" });
  }

  /*
    Onaylar tek satırda toplanıyor: üçünü ayrı ayrı saymak
    "Mesafeli satış sözleşmesi, ön bilgilendirme formu ve gizlilik
    metni" diye üç maddelik bir liste üretiyordu ve müşteri tek bir
    kutuyu işaretlemediğini anlamıyordu.
  */
  if (!onaylar.distance || !onaylar.preInfo || !onaylar.privacy) {
    eksik.push({ alan: "onaylar", mesaj: "Sözleşme onayları" });
  }

  /* Sepet boşsa eksik alan değil, akışın kendisi geçersiz. */
  if (kalemSayisi === 0) {
    eksik.push({ alan: "sepet", mesaj: "Sepetinizde ürün yok" });
  }

  return eksik;
}

/**
 * Müşteriye gösterilecek tek cümle.
 *
 * ETİKETLER DIŞARIDAN VERİLEBİLİYOR: yurtdışı vitrini aynı alanları
 * İngilizce adlandırıyor ("Province" / "İl") ve alan adlarını burada
 * ikinci kez yazmak, iki listenin zamanla ayrışması demekti. Varsayılan
 * davranış değişmedi — çağıran bir şey vermezse Türkçe metin.
 *
 * İNGİLİZCEDE CÜMLE KALIBI AYRI. Türkçe "A, B ve c eksik." kalıbı
 * sondaki sözcüğü küçük harfe çeviriyor; İngilizcede bu hem yanlış
 * ("... and street address are missing") hem de tekil/çoğul uyumu
 * gerektiriyordu. "Please complete: …" kalıbı her sayıda alan için
 * doğru ve kısa.
 */
export function eksikMetni(
  eksik: EksikAlan[],
  dil: "tr" | "en" = "tr",
  etiket: (alan: EksikAlan) => string = (alan) => alan.mesaj,
): string {
  if (eksik.length === 0) return "";
  const adlar = eksik.map(etiket);

  if (dil === "en") return `Please complete: ${adlar.join(", ")}.`;

  if (adlar.length === 1) return `${adlar[0]} eksik.`;
  const sonuncu = adlar[adlar.length - 1];
  const oncekiler = adlar.slice(0, -1).join(", ");
  return `${oncekiler} ve ${sonuncu.toLocaleLowerCase("tr-TR")} eksik.`;
}
