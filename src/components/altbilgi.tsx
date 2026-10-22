"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { StoreLogo } from "@/components/store-logo";
import { dilOneki, yoldanDil } from "@/lib/dil-onek";
import { ceviri, type SozlukAnahtari } from "@/lib/sozluk";

/*
  ALTBİLGİ — DÜZENDEN AYRILDI (22.10.2026).

  Önceden `app/[konak]/layout.tsx` içinde, bir SUNUCU bileşeninin
  gövdesinde duruyordu. Sunucu bileşeni yolu göremiyor, yani dili de
  bilemiyor: İngilizce sayfalarda altbilginin tamamı Türkçe kalıyordu
  ("Müşteri Hizmetleri", "Teslimat Politikası", "Tüm hakları
  saklıdır"). Sayfa gövdesi İngilizceyken çerçevenin Türkçe kalması,
  çevirinin yarıda kaldığını söylüyor.

  Başlıkla AYNI KALIP: istemci bileşeni, dili yoldan çözüyor
  (lib/dil-onek). Veri yine sunucudan prop olarak geliyor — altbilgi
  mağaza kimliğini ve temayı kendisi OKUMUYOR, çünkü okusaydı
  tarayıcıya satıcı sorgusu taşınırdı.

  BAĞLANTILARIN BİR KISMI ÖNEK ALIYOR, BİR KISMI ALMIYOR ve bu
  bilinçli: hakkımızda/iletişim/SSS/teslimat/iade sayfalarının
  İngilizcesi var, sözleşmelerin yok. Var olmayan bir /en adresine
  bağlamak müşteriyi 404'e atardı.
*/

export type AltbilgiTemasi = {
  logo_url?: string | null;
  store_name?: string | null;
  footer_tagline?: string | null;
  instagram_url?: string | null;
};

export type AltbilgiKimligi = {
  phone?: string | null;
  phoneLink?: string | null;
  email?: string | null;
};

