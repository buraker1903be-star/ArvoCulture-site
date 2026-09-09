"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

/**
 * İade talebi formu.
 *
 * Müşteri sipariş detayından açıyor: kalemleri seçiyor, sebep
 * yazıyor. Talep panele düşüyor ve onaylandığında PayTR iadesi
 * tetikleniyor.
 *
 * Öncesinde iade için e-posta atmak gerekiyordu; talep kayıt
 * altına alınmadığı için takibi de yoktu.
 */
const REASONS = [
  "Beden uymadı",
  "Ürün beklediğim gibi değil",
  "Ürün hatalı veya hasarlı",
  "Yanlış ürün gönderildi",
  "Fikrimi değiştirdim",
  "Diğer",
];

type Item = {
  sku: string;
  name: string;
  quantity: number;
  total: number;
};

export function ReturnRequest({
  orderNumber,
  items,
  supabaseUrl,
  supabaseKey,
}: {
  orderNumber: string;
  items: Item[];
  supabaseUrl: string;
  supabaseKey: string;
}) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<string[]>([]);
  const [reason, setReason] = useState(REASONS[0]!);
  const [note, setNote] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const toggle = (sku: string) =>
    setChosen((current) =>
      current.includes(sku)
        ? current.filter((x) => x !== sku)
        : [...current, sku],
    );

  async function submit() {
    if (chosen.length === 0) {
      setMessage("En az bir ürün seçin.");
      setState("error");
      return;
    }

    setState("sending");
    setMessage("");

    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.rpc(
        "create_arvoculture_return_request",
        {
          p_order_number: orderNumber,
          p_items: items.filter((item) => chosen.includes(item.sku)),
          p_reason: reason,
          p_note: note || null,
        },
      );

      if (error) throw error;

      setState("done");
    } catch (error) {
      setState("error");
      /* Veritabanı mesajları Türkçe yazıldı; doğrudan
         gösterilebiliyor. */
      setMessage(
        error instanceof Error
          ? error.message
          : "Talep oluşturulamadı. Lütfen tekrar deneyin.",
      );
    }
  }

  if (state === "done") {
    return (
      <div className="return-done">
        <strong>İade talebiniz alındı.</strong>
        <p>
          Talebiniz incelendikten sonra e-posta ile bilgilendirileceksiniz.
          Onaylanması hâlinde ürünü kargoya vermeniz için gereken bilgiler
          iletilecek.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="linklike"
        onClick={() => setOpen(true)}
      >
        İade talebi oluştur
      </button>
    );
  }

  return (
    <div className="return-form">
      <p className="option-label">İade edilecek ürünler</p>

      <div className="return-items">
        {items.map((item) => (
          <label key={item.sku}>
            <input
              type="checkbox"
              checked={chosen.includes(item.sku)}
              onChange={() => toggle(item.sku)}
            />
            <span>
              <b>{item.name}</b>
              <small>
                {item.quantity} adet ·{" "}
                {new Intl.NumberFormat("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                }).format(item.total / 100)}
              </small>
            </span>
          </label>
        ))}
      </div>

      <label className="option-label" htmlFor="iade-sebep">
        Sebep
      </label>
      <select
        id="iade-sebep"
        value={reason}
        onChange={(event) => setReason(event.target.value)}
      >
        {REASONS.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>

      <label className="option-label" htmlFor="iade-not">
        Eklemek istedikleriniz
      </label>
      <textarea
        id="iade-not"
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="İsteğe bağlı"
      />

      {message && (
        <p className="form-error" role="alert">
          {message}
        </p>
      )}

      <p className="hint">
        Kullanılmamış ve yeniden satılabilir durumdaki ürünler iade
        edilebilir. Ambalajı açılmış kozmetik ve kişisel bakım ürünleri
        hijyen gerekçesiyle kapsam dışındadır.
      </p>

      <div className="return-actions">
        <button
          type="button"
          className="btn"
          disabled={state === "sending"}
          onClick={submit}
        >
          {state === "sending" ? "Gönderiliyor…" : "Talebi gönder"}
        </button>
        <button
          type="button"
          className="linklike"
          onClick={() => setOpen(false)}
        >
          Vazgeç
        </button>
      </div>
    </div>
  );
}
