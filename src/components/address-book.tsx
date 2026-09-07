"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

export type Address = {
  id: string;
  title: string;
  full_name: string;
  phone: string;
  city: string;
  district: string;
  postal_code: string | null;
  line: string;
  company_name: string | null;
  tax_office: string | null;
  tax_number: string | null;
  is_billing: boolean;
  is_shipping: boolean;
  is_default: boolean;
};

/*
  Hazır etiketler. Müşterilerin ezici çoğunluğu bu ikisini
  kullanıyor; yazmak yerine seçmek hem hızlı hem de adres
  listesinde tutarlı görünüyor. Serbest yazım da açık kalıyor.
*/
const TITLE_PRESETS = ["Ev", "İş"];

/** Kurumsal fatura, vergi numarasının varlığından anlaşılır. */
function isCorporate(address: {
  tax_number: string | null;
  company_name: string | null;
}) {
  return Boolean(
    (address.tax_number ?? "").trim() || (address.company_name ?? "").trim(),
  );
}

const EMPTY = {
  title: "",
  full_name: "",
  phone: "",
  city: "",
  district: "",
  postal_code: "",
  line: "",
  company_name: "",
  tax_office: "",
  tax_number: "",
  is_billing: true,
  is_shipping: true,
  is_default: false,
};

/**
 * Adres defteri.
 *
 * Bir adres aynı anda hem fatura hem teslimat adresi olabilir —
 * Türkiye'de en sık durum bu. İki ayrı liste tutmak yerine
 * kayıtta iki bayrak var; müşteri ikisini de işaretleyip tek
 * adres girebiliyor.
 *
 * Kurumsal fatura alanları yalnızca "fatura adresi" işaretliyken
 * görünür; bireysel alıcıyı gereksiz alanlarla yormaz.
 */
