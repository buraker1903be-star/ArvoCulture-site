"use client";

import { useState } from "react";
import type { Locale } from "@/lib/site";
import { t } from "@/lib/dictionary";

type State = "idle" | "sending" | "sent" | "error" | "invalid";

export function ContactForm({ locale }: { locale: Locale }) {
  const copy = t(locale).contact.form;
  const [state, setState] = useState<State>("idle");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
      // Bot tuzagi: gercek kullanici bu alani gormez ve doldurmaz.
      company: String(data.get("company") ?? ""),
      locale,
    };

    if (!payload.name || !payload.email || !payload.message) {
      setState("invalid");
      return;
    }

    setState("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setState(response.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <p className="form-note" role="status">
        {copy.sent}
      </p>
    );
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <label>
        {copy.name}
        <input name="name" type="text" autoComplete="name" required />
      </label>
      <label>
        {copy.email}
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        {copy.message}
        <textarea name="message" rows={5} required />
      </label>

      <div className="trap" aria-hidden="true">
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <p className="form-consent">{copy.consent}</p>

      <button className="action" type="submit" disabled={state === "sending"}>
        {state === "sending" ? copy.sending : copy.submit}
      </button>

      {state === "invalid" && (
        <p className="form-note" role="alert">
          {copy.required}
        </p>
      )}
      {state === "error" && (
        <p className="form-note" role="alert">
          {copy.error}
        </p>
      )}
    </form>
  );
}