export function Altbilgi({
  theme,
  kimlik,
}: {
  theme: AltbilgiTemasi;
  kimlik: AltbilgiKimligi;
}) {
  const dil = yoldanDil(usePathname());
  const onek = dilOneki(dil);
  const t = (anahtar: SozlukAnahtari) => ceviri(anahtar, dil);

  return (
          <footer className="site-footer">
            <div className="footer-top">
              <div className="footer-brand">
                <StoreLogo
                  className="footer-logo"
                  logoUrl={theme.logo_url ?? undefined}
                  storeName={theme.store_name ?? "Mağaza"}
                />
                <p>{theme.footer_tagline}</p>

                {/*
                  İLETİŞİM ALTBİLGİDE.

                  Altbilgide mağazaya ulaşmanın hiçbir yolu yoktu;
                  "İletişim" bağlantısı vardı ama bir tık daha
                  uzaktaydı. Numara ve e-posta SATICI KAYDINDAN
                  geliyor (getStoreIdentity) — sayfaya yazılmıyor,
                  yoksa ikinci bir kiracının altbilgisinde
                  ArvoCulture'ın hattı görünürdü. Alan boşsa satır
                  hiç çizilmiyor.
                */}
                {(kimlik.phone || kimlik.email) && (
                  <p className="footer-contact">
                    {/*
                      Numara WHATSAPP'a bağlı (kimlik.phoneLink).
                      `tel:` masaüstünde çoğu tarayıcıda hiçbir
                      şey yapmıyordu; mağazanın hattı zaten
                      WhatsApp hattı ve sohbet, müşterinin sipariş
                      numarasını yazabildiği, yanıtın kayda
                      geçtiği tek kanal. WhatsApp numarası
                      tanımlı değilse bağlantı yine `tel:`.
                    */}
                    {kimlik.phone && kimlik.phoneLink && (
                      <a
                        href={kimlik.phoneLink}
                        {...(kimlik.phoneLink.startsWith("http")
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {kimlik.phone}
                      </a>
                    )}
                    {kimlik.email && (
                      <a href={`mailto:${kimlik.email}`}>{kimlik.email}</a>
                    )}
                  </p>
                )}

                {/*
                Güven rozetleri. Logo dosyaları public/ altına
                eklenmelidir; yoksa yalnızca metin görünür ve
                sayfa bozulmaz.
              */}
                <div className="footer-badges">
                  <span className="badge-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/rozet/etbis.png"
                      loading="lazy"
                      decoding="async"
                      alt=""
                      width={34}
                      height={34}
                    />
                    <small>
                      {t("etbisKayit")}
                      <br />
                      {t("etbisAciklama")}
                    </small>
                  </span>
                  <span className="badge-card">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/rozet/lr.png"
                      loading="lazy"
                      decoding="async"
                      alt=""
                      width={34}
                      height={34}
                    />
                    <small>
                      LR Health &amp; Beauty
                      <br />
                      {t("lrIsOrtagi")}
                    </small>
                  </span>
                </div>
              </div>

              <div className="footer-links">
                <div className="footer-link-group">
                  {/* Mağazanın kendi adı: sabit marka, çok mağazalı
                      vitrinde başka bir mağazanın altbilgisine
                      ArvoCulture yazıyordu. */}
                  <strong>{theme.store_name ?? "Mağaza"}</strong>
                  <Link href={`${onek}/hakkimizda`}>{t("hakkimizdaBag")}</Link>
                  <Link href={`${onek}/iletisim`}>{t("iletisimBag")}</Link>
                  <Link href={`${onek}/sss`}>{t("sssBag")}</Link>
                  {theme.instagram_url && (
                    <a href={theme.instagram_url}>Instagram</a>
                  )}
                </div>
                <div className="footer-link-group">
                  <strong>{t("musteriHizmetleri")}</strong>
                  <Link href={`${onek}/teslimat`}>{t("teslimatPolitikasi")}</Link>
                  <Link href={`${onek}/iptal-iade`}>{t("iptalIadeBag")}</Link>
                  <Link href="/on-bilgilendirme-formu">{t("onBilgilendirme")}</Link>
                  <Link href="/mesafeli-satis-sozlesmesi">{t("mesafeliSatis")}</Link>
                </div>
                <div className="footer-link-group">
                  <strong>{t("yasalBaslik")}</strong>
                  <Link href="/kvkk-aydinlatma-metni">{t("kvkk")}</Link>
                  <Link href="/gizlilik">{t("gizlilikCerez")}</Link>
                  <Link href="/uyelik-sozlesmesi">{t("uyelikSozlesmesi")}</Link>
                  <Link href="/kullanim-kosullari">{t("kullanimKosullari")}</Link>
                  <Link href="/yasal-bildirim">{t("yasalBildirim")}</Link>
                  <Link href="/ticari-elektronik-ileti">{t("ticariIleti")}</Link>
                  {/* Silme talebinin yolu altbilgiden de görünür:
                      KVKK metninde hak yazıyordu ama başvurunun
                      nasıl yapılacağı hiçbir yerde yoktu. Sosyal
                      giriş sağlayıcıları da bu adresi denetliyor. */}
                  <Link href="/veri-silme">{t("veriSilme")}</Link>
                {dil === "en" && (
                  <small className="footer-belge-dili">{t("yasalBelgeDili")}</small>
                )}
                </div>
              </div>
            </div>

            {/*
            Sağlayıcı logosu YOK. Önceden PayTR'ın resmi logo bandı
            duruyordu; ödeme sağlayıcısı artık siparişe göre
            seçiliyor (checkout-form.tsx), yani alt bilgide tek bir
            sağlayıcının markasını göstermek yanıltıcı. Kart markası
            logoları tescilli olduğu için hâlâ elle çizilmiyor,
            resmi dosyalardan geliyor; dosya yoksa sayfa bozulmaz.
          */}
            {/* Alt bilgi görselleri ekranın dışında: sayfa açılırken
                CSS ve ürün görseliyle bant genişliği paylaşmasınlar. */}
            <div className="footer-pay">
              <div className="pay-provider">
                <small>
                  {t("odemeGuvenligi")}
                </small>
              </div>

              <ul className="pay-cards" aria-label={t("kabulEdilenKartlar")}>
                {[
                  { file: "visa", label: "Visa" },
                  { file: "mastercard", label: "Mastercard" },
                  { file: "troy", label: "Troy" },
                  { file: "maestro", label: "Maestro" },
                  { file: "americanexpress", label: "American Express" },
                ].map((card) => (
                  <li key={card.file}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/rozet/${card.file}.png`}
                      alt={card.label}
                      loading="lazy"
                      decoding="async"
                    />
                  </li>
                ))}
              </ul>
            </div>

            {/*
              KAPANIŞ İMZASI.

              Altbilginin en altında, mağazanın adı çok büyük ve
              çok soluk. Hiçbir bilgi taşımıyor — süs değil,
              NOKTA: sayfanın bittiğini söyleyen şey. Altbilgi
              bunsuz bir bağlantı listesi gibi bitiyordu.

              Ekran okuyucudan gizli; ad zaten logoda ve telif
              satırında var, üçüncü kez okunması gerekmiyor.
            */}
            <span className="footer-mark" aria-hidden="true">
              {/*
                İmza MAĞAZANIN LOGOSU, adı değil: düz sansla
                yazılmış bir ad, markanın kendi harf biçimini
                taşımıyordu — ArvoCulture'ın wordmark'ında "ARVO"
                kalın, "CULTURE" ince ve italik, ve imzanın
                tamamı o ayrımdan doğuyor.

                StoreLogo logosu olmayan kiracıda mağaza ADINA
                düşüyor; yani ikinci bir mağaza logosuz da olsa
                imza çiziliyor ve kimsenin logosu başkasının
                altbilgisinde görünmüyor.
              */}
              <StoreLogo
                logoUrl={theme.logo_url ?? undefined}
                storeName={theme.store_name ?? "Mağaza"}
              />
            </span>

            <div className="footer-legal">
              <small>
                © 2026 {theme.store_name ?? "Mağaza"}. {t("tumHaklariSakli")}
              </small>
              {/* Grup künyesi yalnızca ArvoCulture'ın kendi
                  mağazasında: başka bir kiracının altbilgisinde
                  yabancı bir grup adı görünmemeli. */}
              {theme.store_name === "ArvoCulture" && (
                <small>{t("grupKunyesi")}</small>
              )}

              {/*
                Tasarım künyesi. Logo dosyası kaynağındaki
                1920×1080’lik tuvalden içerik sınırına kırpıldı;
                olduğu gibi kullanılsaydı altında ve üstünde
                312’şer piksel boşlukla gelirdi.

                Dış siteye açıldığı için rel="noreferrer" var;
                künye bağlantısının referrer taşımasına gerek yok.
              */}
              <a
                className="footer-credit"
                href="https://arvo-os.com"
                target="_blank"
                rel="noreferrer"
              >
                <span>Design by</span>
                <Image
                  src="/arvoos-logo.png"
                  alt="ARVOOS"
                  width={232}
                  height={44}
                />
              </a>
            </div>
          </footer>
  );
}
