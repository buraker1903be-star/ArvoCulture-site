import { createElement as h } from "react";

/*
  Paylaşım kartları (1200×630): WhatsApp, Instagram, X ve arama
  sonuçlarındaki önizleme.

  Satori ile çiziliyor: yalnızca flex düzen ve satır içi stil, CSS
  dosyası ve sınıf yok. Birden fazla çocuğu olan her kutu `display:
  flex` istiyor. Renkler tokens.css ile aynı; yazılar sitenin kendi
  fontları (bkz. load.ts).

  JSX yerine createElement: modül tek başına Node'da çalıştırılıp
  görsel olarak denenebiliyor.
*/

export const OG_SIZE = { width: 1200, height: 630 };

const C = {
  ivory: "#faf8f3",
  panel: "#ffffff",
  ink: "#191b16",
  ink2: "#5c6055",
  ink3: "#6f7367",
  line: "#e5e0d5",
  gold: "#a98634",
  sale: "#a3342a",
};

const DISPLAY = "Cormorant";
const SANS = "Inter";

/* Logo 1920×231; kartta bu oranla küçültülüyor. */
function logo(src: string | null, width: number) {
  const height = Math.round((width * 231) / 1920);
  return src
    ? h("img", { src, width, height, style: { objectFit: "contain" } })
    : h(
        "div",
        {
          style: {
            display: "flex",
            fontFamily: SANS,
            fontSize: 22,
            letterSpacing: 5,
            color: C.ink,
          },
        },
        "ARVOCULTURE",
      );
}

/*
  Künye satırı: küçük, büyük harf, seyrek; yanında kısa altın çizgi.
  Büyük harfe burada çevriliyor: satori'nin `textTransform`'u Türkçe
  kuralını bilmiyor, "Giyim"i "GIYIM" yazıyordu.
*/
function eyebrow(text: string) {
  return h(
    "div",
    {
      style: {
        display: "flex",
        alignItems: "center",
        fontFamily: SANS,
        fontSize: 19,
        letterSpacing: 3.4,
        color: C.ink3,
      },
    },
    text.toLocaleUpperCase("tr-TR"),
    h("div", {
      style: { width: 64, height: 1, marginLeft: 22, background: C.gold },
    }),
  );
}

/** Varsayılan kart: ana sayfa, koleksiyonlar ve ürünü bulunamayan adres. */
export function brandCard({ logo: logoSrc }: { logo: string | null }) {
  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "70px 88px 62px",
        background: C.ivory,
      },
    },
    logo(logoSrc, 340),
    h(
      "div",
      { style: { display: "flex", flexDirection: "column" } },
      eyebrow("Giyim · Bakım · Koku"),
      h(
        "div",
        {
          style: {
            display: "flex",
            marginTop: 26,
            fontFamily: DISPLAY,
            fontSize: 112,
            lineHeight: 1.02,
            letterSpacing: -1,
            color: C.ink,
          },
        },
        "Seçtiğin şey,",
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            fontFamily: DISPLAY,
            fontSize: 112,
            lineHeight: 1.02,
            letterSpacing: -1,
            color: C.ink,
          },
        },
        "senin hikâyen.",
      ),
    ),
    h(
      "div",
      {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 26,
          borderTop: `1px solid ${C.line}`,
          fontFamily: SANS,
          fontSize: 21,
          color: C.ink2,
        },
      },
      h("div", { style: { display: "flex" } }, "Seçilmiş giyim, bakım ve koku"),
      h(
        "div",
        { style: { display: "flex", letterSpacing: 2.5, color: C.ink } },
        "arvoculture.com",
      ),
    ),
  );
}

export type ProductCardProps = {
  logo: string | null;
  /** PNG/JPEG data URI; yoksa görsel alanı boş kalır. */
  image: string | null;
  brand: string;
  name: string;
  priceText: string;
  oldPriceText?: string;
  offText?: string;
};

/* Uzun adlar küçülüyor; çok uzunsa kısaltılıyor (satori satır sınırı
   tanımıyor). */
function nameStyle(name: string) {
  if (name.length <= 38) return { fontSize: 64, text: name };
  if (name.length <= 68) return { fontSize: 54, text: name };
  const text = name.length > 110 ? `${name.slice(0, 107).trimEnd()}…` : name;
  return { fontSize: 44, text };
}

/** Ürün kartı: solda beyaz zeminde ürün, sağda künye, ad ve fiyat. */
export function productCard(p: ProductCardProps) {
  const ad = nameStyle(p.name);

  return h(
    "div",
    {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        background: C.ivory,
      },
    },
    /* Görsel: sitedeki gibi beyaz zemin, nefes alan çerçeve. */
    h(
      "div",
      {
        style: {
          width: 560,
          height: 630,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: C.panel,
          borderRight: `1px solid ${C.line}`,
        },
      },
      p.image
        ? h("img", {
            src: p.image,
            width: 480,
            height: 550,
            style: { objectFit: "contain" },
          })
        : h("div", { style: { display: "flex" } }),
    ),
    h(
      "div",
      {
        style: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 64px 56px",
        },
      },
      eyebrow(p.brand),
      h(
        "div",
        { style: { display: "flex", flexDirection: "column" } },
        h(
          "div",
          {
            style: {
              display: "flex",
              fontFamily: DISPLAY,
              fontSize: ad.fontSize,
              lineHeight: 1.08,
              color: C.ink,
            },
          },
          ad.text,
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "baseline",
              marginTop: 30,
            },
          },
          h(
            "div",
            {
              /*
                Fiyat Inter'de: Cormorant'ın eski usul rakamlarında "1"
                bir "I" gibi duruyor ve rakamlar satırdan sarkıyordu.
                Sitede `lining-nums` ile düzeltiliyor; satori bu font
                özelliğini desteklemiyor.
              */
              style: {
                display: "flex",
                fontFamily: SANS,
                fontSize: 46,
                lineHeight: 1,
                letterSpacing: -0.5,
                color: C.ink,
              },
            },
            p.priceText,
          ),
          p.oldPriceText
            ? h(
                "div",
                {
                  style: {
                    display: "flex",
                    marginLeft: 20,
                    fontFamily: SANS,
                    fontSize: 22,
                    color: C.ink3,
                    textDecoration: "line-through",
                  },
                },
                p.oldPriceText,
              )
            : null,
          p.offText
            ? h(
                "div",
                {
                  style: {
                    display: "flex",
                    marginLeft: 16,
                    fontFamily: SANS,
                    fontSize: 20,
                    letterSpacing: 1.5,
                    color: C.sale,
                  },
                },
                p.offText,
              )
            : null,
        ),
      ),
      h(
        "div",
        {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: `1px solid ${C.line}`,
          },
        },
        logo(p.logo, 230),
        h(
          "div",
          {
            style: {
              display: "flex",
              fontFamily: SANS,
              fontSize: 18,
              letterSpacing: 2,
              color: C.ink2,
            },
          },
          "arvoculture.com",
        ),
      ),
    ),
  );
}
