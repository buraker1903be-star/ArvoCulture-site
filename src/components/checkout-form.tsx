"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "@/components/cart";
import { BankTransfer } from "@/components/bank-transfer";
import { formatPrice } from "@/lib/product-types";
import { readCoupon, readNote } from "@/lib/cart-extras";
import { getAuthClient } from "@/lib/auth-client";
import { HediyeCekiSecici } from "@/components/hediye-ceki-secici";
import {
  formatInternationalPhone,
  formatPhone,
  isValidInternationalPhone,
  isValidPhone,
  phoneDigits,
} from "@/lib/phone";
import { eksikAlanlar, eksikMetni, type EksikAlan } from "@/lib/odeme-eksikleri";
import { evaluateCoupon, kuponaTabiToplam } from "@/lib/coupon";
import type { Address } from "@/components/address-book";
import { CheckoutSteps } from "@/components/checkout-steps";
import {
  amountToFreeShipping,
  dolarKarsiligi,
  malBedeli,
  shippingFor,
  transferDiscountFor,
  yurtIci,
} from "@/lib/order-quote";
import type { Bolge } from "@/lib/kargo-bolgesi";
import { teslimatUlkeleri, ulkeAdi } from "@/lib/ulkeler";
import { useParaBirimi } from "@/components/para-birimi";
import { dilOneki } from "@/lib/dil-onek";
import { dolarYazisi } from "@/lib/dolar";

/**
 * Ödeme sayfası.
 *
 * Buradaki tutarlar yalnızca müşteriye gösterim içindir. Gerçek
 * tutar ArvoARC’ta, veritabanındaki fiyatlardan hesaplanır ve PayTR’a
 * giden tutar odur. Bu sayfadan gönderilen tek bilgi hangi ürünün
 * kaç adet istendiğidir.
 */

const ARC_URL = "https://arc.arvo-os.com";

/** `api/storefront/kargo` yanıtı; tutarlar sent ve KURUŞ. */
type KargoTeklifi = {
  sent?: number | null;
  kurus?: number | null;
  agirlikGram?: number | null;
  malKurus?: number | null;
  engel?: string | null;
};

/*
  KARGO ENGELİNİN SEBEBİ SÖYLENİYOR.

  Üç engel üç ayrı şey: mod kapalı (yurtdışına hiç satmıyoruz), kur
  tanımsız (satıyoruz ama fiyatlayamıyoruz), bölge yok (bu ülkeye
  gitmiyoruz). Hepsine "kargo hesaplanamadı" demek, müşteriye ne
  yapacağını söylememek olurdu — başka bir ülke mi seçecek, Türkçe
  vitrine mi dönecek, bizimle mi iletişime geçecek?
*/
/*
  EKSİK ALAN ADLARI DA ÇEVRİLİYOR.

  `lib/odeme-eksikleri` Türkçe adlar döndürüyor ve o modül saf
  kalmalı (testi var, sözlüğü tanımıyor). Eşleme burada: alanın
  `data-alan` değeri → sözlük anahtarı. Listede olmayan bir alan
  Türkçe adıyla kalıyor — eksik bir çeviri, hiç mesaj görmemekten
  iyi.
*/
const EKSIK_ANAHTARI = {
  name: "adSoyad",
  email: "gecerliEposta",
  phone: "gecerliTelefon",
  city: "il",
  district: "ilce",
  line: "acikAdres",
  onaylar: "sozlesmeOnaylari",
  sepet: "sepetteUrunYok",
} as const;

const KARGO_ENGEL_ANAHTARI = {
  mod: "engelMod",
  kur: "engelKur",
  bolge: "engelBolge",
} as const;

/** Kargo kuralı ArvoARC’taki fonksiyonla aynı tutulmalıdır. */

/*
  HAVALE BİLGİSİ SUNUCUDAN GELİYOR, KODDAN DEĞİL.

  Burada `SELLER.bankName` / `SELLER.iban` okunuyordu ve bu dosya bir
  İSTEMCİ bileşeni: ArvoCulture'ın IBAN'ı tarayıcı paketinin
  içindeydi. Ortak dağıtımda ikinci bir kiracının havale ekranında
  o IBAN görünür, müşteri parayı BAŞKA bir mağazanın hesabına
  gönderirdi — sipariş "ödeme bekliyor"da kalır, hiçbir yerde hata
  görünmez. Değer artık `arc_storefront_seller(p_host)`'tan gelip
  ödeme sayfasından prop olarak iniyor.
*/
export type HavaleBilgisi = {
  bankName: string;
  iban: string;
  accountHolder: string;
  transferInstructions?: string;
};