export function AddressBook({ supabase }: { supabase: SupabaseClient }) {
  const [items, setItems] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    /*
      Geçmiş siparişlerden aktarılan adresler burada belirir.
      Sahiplenme fonksiyonu mükerrer kayıt oluşturmaz, o yüzden
      her yüklemede güvenle çağrılabilir.
    */
    await supabase.rpc("claim_arvoculture_orders");

    const { data, error: loadError } = await supabase
      .from("arc_customer_addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });

    if (loadError) {
      console.error(loadError);
      setItems([]);
      return;
    }
    setItems((data as Address[]) ?? []);
  }, [supabase]);

  useEffect(() => {
    // load eşzamansızdır; durum güncellemesi ağ isteği döndükten
    // sonra olur. Kural bunu ayırt edemiyor.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  function startNew() {
    setForm({ ...EMPTY });
    setEditing("new");
    setError(null);
  }

  function startEdit(address: Address) {
    setForm({
      title: address.title,
      full_name: address.full_name,
      phone: address.phone,
      city: address.city,
      district: address.district,
      postal_code: address.postal_code ?? "",
      line: address.line,
      company_name: address.company_name ?? "",
      tax_office: address.tax_office ?? "",
      tax_number: address.tax_number ?? "",
      is_billing: address.is_billing,
      is_shipping: address.is_shipping,
      is_default: address.is_default,
    });
    setEditing(address.id);
    setError(null);
  }

  async function save() {
    if (
      !form.title.trim() ||
      !form.full_name.trim() ||
      form.phone.replace(/\D/g, "").length < 10 ||
      !form.city.trim() ||
      !form.district.trim() ||
      form.line.trim().length < 8
    ) {
      setError("Zorunlu alanları eksiksiz doldurun.");
      return;
    }

    setBusy(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      district: form.district.trim(),
      postal_code: form.postal_code.trim() || null,
      line: form.line.trim(),
      company_name: form.company_name.trim() || null,
      tax_office: form.tax_office.trim() || null,
      tax_number: form.tax_number.trim() || null,
      is_billing: form.is_billing,
      is_shipping: form.is_shipping,
      is_default: form.is_default,
    };

    const { error: saveError } =
      editing === "new"
        ? await supabase.from("arc_customer_addresses").insert(payload)
        : await supabase
            .from("arc_customer_addresses")
            .update(payload)
            .eq("id", editing);

    setBusy(false);

    if (saveError) {
      console.error(saveError);
      setError("Adres kaydedilemedi. Lütfen tekrar deneyin.");
      return;
    }

    setEditing(null);
    await load();
  }

  async function remove(id: string) {
    if (!window.confirm("Bu adresi silmek istediğinize emin misiniz?")) return;

    const { error: deleteError } = await supabase
      .from("arc_customer_addresses")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error(deleteError);
      return;
    }
    await load();
  }

  function field(key: keyof typeof form) {
    return {
      value: String(form[key]),
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => setForm({ ...form, [key]: event.target.value }),
    };
  }

  function toggle(key: "is_billing" | "is_shipping" | "is_default") {
    return {
      checked: form[key],
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        setForm({ ...form, [key]: event.target.checked }),
    };
  }

  return (
    <section className="panel">
      <div className="head">
        <div>
          <h2>Adreslerim</h2>
          <p>Teslimat ve fatura adreslerinizi buradan yönetin.</p>
        </div>
        {editing === null && (
          <button type="button" className="linklike" onClick={startNew}>
            Yeni adres ekle
          </button>
        )}
      </div>

      {items === null && <p className="hint">Yükleniyor…</p>}

      {items?.length === 0 && editing === null && (
        <p className="hint">
          Henüz kayıtlı adresiniz yok. Ödeme adımını hızlandırmak için bir
          adres ekleyin.
        </p>
      )}

      {items && items.length > 0 && editing === null && (
        <ul className="address-list">
          {items.map((address) => (
            <li key={address.id}>
              <div className="address-head">
                <strong>
                  {address.title}
                  {isCorporate(address) && (
                    <em> / Kurumsal fatura</em>
                  )}
                </strong>
                {address.is_default && (
                  <span className="tag tag-soft">Varsayılan</span>
                )}
                {address.is_shipping && (
                  <span className="tag tag-soft">Teslimat</span>
                )}
                {address.is_billing && (
                  <span className="tag tag-soft">Fatura</span>
                )}
              </div>

              <p className="address-body">
                {address.full_name} · {address.phone}
                <br />
                {address.line}
                <br />
                {address.district} / {address.city}
                {address.postal_code ? ` · ${address.postal_code}` : ""}
                {address.company_name && (
                  <>
                    <br />
                    {address.company_name}
                    {address.tax_office ? ` · ${address.tax_office}` : ""}
                    {address.tax_number ? ` · ${address.tax_number}` : ""}
                  </>
                )}
              </p>

              <div className="address-actions">
                <button
                  type="button"
                  className="linklike"
                  onClick={() => startEdit(address)}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="linklike danger"
                  onClick={() => remove(address.id)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing !== null && (
        <div className="address-form">
          <div className="fields">
            <label className="wide">
              Adres başlığı
              <input
                type="text"
                placeholder="Ev, İş, Yazlık…"
                {...field("title")}
              />
              <span className="title-presets">
                {TITLE_PRESETS.map((preset) => (
                  <button
                    type="button"
                    key={preset}
                    aria-pressed={form.title === preset}
                    onClick={() => setForm({ ...form, title: preset })}
                  >
                    {preset}
                  </button>
                ))}
              </span>
            </label>
            <label>
              Ad soyad
              <input type="text" autoComplete="name" {...field("full_name")} />
            </label>
            <label>
              Telefon
              <input type="tel" autoComplete="tel" {...field("phone")} />
            </label>
            <label>
              Posta kodu
              <input type="text" inputMode="numeric" {...field("postal_code")} />
            </label>
            <label>
              İl
              <input type="text" {...field("city")} />
            </label>
            <label>
              İlçe
              <input type="text" {...field("district")} />
            </label>
            <label className="wide">
              Açık adres
              <textarea rows={3} {...field("line")} />
            </label>
          </div>

          <div className="consents">
            <label>
              <input type="checkbox" {...toggle("is_shipping")} />
              <span>Teslimat adresi olarak kullan</span>
            </label>
            <label>
              <input type="checkbox" {...toggle("is_billing")} />
              <span>Fatura adresi olarak kullan</span>
            </label>
            <label>
              <input type="checkbox" {...toggle("is_default")} />
              <span>Varsayılan adresim olsun</span>
            </label>
          </div>

          {/* Kurumsal alanlar yalnızca fatura adresinde görünür. */}
          {form.is_billing && (
            <>
              <p className="hint" style={{ marginTop: "var(--s5)" }}>
                Kurumsal fatura istiyorsanız aşağıyı doldurun. Bireysel
                faturada boş bırakın.
              </p>
              <div className="fields">
                <label className="wide">
                  Firma unvanı
                  <input type="text" {...field("company_name")} />
                </label>
                <label>
                  Vergi dairesi
                  <input type="text" {...field("tax_office")} />
                </label>
                <label>
                  Vergi / TC kimlik no
                  <input
                    type="text"
                    inputMode="numeric"
                    {...field("tax_number")}
                  />
                </label>
              </div>
            </>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="address-actions">
            <button
              type="button"
              className="btn"
              disabled={busy}
              onClick={save}
            >
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              type="button"
              className="linklike"
              onClick={() => setEditing(null)}
            >
              Vazgeç
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
