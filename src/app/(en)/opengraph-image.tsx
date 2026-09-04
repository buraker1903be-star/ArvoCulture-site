import { ImageResponse } from "next/og";
import { organization } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ArvoCulture Group";

// Kod uretimli sosyal paylasim gorseli. Tasarlanmis bir gorsel
// hazirlandiginda bu dosya kaldirilip public/opengraph-image.png kullanilabilir.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#EAE8E1",
          color: "#141A16",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", fontSize: 34, letterSpacing: -0.5 }}>
          ArvoCulture <span style={{ color: "#4A544C", marginLeft: 10 }}>Group</span>
        </div>
        <div style={{ display: "flex", fontSize: 68, lineHeight: 1.1, maxWidth: 900 }}>
          We turn scattered work into systems that run.
        </div>
        <div
          style={{
            display: "flex",
            gap: 28,
            fontSize: 24,
            color: "#4A544C",
            borderTop: "1px solid #C4C1B5",
            paddingTop: 24,
          }}
        >
          <span>Akademik Merkez</span>
          <span>Arvo</span>
          <span style={{ marginLeft: "auto" }}>{organization.address.city}</span>
        </div>
      </div>
    ),
    size,
  );
}
