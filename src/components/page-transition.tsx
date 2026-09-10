"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Sayfalar arası geçiş.
 *
 * Sitede kartın, çekmecenin, menünün kendi hareketi vardı ama
 * sayfadan sayfaya geçiş sertti: bir içerik gidiyor, yerine
 * bir başkası aniden beliriyordu. Uygulamalarda bu geçiş hiçbir
 * zaman sert değildir; onları "akıcı" yapan büyük ölçüde bu
 * yarım saniyelik ara.
 *
 * Yol değiştiğinde `key` değişiyor, React içeriği yeniden
 * kuruyor ve CSS animasyonu baştan çalışıyor.
 *
 * İki şeye dikkat edildi:
 *
 *   1. Adres çubuğundaki sorgu (?beden=L, ?sayfa=2) yolu
 *      değiştirmiyor — `usePathname` onu içermiyor. Yani filtre
 *      seçen müşteri her tıklamada sayfanın yeniden belirmesiyle
 *      uğraşmıyor; hareket yalnızca gerçek sayfa geçişinde var.
 *   2. İlk açılışta animasyon yok. Animasyon `data-hydrated`
 *      işaretine bağlı ve o işaret ancak sayfa canlandıktan sonra
 *      konuyor. Aksi hâlde siteye ilk giren müşteri, içeriği
 *      görmek için animasyonun bitmesini beklerdi — açılış
 *      hızını süs uğruna feda etmek olurdu.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="page-transition">
      {children}
    </div>
  );
}
