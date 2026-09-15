/**
 * Ürün sayfası yükleme iskeleti.
 *
 * Solda görsel alanı, sağda başlık ve fiyat bloğu — gerçek
 * sayfanın iki sütunlu düzeniyle aynı oranlarda. Köşeler ve
 * parıltı CSS'ten geliyor (components.css, "Yükleme iskeleti");
 * satır içinde 10px ve hap (999px) köşe vardı.
 */
export default function Loading() {
  return (
    <main className="shell">
      <section className="panel pdp">
        <div className="pdp-media">
          <div
            className="skeleton"
            style={{ width: "100%", aspectRatio: "1 / 1" }}
          />
        </div>

        <div className="pdp-info">
          <div className="skeleton skeleton-line is-short" />
          <div
            className="skeleton skeleton-line"
            style={{ height: 26, marginTop: 16 }}
          />
          <div className="skeleton skeleton-line is-medium" />
          <div
            className="skeleton skeleton-line is-short"
            style={{ height: 20, marginTop: 24 }}
          />
          <div
            className="skeleton"
            style={{ height: 48, marginTop: 28 }}
          />
        </div>
      </section>
    </main>
  );
}
