export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="shell opening">
        <h1>{title}</h1>
        <p className="register-meta">Son güncelleme: {updated}</p>
        <p className="form-note">
          Bu metin taslaktır. Yayına alınmadan önce hukuk danışmanı
          tarafından incelenmeli ve şirketin fiili veri işleme
          faaliyetleriyle birebir örtüştüğü doğrulanmalıdır.
        </p>
      </section>
      <section className="band">
        <div className="shell legal">{children}</div>
      </section>
    </>
  );
}

export function Clause({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section className="clause">
      <h2>{heading}</h2>
      {children}
    </section>
  );
}