export function CheckoutForm({
  supabaseUrl,
  supabaseKey,
  havale,
  bolgeler = [],
}: {
  supabaseUrl?: string;
  supabaseKey?: string;
  /** Hesap bilgisi yoksa null; havale seçeneği hiç gösterilmiyor. */
  havale: HavaleBilgisi | null;
  /*
    Yurtdışı kargo tarifesi. Boş liste "yurtdışına gönderim yok"
    demek — uydurma bir ücret göstermektense ülke seçeneğini hiç
    açmamak doğru (lib/kargo-bolgeleri).
  */
  bolgeler?: Bolge[];
}) {
  const { items, total, discounts, salesRules } = useContext(CartContext);
  /* Seçili para birimi: dolar seçiliyse tutarın dolar karşılığı da
     yazılıyor — ama ASIL rakam lira, çünkü tahsilat lira (aşağıda). */
  const { paraBirimi, t, dil } = useParaBirimi();
  /*
    BAĞLANTI ÖNEKİ DE DİLE BAĞLI. Sepet ve ödeme metinleri zaten
    İngilizceydi (dil para birimi seçiminden geliyor), ama
    bağlantılar öneksizdi: İngilizce sepetten "ödemeye geç" diyen
    müşteri TÜRKÇE ödeme sayfasına düşüyordu. Yarım çeviri değil,
    akışın ortasında dil değiştirmek.
  */
  const onek = dilOneki(dil);
  const router = useRouter();
  const [saved, setSaved] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | "manual">("manual");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    line: "",
    postal: "",
    /* Varsayılan Türkiye: vitrin önce Türkiye'ye satıyor ve ArvoARC
       da ülkesi boş gelen adresi Türkiye sayıyor. */
    country: "TR",
  });
  const [consents, setConsents] = useState({
    distance: false,
    preInfo: false,
    privacy: false,
  });
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  /* Banka havalesi seçilirse indirim uygulanıyor ve sipariş
     "ödeme bekliyor" durumunda oluşuyor. */
  const [transferChosen, setUseTransfer] = useState(false);
  /* Havale panelden kapatılmışsa ArvoARC havaleli siparişi 422 ile
     reddediyor; seçenek hiç gösterilmez, seçili kalmışsa yok sayılır. */
  const useTransfer = transferChosen && salesRules.transferEnabled;
  /* Seçilen hediye çekinin KODU. Tutarı burada hesaplanmıyor;
     bkz. aşağıdaki özet satırı. */
  const [hediyeCeki, setHediyeCeki] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "sending" | "error" | "paying">("idle");
  // Sepette girilen kupon ve not ödeme isteğine taşınır.
  const [coupon, setCoupon] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    /*
      localStorage sunucuda okunamaz; değerler ilk render’dan
      sonra yüklenir.
    */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCoupon(readCoupon());
    setNote(readNote());
  }, []);

  /*
    Giriş yapmış müşterinin kayıtlı adresleri getirilir ve
    varsayılan olan forma doldurulur. Müşteri her siparişte
    adresini yeniden yazmak zorunda kalmıyor; isterse "Yeni adres"
    seçip elle giriyor.
  */
  useEffect(() => {
    if (!supabaseUrl || !supabaseKey) return;

    let active = true;

    async function load() {
      const supabase = getAuthClient(supabaseUrl!, supabaseKey!);
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || !active) return;

      const meta = sessionData.session.user.user_metadata ?? {};

      const { data } = await supabase
        .from("arc_customer_addresses")
        .select("*")
        .order("is_default", { ascending: false });

      if (!active) return;

      const list = (data as Address[]) ?? [];
      setSaved(list);

      /*
        E-posta her koşulda doldurulur. Öncesinde yalnızca kayıtlı
        adresi olmayan müşteride yazılıyordu; adresi olanlar
        e-postasını elle girmek zorunda kalıyordu.
      */
      const email = sessionData.session.user.email ?? "";

      const preferred = list[0];
      if (preferred) {
        applyAddress(preferred, email);
        setSelected(preferred.id);
      } else {
        setForm((current) => ({
          ...current,
          name: current.name || String(meta.full_name ?? ""),
          email: current.email || (sessionData.session!.user.email ?? ""),
          phone: current.phone || formatPhone(String(meta.phone ?? "")),
        }));
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [supabaseUrl, supabaseKey]);

  function applyAddress(address: Address, email?: string) {
    setForm((current) => ({
      ...current,
      name: address.full_name,
      // Hesap e-postası varsa onu kullan; yoksa yazılanı koru.
      email: email || current.email,
      phone: formatPhone(address.phone),
      city: address.city,
      district: address.district,
      line: address.line,
      postal: address.postal_code ?? "",
    }));
  }
  const [message, setMessage] = useState("");

  /*
    Sepette uygulanan kod ödeme özetinde hiç görünmüyordu: müşteri
    sepette indirimi görüp burada kodsuz bir özetle karşılaşıyor,
    kodunun düştüğünü sanıyordu. Kod gösteriliyor ama tutarı
    hesaplanmıyor: indirimi sipariş oluşurken ArvoARC uyguluyor ve
    kargo ile havale indirimiyle birleşme sırası orada belirleniyor.
    Burada tahmini bir tutar göstermek, ödenen tutarla çelişebilirdi.
  */
  const appliedCoupon = coupon
    ? evaluateCoupon(discounts, coupon, total, kuponaTabiToplam(items))
    : null;

  /*
    KARGO: TESLİMAT ÜLKESİNE GÖRE İKİ AYRI TARİFE.

    Önceden tek yol vardı — yurt içi ücreti ve TL eşiği — ve adres
    formunda ülke alanı hiç yoktu: her sipariş Türkiye'ye gidiyor
    sayılıyordu. Yurtdışına satış açılırken bu, gerçek maliyetin onda
    biriyle sipariş geçirmek demekti.

    Hesap ArvoARC'ın sipariş fonksiyonunun aynası (lib/order-quote);
    ekranda görünen rakam tahsil edilenle aynı olmak zorunda.
  */
  const yurtDisi = !yurtIci(form.country);
  /*
    MAL BEDELİ YURTDIŞINDA KÂR PAYLI — ve ArvoARC bunu TAHSİL EDİYOR
    (migration 20261022190527). Önceden kâr payı yalnızca gösterime
    uygulanıyordu: ürün kartında 27,71 $ yazıyor, karttan 20,53 $
    karşılığı TL çekiliyordu. Buradaki TL rakamın kâr payını
    içermemesi, ödeme özetinin ArvoARC'ın tahsil ettiğinden DÜŞÜK
    görünmesi olurdu.
  */
  /*
    YURTDIŞI KARGOSU ARVOARC'TAN SORULUYOR, BURADA HESAPLANMIYOR.

    Vitrin bu ücreti kendisi hesaplıyordu ve bu, ArvoARC'ın SQL'deki
    hesabının ikiziydi. Ağırlık kademesi eklenince ikizin bedeli
    görünür oldu: sepetteki ürünlerin AĞIRLIĞI burada bilinmiyor —
    ürün kartı ve sepet kalemi ağırlık taşımıyor — yani taban ücret
    gösterilecek, ArvoARC kademeli ücreti tahsil edecekti. Müşteri
    22 $ görüp 45 $ ödeyecekti; ekranla tahsilatın ayrışması bu
    depodaki en pahalı kusur.

    Mal bedelini de yanıttan alıyoruz: kâr paylı tutarı iki yerde
    yuvarlamak kuruş farkı üretirdi. Yanıt gelmeden önce yerel
    hesaba düşülüyor (aynı kural, lib/order-quote → malBedeli) ki
    özet bir an boş kalmasın.
  */
  const [teklif, setTeklif] = useState<KargoTeklifi | null>(null);
  const [teklifYukleniyor, setTeklifYukleniyor] = useState(false);
  /* Sepetin kimliği: dizi her render'da yeni, SKU+adet aynı kalıyor. */
  const sepetAnahtari = items.map((item) => `${item.sku ?? item.slug}x${item.quantity}`).join("|");

  useEffect(() => {
    let acik = true;

    /*
      DURUM DEĞİŞİKLİKLERİ ETKİNİN GÖVDESİNDE DEĞİL, bir söz
      zincirinde: etki içinde eşzamanlı setState zincirleme render
      riski sayılıyor (lint react-hooks). Bu depoda aynı kalıp para
      birimi sağlayıcısında da böyle çözüldü.
    */
    if (yurtIci(form.country) || items.length === 0) {
      void Promise.resolve().then(() => {
        if (acik) setTeklif(null);
      });
      return () => {
        acik = false;
      };
    }

    void Promise.resolve().then(() => {
      if (acik) setTeklifYukleniyor(true);
    });

    fetch(`${ARC_URL}/api/storefront/kargo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: form.country,
        items: items.map((item) => ({ sku: item.sku ?? item.slug, quantity: item.quantity })),
      }),
    })
      .then((yanit) => yanit.json())
      .then((veri: KargoTeklifi) => {
        if (acik) setTeklif(veri);
      })
      .catch(() => {
        /* Bağlantı kurulamadıysa SIFIR KARGO GÖSTERİLMİYOR: engel
           yazılıyor ve sipariş durduruluyor. Sıfır göstermek o
           siparişin maliyetini üstlenmek olurdu. */
        if (acik) setTeklif({ engel: "kur" });
      })
      .finally(() => {
        if (acik) setTeklifYukleniyor(false);
      });
    return () => {
      acik = false;
    };
    /* eslint-disable-next-line react-hooks/exhaustive-deps -- sepet kimliği diziyi temsil ediyor */
  }, [form.country, sepetAnahtari, items.length]);

  const mal =
    teklif?.malKurus != null ? teklif.malKurus / 100 : malBedeli(total, form.country, salesRules);
  /* Engel varsa sipariş hiç geçmiyor; sebebi aşağıda yazıyor. */
  const kargoEngeli = (teklif?.engel ?? null) as "mod" | "kur" | "bolge" | null;

  // Ücretsiz kargo kuponu kargoyu sıfırlar; eşik indirim öncesi ara toplam.
  const shipping = yurtDisi
    ? (teklif?.kurus ?? 0) / 100
    : shippingFor(total, appliedCoupon?.ok === true && appliedCoupon.freeShipping, salesRules);
  const grand = mal + shipping;

  /*
    TELEFON BİÇİMİ DE ÜLKEYE GÖRE. Türkiye biçimlendirmesi baştaki
    90/0'ı atıp numarayı on haneye kesiyor: Almanya'dan +49 171 …
    yazan müşterinin numarası sessizce "+90 (171) …" oluyordu ve
    kargo firması o numaraya ulaşamıyordu.
  */
  const telefonGecerli = yurtDisi ? isValidInternationalPhone : isValidPhone;
  const telefonBicimle = yurtDisi ? formatInternationalPhone : formatPhone;

  /* Ülke seçeneği yalnızca tarife tanımlıysa açılıyor: seçilince
     "bu ülkeye gönderim yapılmıyor" diyen bir liste, olmayan
     listeden kötü. */
  /* Yurtdışında "İl" yerine "Şehir" yazıyor; eksik alan mesajı da
     ekrandaki etiketi kullanmalı, yoksa müşteri aramadığı bir alan
     adı okur. */
  const etiketi = (alan: EksikAlan) => {
    if (alan.alan === "city") return t(yurtDisi ? "sehir" : "il");
    const anahtar = EKSIK_ANAHTARI[alan.alan as keyof typeof EKSIK_ANAHTARI];
    return anahtar ? t(anahtar) : alan.mesaj;
  };

  const ulkeler = teslimatUlkeleri(bolgeler);
  const ulkeSecilebilir = salesRules.internationalEnabled && ulkeler.length > 1;

  /*
    Havale indirimi. Kartlı ödemede PayTR komisyonu var,
    havalede yok; farkın bir kısmı müşteriye veriliyor.
    ArvoARC ile aynı kural: taban yalnızca mal bedeli (kargo girmez) ve
    kuruşta yuvarlanır. Önceden kargo dahil toplamın %3'ü alınıp tam
    liraya yuvarlanıyordu. Kod indirimi burada bilerek düşülmüyor
    (aşağıdaki not); kodsuz siparişte gösterilen tutar ödenenle birebir.
  */
  /* Havale indiriminin tabanı MAL BEDELİ (kargo girmiyor); yurtdışında
     o bedel kâr paylı, yani indirim de ödenen tutara göre. */
  const availableTransferDiscount = transferDiscountFor(mal, salesRules.transferDiscountPercent);
  const transferDiscount = useTransfer ? availableTransferDiscount : 0;
  const payable = grand - transferDiscount;

  /*
    "ready" KALDIRILDI.

    Burada formun tamamlanıp tamamlanmadığını söyleyen bir bayrak
    vardı ve düğmeyi devre dışı bırakıyordu. Koşullar artık
    `lib/odeme-eksikleri`'nde ve EKSİĞİN NE OLDUĞUNU da söylüyor —
    bayrak yalnızca "hazır değil" diyebiliyordu, müşteriye hiçbir
    şey anlatmadan.
  */

  function field(key: keyof typeof form) {
    return {
      value: form[key],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setForm({ ...form, [key]: event.target.value }),
    };
  }

  /*
    SKU'SUZ KALEM DENETİMİ (17.10.2026).

    Sepet kalemi varyant SKU'su taşımıyorsa ArvoARC ürün slug'ına
    düşüyor ve siparişi stokta olan HERHANGİ bir varyanta bağlıyor
    (arc_create_order). Tek varyantlı üründe bu doğru; çok varyantlı
    üründe müşteri seçmediği tonu/bedeni alıyor.

    Karttan ekleme ve ürün sayfası artık SKU yazıyor
    (lib/varyant-ozeti.ts, components/quick-add.tsx) ama müşterinin
    TARAYICISINDA duran eski sepet düzeltmeden önce eklenmiş olabilir.
    Bu yüzden ödeme adımı son bir kez bakıyor: çok varyantlı ve
    SKU'suz kalem varsa sipariş GEÇMİYOR, müşteri ürün sayfasına
    yönlendiriliyor.
  */
  async function secimiEksikKalem() {
    const skusuzlar = items.filter((item) => !item.sku);
    for (const item of skusuzlar) {
      try {
        const yanit = await fetch(
          `/api/varyantlar?slug=${encodeURIComponent(item.slug)}`,
          { cache: "no-store" },
        );
        if (!yanit.ok) continue;
        const ozet = (await yanit.json()) as { adet: number; tek: unknown };
        /* Yalnızca tek varyantlıysa slug'a güveniyoruz. */
        if (ozet.adet !== 1) return item;
      } catch {
        /* Sorgu yapılamadıysa engellemiyoruz: ArvoARC kalemi
           yine denetliyor ve yanlış tutar oluşmuyor. */
      }
    }
    return null;
  }

  /*
    EKSİK ALANA GÖTÜRME (18.10.2026).

    "Ödemeye geç" düğmesi form tamamlanana kadar DEVRE DIŞIydı ve
    canlıda ölçüldü: boş formla basmak hiçbir şey yapmıyordu —
    hata yok, odak yok, kaydırma yok. Müşteri on iki alanı
    doldurup 2.150 piksel aşağı kaydırıyor ve karşısında gri bir
    düğme buluyordu; hangisinin eksik olduğunu söyleyen hiçbir şey
    yoktu.

    Düğme artık açık. Basınca eksik SÖYLENİYOR ve sayfadaki ilk
    eksiğe gidiliyor; `block: "center"` çünkü alanın hemen üstünde
    etiketi var ve "start" onu başlığın altına gizliyordu.
  */
  function eksigeGotur(alan: string) {
    const hedef = document.querySelector<HTMLElement>(`[data-alan="${alan}"]`);
    if (!hedef) return;
    hedef.scrollIntoView({ behavior: "smooth", block: "center" });
    /* Onaylar bir kutu, odaklanabilir değil: içindeki ilk kutucuk
       alınıyor. */
    const odaklanacak =
      hedef instanceof HTMLInputElement || hedef instanceof HTMLTextAreaElement
        ? hedef
        : hedef.querySelector<HTMLElement>("input, textarea, select");
    window.setTimeout(() => odaklanacak?.focus({ preventScroll: true }), 320);
  }

  async function submit() {
    const eksikler = eksikAlanlar(form, consents, items.length, telefonGecerli, yurtDisi);
    if (eksikler.length > 0) {
      setState("error");
      setMessage(eksikMetni(eksikler, dil, etiketi));
      eksigeGotur(eksikler[0].alan);
      return;
    }

    /*
      KARGO ENGELİ ÖDEME ADIMINDA DURDURUYOR. ArvoARC siparişi yine
      reddediyor (kural orada) ama müşteriye sebebini BURADA söylemek
      gerekiyor: ArvoARC'ın hatası "Bu ülkeye gönderim yapılmıyor"
      diye dönse de müşteri o noktada kart ekranına geçmiş oluyor.
    */
    if (kargoEngeli) {
      setState("error");
      setMessage(t(KARGO_ENGEL_ANAHTARI[kargoEngeli]));
      eksigeGotur("country");
      return;
    }

    setState("sending");
    setMessage("");

    const eksik = await secimiEksikKalem();
    if (eksik) {
      setState("error");
      setMessage(
        t("secenekEksik").replace("{urun}", eksik.name),
      );
      return;
    }

    try {
      const response = await fetch(`${ARC_URL}/api/storefront/odeme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          /* Yurt içinde +90 eklenip on haneye indiriliyor; yurtdışında
             müşterinin yazdığı ülke kodu korunuyor. */
          phone: yurtDisi ? form.phone : `+90${phoneDigits(form.phone)}`,
          address: {
            line: form.line,
            district: form.district,
            city: form.city,
            postal: form.postal,
            /* ÜLKE ARTIK FORMDAN. Burada "TR" sabitti: yurtdışı
               adresi yazan müşterinin siparişi Türkiye'ye gidiyor
               sayılıyor, yurt içi kargosu tahsil ediliyor ve LR
               ürünü engeline de takılmıyordu. */
            country: form.country,
          },
          /* Havale seçilirse sipariş ödeme beklemede oluşur. */
          paymentMethod: useTransfer ? "havale" : "kart",
          transferDiscount,
          items: items.map((item) => ({
            /*
              Varyant SKU’su varsa o gönderilir; ArvoARC siparişi
              doğru bedene bağlar. Yoksa ürün slug’ı yedek
              olarak kullanılır (tek varyantlı ürünler).
            */
            sku: item.sku ?? item.slug,
            quantity: item.quantity,
            name: item.variantLabel
              ? `${item.name} (${item.variantLabel})`
              : item.name,
          })),
          couponCode: coupon || null,
          /* Kod gidiyor, TUTAR GİTMİYOR: ne kadar düşüleceğine
             ArvoARC karar veriyor (arc_gift_card_apply). */
          giftCardCode: hediyeCeki,
          note: note || null,
          /* Sipariş durumu bildirimleri için açık onay; ArvoARC
             siparişin kaydına yazıyor ve bildirim gönderirken
             oradan okuyor. */
        }),
      });

      const data = await response.json();

      /*
        Kupon reddedilmişse müşteri bilgilendiriliyor. Sepette
        geçerliyken ödeme anında dolmuş olabilir: son kullanım
        hakkını başka bir müşteri almış olabilir.
      */
      if (data.couponRejected) {
        setState("error");
        setMessage(
          typeof data.couponRejected === "string"
            ? data.couponRejected
            : t("kuponGecersizOldu"),
        );
        return;
      }

      /*
        SAĞLAYICININ KENDİ ÖDEME SAYFASINA YÖNLENDİRME.

        PayTR çerçeve içinde açılıyor; banka/sağlayıcı sayfasına giden
        yollarda tam yönlendirme var, kart orada giriliyor. Dönüşte
        sonuç panelde doğrulanıyor (imza ya da sorgulama), yani
        buradaki adres bir şeyi KANITLAMIYOR — yalnızca müşteriyi
        ödeme sayfasına götürüyor.

        SAĞLAYICI ADINA BAKMIYORUZ. Önceki sürüm `saglayici === "tami"`
        diyordu; Tami'nin yerine Garanti geçtiğinde bu satır sessizce
        yanlış kaldı ve müşteri ödeme sayfası yerine hata mesajı
        görürdü. Artık ölçüt cevabın ŞEKLİ: adres varsa yönlendir,
        form varsa gönder.
      */
      if (!useTransfer && typeof data.odemeAdresi === "string") {
        window.location.href = data.odemeAdresi;
        return;
      }

      /*
        FORM GÖNDEREN SAĞLAYICILAR (Garanti 3D Pay Hosting). Banka
        gidilebilir bir bağlantı değil, bir POST bekliyor: alanların
        arasında imza var ve adres satırına sığdırmak onu kullanıcının
        değiştirebileceği bir yere koymak olurdu.

        Form gizli ve kendiliğinden gönderiliyor; müşteri doğrudan
        bankanın 3D ekranına düşüyor.
      */
      if (!useTransfer && data.odemeFormu?.adres && data.odemeFormu?.alanlar) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.odemeFormu.adres;
        form.style.display = "none";
        for (const [ad, deger] of Object.entries(data.odemeFormu.alanlar)) {
          const alan = document.createElement("input");
          alan.type = "hidden";
          alan.name = ad;
          alan.value = String(deger);
          form.appendChild(alan);
        }
        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (!response.ok || (!useTransfer && !data.iframeUrl)) {
        setState("error");
        setMessage(
          data.message ??
            t("odemeBaslatilamadi"),
        );
        return;
      }

      /*
        PayTR sayfasına yönlendirmek yerine çerçeve içinde
        gösteriliyor: müşteri arvoculture.com adresinde kalıyor.

        Yönlendirmede adres çubuğunda paytr.com görünüyordu;
        ödeme adımında alan adının değişmesi güven kırıcı.
      */
      /*
        Havalede PayTR sayfası açılmıyor: sipariş oluştu, müşteri
        havaleyi kendi bankasından yapacak. Onay sayfasına
        yönlendiriliyor.
      */
      if (useTransfer) {
        router.push(
          `${onek}/siparis/tamam?no=${encodeURIComponent(data.orderNumber)}&yontem=havale`,
        );
        return;
      }

      setIframeUrl(data.iframeUrl);
      setState("paying");
    } catch {
      setState("error");
      setMessage(t("baglantiKurulamadi"));
    }
  }

  if (items.length === 0) {
    return (
      <main className="shell">
        {/* Sepet sayfasının boş hâliyle aynı panel dili. Önceden
            paneli yoktu; başlık ekranın kenarına yapışıyordu. */}
        <section className="panel about-hero order-result">
          <p className="about-eyebrow">{t("odeme")}</p>
          <h1>{t("sepetBosBaslik")}</h1>
          <p className="about-lede">{t("odemeBosSepet")}</p>
          <div className="order-actions">
            <Link className="btn" href={`${onek}/koleksiyon/tumu`}>
              {t("alisverisBasla")}
            </Link>
            <Link href={`${onek}/koleksiyon/firsatlar`}>{t("indirimdekiUrunler")}</Link>
          </div>
        </section>
      </main>
    );
  }

  /*
    Ödeme adımı. PayTR çerçevesi kendi sayfamızda açılıyor;
    müşteri alan adından ayrılmıyor.

    Çerçeve yüksekliği sabit: PayTR sayfası kendi içinde kayar
    ve dinamik yükseklik için alan adları arası mesaj gerekir,
    o da güvenlik açısından gereksiz karmaşıklık.
  */
  if (state === "paying" && iframeUrl) {
    return (
      <section className="panel checkout-frame">
        <div className="head">
          <div>
            <h2>{t("odeme")}</h2>
            <p>{t("kartBilgileri")}</p>
          </div>
        </div>

        <iframe
          src={iframeUrl}
          title={t("guvenliOdeme")}
          allow="payment"
          /* PayTR 3D Secure için üst pencereye çıkabilmeli. */
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
        />

        <p className="hint">
          {t("odemeYuklenmezse")}{" "}
          <a href={iframeUrl} rel="noreferrer">
            {t("buBaglantidan")}
          </a>{" "}
          {t("devamEdebilirsiniz")}
        </p>
      </section>
    );
  }

  return (
    <main className="shell">
      {/* Sepet sayfasıyla aynı başlık: adımlar ve sayfanın adı. */}
      <section className="panel about-hero detail-hero">
        <CheckoutSteps current="teslimat" />
        <h1>{t("teslimatVeOdeme")}</h1>
      </section>

      <div className="checkout">
        <section className="panel">
          <h2>{t("teslimatBilgileri")}</h2>
          <p className="hint">{t("uyeOlmadan")}</p>

          {saved.length > 0 && (
            <div className="address-picker">
              {saved.map((address) => (
                <button
                  type="button"
                  key={address.id}
                  aria-pressed={selected === address.id}
                  onClick={() => {
                    applyAddress(address);
                    setSelected(address.id);
                  }}
                >
                  <strong>
                    {address.title}
                    {(address.tax_number ?? address.company_name) && (
                      <em> / {t("kurumsalFatura")}</em>
                    )}
                  </strong>
                  <small>
                    {address.line} · {address.district} / {address.city}
                  </small>
                </button>
              ))}
              <button
                type="button"
                aria-pressed={selected === "manual"}
                onClick={() => {
                  setSelected("manual");
                  setForm({
                    ...form,
                    city: "",
                    district: "",
                    line: "",
                    postal: "",
                  });
                }}
              >
                <strong>{t("yeniAdres")}</strong>
                <small>{t("elleGir")}</small>
              </button>
            </div>
          )}

          <div className="fields">
            <label>
              {t("adSoyad")}
              <input type="text" data-alan="name" autoComplete="name" {...field("name")} />
            </label>
            <label>
              {t("eposta")}
              <input type="email" data-alan="email" autoComplete="email" {...field("email")} />
            </label>
            <label>
              {t("telefon")}
              <input
                type="tel"
                data-alan="phone"
                autoComplete="tel"
                inputMode="tel"
                placeholder={yurtDisi ? "+49 171 1234567" : "+90 (5XX) XXX XX XX"}
                value={form.phone}
                onChange={(event) =>
                  setForm({ ...form, phone: telefonBicimle(event.target.value) })
                }
              />
              {form.phone && !telefonGecerli(form.phone) && (
                <small className="field-warn">
                  {yurtDisi
                    ? t("telefonYurtdisiUyari")
                    : t("telefonTrUyari")}
                </small>
              )}
            </label>
            <label>
              {t("postaKodu")}
              <input
                type="text"
                inputMode="numeric"
                data-alan="postal"
                autoComplete="postal-code"
                {...field("postal")}
              />
            </label>
            {ulkeSecilebilir && (
              <label>
                {t("ulke")}
                <select
                  data-alan="country"
                  autoComplete="country"
                  value={form.country}
                  onChange={(event) => {
                    const kod = event.target.value;
                    /*
                      ÜLKE DEĞİŞİNCE TELEFON YENİDEN BİÇİMLENİYOR.
                      Türkiye biçiminde yazılmış bir numara yurtdışı
                      seçilince "+90…" olarak kalıyordu ve müşteri
                      kendi numarasını yanlış sanıyordu.
                    */
                    const yabanci = !yurtIci(kod);
                    setForm((mevcut) => ({
                      ...mevcut,
                      country: kod,
                      phone: mevcut.phone
                        ? (yabanci ? formatInternationalPhone : formatPhone)(mevcut.phone)
                        : mevcut.phone,
                    }));
                  }}
                >
                  {ulkeler.map((kod) => (
                    <option key={kod} value={kod}>
                      {ulkeAdi(kod)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              {t(yurtDisi ? "sehir" : "il")}
              <input
                type="text"
                data-alan="city"
                autoComplete="address-level1"
                {...field("city")}
              />
            </label>
            <label>
              {/* Yurtdışında ilçe zorunlu değil: pek çok ülkede
                  ikinci bir idari kademe adreste yazılmıyor
                  (lib/odeme-eksikleri). */}
              {t(yurtDisi ? "eyalet" : "ilce")}
              <input
                type="text"
                data-alan="district"
                autoComplete="address-level2"
                {...field("district")}
              />
            </label>
            <label className="wide">
              {t("acikAdres")}
              <textarea
                rows={3}
                data-alan="line"
                autoComplete="street-address"
                {...field("line")}
              />
            </label>
          </div>

          <h2>{t("onaylar")}</h2>
          <div className="consents" data-alan="onaylar">
            <label>
              <input
                type="checkbox"
                checked={consents.preInfo}
                onChange={(event) =>
                  setConsents({ ...consents, preInfo: event.target.checked })
                }
              />
              <span>
                <Link href="/on-bilgilendirme-formu" target="_blank">
                  {t("onBilgilendirme")}
                </Link>
                {t("okudumOnayliyorum")}
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={consents.distance}
                onChange={(event) =>
                  setConsents({ ...consents, distance: event.target.checked })
                }
              />
              <span>
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank">
                  {t("mesafeliSatis")}
                </Link>
                {t("okudumKabul")}
              </span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={consents.privacy}
                onChange={(event) =>
                  setConsents({ ...consents, privacy: event.target.checked })
                }
              />
              <span>
                <Link href="/kvkk-aydinlatma-metni" target="_blank">
                  {t("kvkk")}
                </Link>
                {t("okudum")}
              </span>
            </label>
            {/*
              WHATSAPP İÇİN KUTUCUK YOK, BİLGİ NOTU VAR.

              Önceden burada isteğe bağlı bir onay kutusu duruyordu ve
              işaretsiz başlıyordu; sonuç olarak hiçbir siparişe
              bildirim gitmiyordu (17.10.2026, AC261017-F93525).

              Sipariş durumu bildirimi sözleşmenin İFASI, pazarlama
              değil: aynı bilgi zaten e-postayla ayrı bir onay
              istenmeden gönderiliyor. Müşteriye ikinci bir kutucuk
              işaretletmek, verdiği siparişle zaten kurduğu ilişkiyi
              yeniden imzalatmak olurdu.

              Kutucuk gitti ama SESSİZLİK DE DOĞRU DEĞİL: müşteri
              numarasının ne için kullanılacağını görmeli. Tek satır,
              işaret istemiyor.
            */}
            <p className="consent-note">{t("bildirimNotu")}</p>
          </div>
        </section>

        <aside className="panel summary">
          <h2>{t("odemeYontemi")}</h2>

          <BankTransfer
            seller={havale}
            discountPercent={salesRules.transferDiscountPercent}
            total={grand}
            discount={availableTransferDiscount}
            /* Hesap bilgisi gelmediyse havale KAPALI sayılıyor:
               ayar açık olsa da müşteriye ödeyeceği hesabı
               gösteremiyoruz. */
            transferEnabled={salesRules.transferEnabled && havale !== null}
            selected={useTransfer}
            onSelect={setUseTransfer}
          />

          {/*
            Hediye çeki ödeme yönteminin ALTINDA: çek bir ödeme
            yöntemi değil, ödenecek tutardan düşülen bir bakiye —
            müşteri yine kartla ya da havaleyle ödüyor, yalnızca
            daha azını.
          */}
          <HediyeCekiSecici
            supabaseUrl={supabaseUrl}
            supabaseKey={supabaseKey}
            araToplam={total}
            secili={hediyeCeki}
            secildi={setHediyeCeki}
          />

          <h2 style={{ marginTop: "var(--s5)" }}>{t("siparisOzeti")}</h2>

          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.slug}>
                <span>
                  {item.name} <small>× {item.quantity}</small>
                </span>
                <b>{formatPrice(item.price * item.quantity)}</b>
              </li>
            ))}
          </ul>

          <dl className="summary-totals">
            <div>
              <dt>{t("araToplam")}</dt>
              <dd>{formatPrice(mal)}</dd>
            </div>
            <div>
              <dt>{t("kargo")}</dt>
              <dd>
                {kargoEngeli
                  ? "—"
                  : yurtDisi && teklifYukleniyor
                    ? t("kontrolEdiliyor")
                    : shipping === 0
                      ? t("ucretsiz")
                      : formatPrice(shipping)}
              </dd>
            </div>
            {appliedCoupon?.ok && (
              <div>
                <dt>İndirim kodu · {coupon.trim().toUpperCase()}</dt>
                <dd>{appliedCoupon.label}</dd>
              </div>
            )}
            {transferDiscount > 0 && (
              <div>
                <dt>Havale indirimi (%{salesRules.transferDiscountPercent})</dt>
                <dd>−{formatPrice(transferDiscount)}</dd>
              </div>
            )}
            {/*
              ÇEKİN TUTARI BURADA HESAPLANMIYOR, ÜST SINIRI
              YAZILIYOR. Ne kadar düşüleceği ödenecek tutara bağlı
              ve o tutar ArvoARC'ta kesinleşiyor (kupon, kargo ve
              havale indirimi orada birleşiyor). Kesin bir rakam
              yazmak, ödenenle çelişebilirdi — kod indiriminde de
              aynı karar verilmişti.
            */}
            {hediyeCeki && (
              <div>
                <dt>Hediye çeki · {hediyeCeki}</dt>
                <dd>{t("toplamdanDusulecek")}</dd>
              </div>
            )}
            <div className="grand">
              <dt>{t("toplam")}</dt>
              <dd>{formatPrice(payable)}</dd>
            </div>
          </dl>

          {/*
            TAHSİLAT LİRA, DOLAR GÖSTERİM.

            Ödeme sağlayıcısı lira çekiyor ve sipariş lira olarak
            kaydediliyor; dolar yalnızca fiyatı anlaşılır kılmak
            için. Bunu yazmazsak kartında "₺" gören müşteri
            dolandırıldığını sanabilirdi — ekranda $ yazıp lira
            çekmek, söylenmediğinde sessiz bir sapma.
          */}
          {/*
            ÇEVRİMDE KÂR PAYI YOK: yukarıdaki TL tutar yurtdışı
            siparişinde kâr payını ZATEN içeriyor ve `dolara` ile
            çevirmek onu iki kez uygulardı. Kural tek cümle:
            gösterilen dolar = tahsil edilen TL ÷ kur.
          */}
          {paraBirimi === "USD" && dolarKarsiligi(payable, salesRules) !== null && (
            <p className="hint">
              {t("yaklasik")} {dolarYazisi(dolarKarsiligi(payable, salesRules)!)}.{" "}
              {t("tahsilatLira")}
            </p>
          )}

          {kargoEngeli && (
            <p className="field-warn" role="status">
              {t(KARGO_ENGEL_ANAHTARI[kargoEngeli])}
            </p>
          )}

          {appliedCoupon?.ok && (
            <p className="hint">{t("kodIndirimiNotu")}</p>
          )}

          {/* TL EŞİĞİ YURTDIŞINDA GEÇMİYOR: "şu kadar daha ekleyin,
              kargo ücretsiz olsun" cümlesi orada tutulamayacak bir söz
              (bkz. lib/order-quote, yurtdisiKargo). */}
          {!yurtDisi && shipping > 0 && (
            <p className="hint">
              {formatPrice(amountToFreeShipping(total, false, salesRules))} daha ekleyin, kargo
              ücretsiz olsun.
            </p>
          )}

          <button
            type="button"
            className="btn btn-block"
            /* Devre dışı DEĞİL: eksik varken de basılabiliyor ki
               müşteri neyin eksik olduğunu öğrenebilsin. Yalnızca
               gönderim sürerken kilitleniyor. */
            disabled={state === "sending"}
            aria-describedby={state === "error" ? "odeme-hatasi" : undefined}
            onClick={submit}
          >
            {state === "sending" ? t("yonlendiriliyor") : t("odemeyeGec")}
          </button>

          {state === "error" && (
            <p className="form-error" role="alert" id="odeme-hatasi">
              {message}
            </p>
          )}

          <p className="hint">
            Ödeme, 3D Secure korumalı ödeme altyapısı üzerinden alınır. Kart
            bilgileriniz bizim sunucularımıza hiçbir aşamada ulaşmaz.
          </p>
        </aside>
      </div>
    </main>
  );
}
