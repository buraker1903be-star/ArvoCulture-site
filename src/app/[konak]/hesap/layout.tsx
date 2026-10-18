import { AccountPanel } from "@/components/account-panel";
import { env } from "@/lib/env";
import { getStorefrontDiscounts } from "@/lib/discounts";
import { konagiAyarla } from "@/lib/konak";

/**
 * Hesap alanının kabuğu.
 *
 * NEDEN DÜZEN: altı bölümün her biri kendi `AccountPanel`'ini
 * çiziyordu. Bölüm değiştirmek paneli baştan kuruyor, bu da her
 * tıklamada `getSession()` + `claim_arvoculture_orders` +
 * `arc_storefront_my_orders` demekti; karşılama şeridi ve yan menü
 * de sökülüp yeniden takılıyordu. Müşterinin gördüğü şey buydu:
 * tıkla, bir şey olmasın, sonra sayfa zıplasın.
 *
 * Next düzeni alt sayfalar arasında SÖKMÜYOR. Panel artık bir kez
 * kuruluyor, geçişte yalnızca içerik sütunu değişiyor ve veriler
 * yerinde duruyor.
 */
export default async function HesapDuzeni({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ konak: string }>;
}) {
  /* Adres yoldan geliyor; her sayfa ve düzen onu veri katmanına
     kendisi bırakıyor (lib/konak). */
  konagiAyarla((await params).konak);

  /* Özet şeridindeki "Kuponlarım" sayacı. Kuponlar müşteriden
     bağımsız; tarayıcıda ikinci kez istemek aynı veriyi iki kez
     çekmek olurdu. */
  const indirimler = await getStorefrontDiscounts();

  return (
    <main className="shell">
      <AccountPanel
        supabaseUrl={env.supabaseUrl}
        supabaseKey={env.supabaseKey}
        kuponSayisi={indirimler.filter((indirim) => indirim.code).length}
      >
        {children}
      </AccountPanel>
    </main>
  );
}
