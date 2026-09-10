"use client";

import { useEffect, useState } from "react";

/**
 * Çevrimdışı ekranındaki tekrar deneme düğmesi.
 *
 * İki iş yapıyor. Biri açık: düğmeye basınca sayfayı yeniden
 * yüklüyor. Diğeri daha önemli: bağlantı geri geldiğinde müşteri
 * hiçbir şeye basmadan kendiliğinden dönüyor. Uygulamalar böyle
 * davranır — kullanıcıdan "tekrar dene" beklemezler.
 */
export function OfflineRetry() {
  const [deneniyor, setDeneniyor] = useState(false);

  useEffect(() => {
    const geriDon = () => {
      setDeneniyor(true);
      window.location.reload();
    };
    window.addEventListener("online", geriDon);
    return () => window.removeEventListener("online", geriDon);
  }, []);

  return (
    <button
      type="button"
      className="button button-dark"
      onClick={() => {
        setDeneniyor(true);
        window.location.reload();
      }}
    >
      {deneniyor ? "Deneniyor…" : "Tekrar dene"}
    </button>
  );
}
