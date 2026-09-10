/**
 * Koleksiyon yükleme iskeleti.
 *
 * Gerçek sayfanın düzenini birebir taklit ediyor: aynı kabuk, aynı
 * panel, aynı ızgara. İçerik gelince yerleşim zıplamıyor.
 */
export default function Loading() {
  return (
    <main className="shell">
      <section className="panel collection-hero">
        <p className="eyebrow">ARVOCULTURE SEÇKİSİ</p>
        <div
          className="skeleton skeleton-line is-short"
          style={{ height: 28 }}
        />
        <div className="skeleton skeleton-line is-medium" />
      </section>

      <section className="panel">
        <div className="product-grid">
          {/* Ekranın ilk dolduğu kadar kart; fazlası zaten görünmüyor. */}
          {Array.from({ length: 8 }).map((_, index) => (
            <article className="card skeleton-card" key={index}>
              <span className="card-art" />
              <div className="skeleton skeleton-line is-short" />
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line is-short" />
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
