import { NextResponse } from "next/server";
import { organization } from "@/lib/site";

export const runtime = "nodejs";

const MAX = { name: 120, email: 200, message: 4000 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Basit istek sinirlama. Serverless'ta her ornek kendi belleğini tutar,
 * yani bu tam bir koruma degil — kotuye kullanim gorulurse Upstash Redis
 * gibi paylasimli bir sayaca tasinmalidir.
 */
const hits = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const LIMIT = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();
  const trap = String(body.company ?? "");

  // Tuzak alan doluysa bot kabul edip sessizce basarili donuyoruz.
  if (trap) return NextResponse.json({ ok: true });

  if (
    !name ||
    !email ||
    !message ||
    name.length > MAX.name ||
    email.length > MAX.email ||
    message.length > MAX.message ||
    !EMAIL.test(email)
  ) {
    return NextResponse.json({ error: "invalid" }, { status: 422 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL ?? organization.email;

  if (!apiKey) {
    // Anahtar yoksa sessizce basarili donmuyoruz; mesaj kaybolursa
    // kullanici bunu bilmeli.
    console.error("RESEND_API_KEY tanımlı değil, iletişim formu devre dışı.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ArvoCulture Group <site@arvoculture.com>",
      to: [to],
      reply_to: email,
      subject: `Site iletişim formu — ${name}`,
      text: `Ad: ${name}\nE-posta: ${email}\n\n${message}`,
    }),
  });

  if (!response.ok) {
    console.error("Resend hatası:", response.status, await response.text());
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
