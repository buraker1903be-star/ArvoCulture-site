/**
 * Sepete ekleme animasyonu.
 *
 * Ürün görselinin bir kopyası karttan başlığın sepet ikonuna uçar.
 * Amaç geri bildirim: müşteri eklemenin gerçekleştiğini ve ürünün
 * nereye gittiğini görüyor. Buton yazısının "Sepete eklendi" olması
 * tek başına gözden kaçıyordu.
 *
 * DOM’a doğrudan yazılır; React durumu tutmaya değmeyecek kadar
 * kısa ömürlü bir efekt.
 */
export function flyToCart(origin: HTMLElement | null, image?: string) {
  if (typeof window === "undefined" || !origin || !image) return;

  // Hareket tercihine saygı: baş dönmesi yaşayan kullanıcılar var.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const target = document.querySelector(".cart-link");
  if (!target) return;

  const from = origin.getBoundingClientRect();
  const to = target.getBoundingClientRect();

  const ghost = document.createElement("img");
  ghost.src = image;
  ghost.alt = "";
  ghost.className = "fly-ghost";
  ghost.style.left = `${from.left + from.width / 2 - 32}px`;
  ghost.style.top = `${from.top - 72}px`;

  document.body.appendChild(ghost);

  const dx = to.left + to.width / 2 - (from.left + from.width / 2);
  const dy = to.top + to.height / 2 - (from.top - 72 + 32);

  const flight = ghost.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      {
        transform: `translate(${dx * 0.55}px, ${dy * 0.3 - 60}px) scale(0.75)`,
        opacity: 0.95,
        offset: 0.55,
      },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.16)`,
        opacity: 0.2,
      },
    ],
    { duration: 700, easing: "cubic-bezier(0.4, 0, 0.25, 1)" },
  );

  flight.onfinish = () => {
    ghost.remove();
    // Sepet ikonu kısa bir nabız atarak varışı onaylar.
    target.classList.add("cart-pulse");
    setTimeout(() => target.classList.remove("cart-pulse"), 420);
  };
}
