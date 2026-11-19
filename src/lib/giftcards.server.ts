/* Kinkekaartide loogika (ainult server). Salvestus, makse, e-kirjad ja PDF on süstitavad (Deps),
   et kogu voogu saaks testida ilma andmebaasi, Stripe'i ja MailerSendita (vt tests/giftcards.test.ts).
   Tootmises: Supabase (service role), Stripe Checkout (REST API), MailerSend. */
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import {
  COMPANY,
  RESERVE_MINUTES,
  TOTAL_STOCK,
  DOWNLOAD_LINK_DAYS,
  PRINT_FEE,
  SHIPPING_TEXT,
  VALIDITY_MONTHS,
  designById,
  fmtDate,
  validUntilFrom,
} from "@/lib/giftcards.config";

/* ---------- tüübid ---------- */

export type Address = { name: string; street: string; city: string; zip: string };

export type OrderInput = {
  design: string;
  amount: number;
  recipient: string;
  delivery: "digital" | "print";
  address?: Address | undefined;
  envelope: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
};

export type Order = OrderInput & { id: string; printFee: number; total: number; sessionId: string | null };

export type CardStatus = "aktiivne" | "kasutatud" | "aegunud" | "tühistatud";
export type Card = {
  nr: string;
  amount: number;
  design: string;
  recipient: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  delivery: "digital" | "print";
  address: Address | null;
  envelope: string;
  printFee: number;
  provider: string;
  paymentId: string | null;
  orderId: string | null;
  paidAt: string | null;
  issuedAt: string;
  validUntil: string; // AAAA-KK-PP
  status: CardStatus;
  printStatus: "ootab_printimist" | "postitatud" | null;
  usedAt: string | null;
  notes: string;
};

export interface Store {
  insertOrder(o: Omit<Order, "id" | "sessionId">): Promise<string>;
  setOrderSession(id: string, sessionId: string): Promise<void>;
  getOrder(id: string): Promise<Order | null>;
  getOrderBySession(sessionId: string): Promise<Order | null>;
  getCard(nr: string): Promise<Card | null>;
  getCardByPayment(paymentId: string): Promise<Card | null>;
  /** Lisab kaardi. Tagastab "duplicate_payment", kui sama makse ID-ga kaart on juba olemas. */
  insertCard(c: Card): Promise<"ok" | "duplicate_payment" | "duplicate_number">;
  updateCard(nr: string, patch: Partial<Card>): Promise<Card | null>;
  listCards(filter: { printQueue?: boolean; limit: number }): Promise<Card[]>;
  /** Väljastatud (tühistamata) kaartide arv kokku. */
  countIssued(): Promise<number>;
  /** Pooleli maksete arv (tellimus loodud pärast sinceIso ja kaarti pole veel). */
  countReserved(sinceIso: string): Promise<number>;
  expire(todayIso: string): Promise<void>;
}

export type Mail = {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: { filename: string; content: Uint8Array }[];
};
export type Mailer = (m: Mail) => Promise<void>;

export type Checkout = {
  createSession(a: {
    orderId: string;
    lines: { name: string; cents: number }[];
    email: string;
    successUrl: string;
    cancelUrl: string;
    expiresAt: number; // unix sekundites
    kind?: string; // "product" e-poe tellimusel; puudub = kinkekaart
  }): Promise<{ id: string; url: string }>;
};

export type PdfRenderer = (card: Card, opts: { bleed: boolean }) => Promise<Uint8Array<ArrayBuffer>>;

export type Deps = {
  store: Store;
  mail: Mailer;
  checkout: Checkout;
  pdf: PdfRenderer;
  now: () => number;
  siteUrl: string;
  ownerEmail: string;
  secret: string;
};

/* ---------- abifunktsioonid ---------- */

const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 märki, seega bait & 31 on ühtlase jaotusega

/** Kaardi number SQ-AAKK-XXXX (krüptograafiliselt juhuslik osa). */
export function newCardNumber(now: number) {
  const d = new Date(now);
  const ym = d.toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" }).slice(2, 7).replace("-", "");
  const r = [...randomBytes(4)].map((b) => ABC[b & 31]).join("");
  return `SQ-${ym}-${r}`;
}

export const CARD_NR_RE = /^SQ-\d{4}-[A-HJ-NP-Z2-9]{4}$/;

const today = (now: number) => new Date(now).toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" });

export function hmac(secret: string, msg: string) {
  return createHmac("sha256", secret).update(msg).digest("base64url");
}
export function safeEqual(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Allkirjastatud ja aeguv PDF-i allalaadimislink. */
export function signedPdfUrl(d: Pick<Deps, "secret" | "siteUrl" | "now">, nr: string, days = DOWNLOAD_LINK_DAYS) {
  const exp = Math.floor(d.now() / 1000) + days * 86400;
  const sig = hmac(d.secret, `pdf.${nr}.${exp}`);
  return `${d.siteUrl}/api/kinkekaart/pdf?nr=${encodeURIComponent(nr)}&exp=${exp}&sig=${sig}`;
}
export function verifyPdfSig(d: Pick<Deps, "secret" | "now">, nr: string, exp: number, sig: string) {
  if (!Number.isFinite(exp) || exp * 1000 < d.now()) return false;
  return safeEqual(sig, hmac(d.secret, `pdf.${nr}.${exp}`));
}

/** Halduse sessiooniküpsis: aegumisaeg + allkiri. */
export const ADMIN_COOKIE = "sc_haldus";
export const ADMIN_HOURS = 12;
export function adminToken(d: Pick<Deps, "secret" | "now">) {
  const exp = Math.floor(d.now() / 1000) + ADMIN_HOURS * 3600;
  return `${exp}.${hmac(d.secret, `admin.${exp}`)}`;
}
export function verifyAdminToken(d: Pick<Deps, "secret" | "now">, token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) * 1000 < d.now()) return false;
  return safeEqual(sig, hmac(d.secret, `admin.${exp}`));
}
export function checkPassword(given: string, expected: string) {
  return expected.length >= 12 && safeEqual(hmac("pw", given), hmac("pw", expected));
}

/** Stripe'i webhooki allkirja kontroll (Stripe-Signature päis, HMAC-SHA256, 5 min tolerants). */
export function verifyStripeSignature(payload: string, header: string | null, secret: string, nowMs: number) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  ) as Record<string, string>;
  const t = Number(parts["t"]);
  if (!Number.isFinite(t) || Math.abs(nowMs / 1000 - t) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  const sigs = header
    .split(",")
    .filter((kv) => kv.trim().startsWith("v1="))
    .map((kv) => kv.trim().slice(3));
  return sigs.some((s) => safeEqual(s, expected));
}

/** Toob sündmuse otse Stripe'ist (meie salajase võtmega). Nii on sündmus kindlasti ehtne ka ilma
   webhooki allkirja saladuseta (STRIPE_WEBHOOK_SECRET). Tagastab null, kui Stripe sellist sündmust ei tunne. */
export async function fetchStripeEvent(secretKey: string, eventId: string) {
  if (!/^evt_[A-Za-z0-9]+$/.test(eventId) || !secretKey) return null;
  const res = await fetch(`https://api.stripe.com/v1/events/${eventId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return (await res.json()) as StripeEvent;
}

/* ---------- ost ---------- */

export class SoldOutError extends Error {
  constructor() {
    super("Läbi müüdud");
  }
}

/** Mitu kinkekaarti on veel saada, kõik kujundused kokku (null = piiramatu). Pooleli maksed on reserveeritud. */
export async function remaining(d: Pick<Deps, "store" | "now">) {
  if (TOTAL_STOCK == null) return null;
  const since = new Date(d.now() - RESERVE_MINUTES * 60_000).toISOString();
  const [issued, reserved] = await Promise.all([d.store.countIssued(), d.store.countReserved(since)]);
  return Math.max(0, TOTAL_STOCK - issued - reserved);
}

export async function stockOverview(d: Pick<Deps, "store" | "now">) {
  return { remaining: await remaining(d), total: TOTAL_STOCK };
}

/** Loob tellimuse ja Stripe Checkouti. Hind arvutatakse siin, brauserist tulevat hinda ei kasutata. */
export async function startCheckout(d: Deps, input: OrderInput, origin: string) {
  const design = designById(input.design);
  if (!design) throw new Error("Tundmatu kujundus");
  const left = await remaining(d);
  if (left !== null && left < 1) throw new SoldOutError();
  const printFee = input.delivery === "print" ? PRINT_FEE : 0;
  const total = input.amount + printFee;
  const id = await d.store.insertOrder({ ...input, address: input.delivery === "print" ? input.address : undefined, printFee, total });
  const lines = [{ name: `Kinkekaart ${input.amount} € (${design.name})`, cents: input.amount * 100 }];
  if (printFee) lines.push({ name: "Prinditud kaart ümbrikus (sh postikulu)", cents: printFee * 100 });
  const s = await d.checkout.createSession({
    orderId: id,
    lines,
    email: input.buyerEmail,
    successUrl: `${origin}/kinkekaardid/aitah?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/kinkekaardid?katkestatud=1`,
    expiresAt: Math.floor(d.now() / 1000) + RESERVE_MINUTES * 60,
  });
  await d.store.setOrderSession(id, s.id);
  return { url: s.url };
}

export type StripeEvent = {
  id?: string;
  type: string;
  data: { object: { id: string; payment_status?: string; amount_total?: number; currency?: string; metadata?: Record<string, string> } };
};

/** Stripe'i webhook. Allkiri peab olema enne kontrollitud. Idempotentne: sama makse ei loo kahte kaarti. */
export async function handleStripeEvent(d: Deps, ev: StripeEvent): Promise<"issued" | "duplicate" | "ignored"> {
  if (ev.type !== "checkout.session.completed" && ev.type !== "checkout.session.async_payment_succeeded") return "ignored";
  const s = ev.data.object;
  if (s.payment_status !== "paid") return "ignored";
  const orderId = s.metadata?.["order_id"];
  const order = orderId ? await d.store.getOrder(orderId) : null;
  if (!order) throw new Error(`Tellimust ei leitud: ${orderId}`);
  if (s.amount_total !== order.total * 100 || (s.currency ?? "").toLowerCase() !== "eur") {
    throw new Error(`Makse summa ei klapi: ${s.amount_total} ${s.currency} vs ${order.total} EUR`);
  }
  const r = await issueCard(d, {
    order,
    provider: "stripe",
    paymentId: s.id,
    paidAt: new Date(d.now()).toISOString(),
  });
  return r.duplicate ? "duplicate" : "issued";
}

/** Väljastab kaardi (makse järel või käsitsi) ja saadab e-kirjad. */
export async function issueCard(
  d: Deps,
  a: {
    order: Omit<Order, "id" | "sessionId" | "total"> & { id?: string };
    provider: string;
    paymentId: string | null;
    paidAt: string | null;
    notes?: string;
    sendMail?: boolean;
  },
): Promise<{ card: Card; duplicate: boolean }> {
  if (a.paymentId) {
    const existing = await d.store.getCardByPayment(a.paymentId);
    if (existing) return { card: existing, duplicate: true };
  }
  const o = a.order;
  const issued = new Date(d.now());
  for (let attempt = 0; attempt < 8; attempt++) {
    const card: Card = {
      nr: newCardNumber(d.now()),
      amount: o.amount,
      design: o.design,
      recipient: o.recipient,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      buyerPhone: o.buyerPhone,
      delivery: o.delivery,
      address: o.delivery === "print" ? (o.address ?? null) : null,
      envelope: o.delivery === "print" ? o.envelope : "",
      printFee: o.printFee,
      provider: a.provider,
      paymentId: a.paymentId,
      orderId: o.id ?? null,
      paidAt: a.paidAt,
      issuedAt: issued.toISOString(),
      validUntil: validUntilFrom(issued, VALIDITY_MONTHS),
      status: "aktiivne",
      printStatus: o.delivery === "print" ? "ootab_printimist" : null,
      usedAt: null,
      notes: a.notes ?? "",
    };
    const r = await d.store.insertCard(card);
    if (r === "duplicate_number") continue;
    if (r === "duplicate_payment") {
      const existing = await d.store.getCardByPayment(a.paymentId!);
      if (existing) return { card: existing, duplicate: true };
      throw new Error("Topeltmakse, kuid kaarti ei leitud");
    }
    if (a.sendMail !== false) await sendCardMails(d, card);
    return { card, duplicate: false };
  }
  throw new Error("Unikaalset kaardi numbrit ei õnnestunud luua");
}

/* ---------- e-kirjad ---------- */

const GREEN = "#10291e", GOLD = "#b8913b";
export const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const addressText = (a: Address | null) => (a ? `${a.name}, ${a.street}, ${a.zip} ${a.city}` : "");

export function htmlMail(title: string, paragraphs: string[], button?: { href: string; label: string }) {
  return `<!doctype html><html lang="et"><body style="margin:0;background:#f5f1e8;font-family:Arial,sans-serif;color:${GREEN}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:${GREEN};padding:20px 24px;color:${GOLD};font-size:12px;letter-spacing:3px;text-transform:uppercase">Squeaky Clean · Kinkekaart</td></tr>
<tr><td style="padding:28px 24px">
<h1 style="margin:0 0 16px;font-family:Georgia,serif;font-weight:normal;font-size:24px">${esc(title)}</h1>
${paragraphs.map((p) => `<p style="margin:0 0 12px;line-height:1.5;font-size:15px">${p}</p>`).join("")}
${button ? `<p style="margin:20px 0"><a href="${esc(button.href)}" style="display:inline-block;background:${GOLD};color:${GREEN};text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">${esc(button.label)}</a></p>` : ""}
</td></tr>
<tr><td style="padding:16px 24px;border-top:1px solid #e0d8c6;font-size:12px;color:#6a655a">${esc(COMPANY)} · ${esc(RENTAL_COMPANY.phone)} · ${esc(RENTAL_COMPANY.email)}</td></tr>
</table></td></tr></table></body></html>`;
}

export async function sendCardMails(d: Deps, card: Card, opts: { buyerOnly?: boolean } = {}) {
  const link = signedPdfUrl(d, card.nr);
  const valid = fmtDate(card.validUntil);
  const errors: string[] = [];

  if (card.buyerEmail) {
    const lines = [
      `Aitäh! Sinu kinkekaart summas ${card.amount} € on valmis.`,
      `Kaardi number: ${card.nr}`,
      `Kehtib kuni: ${valid}`,
      `PDF on kirja manuses. Selle saad alla laadida ka siit (link kehtib ${DOWNLOAD_LINK_DAYS} päeva): ${link}`,
      "Kuidas kasutada: kaardi saaja broneerib aja meie kodulehel või telefonil ja ütleb kaardi numbri. Kinkesumma arvestatakse arvelt maha.",
      ...(card.delivery === "print" ? [`Prinditud kaart ümbrikus tuleb postiga aadressile: ${addressText(card.address)}. ${SHIPPING_TEXT}`] : []),
      `Küsimuste korral: ${RENTAL_COMPANY.email}, ${RENTAL_COMPANY.phone}`,
    ];
    try {
      const pdf = await d.pdf(card, { bleed: false });
      await d.mail({
        to: card.buyerEmail,
        subject: `Sinu Squeaky Cleani kinkekaart ${card.nr}`,
        text: lines.join("\n\n"),
        html: htmlMail(
          "Sinu kinkekaart on valmis",
          [
            `Aitäh! Sinu kinkekaart summas <b>${card.amount} €</b> on valmis ja PDF on kirja manuses.`,
            `Kaardi number: <b>${esc(card.nr)}</b><br>Kehtib kuni: <b>${valid}</b>`,
            "Kuidas kasutada: kaardi saaja broneerib aja meie kodulehel või telefonil ja ütleb kaardi numbri. Kinkesumma arvestatakse arvelt maha.",
            ...(card.delivery === "print"
              ? [`Prinditud kaart ümbrikus tuleb postiga aadressile: ${esc(addressText(card.address))}. ${esc(SHIPPING_TEXT)}`]
              : []),
            `Allalaadimislink kehtib ${DOWNLOAD_LINK_DAYS} päeva.`,
          ],
          { href: link, label: "Laadi alla PDF" },
        ),
        attachments: [{ filename: `kinkekaart_${card.nr}.pdf`, content: pdf }],
      });
    } catch (e) {
      errors.push(`ostja kiri: ${(e as Error).message}`);
    }
  }

  if (d.ownerEmail && !opts.buyerOnly) {
    const isPrint = card.delivery === "print";
    const lines = [
      `Uus kinkekaart ${card.nr}: ${card.amount} €, kujundus ${designById(card.design)?.name ?? card.design}.`,
      `Ostja: ${card.buyerName} <${card.buyerEmail}>${card.buyerPhone ? `, ${card.buyerPhone}` : ""}`,
      `Kellele: ${card.recipient || "(tühi)"}`,
      `Kehtib kuni: ${valid}. Makse: ${card.provider}${card.paymentId ? ` ${card.paymentId}` : ""}.`,
      ...(isPrint
        ? [
            `PRINDI JA POSTITA: ${addressText(card.address)}`,
            `Ümbriku tervitus: ${card.envelope || "(puudub)"}`,
            "Trükifail (3 mm lõikevaruga) on manuses. Pärast postitamist märgi kaart halduses postitatuks.",
          ]
        : []),
    ];
    try {
      const attachments = isPrint
        ? [{ filename: `kinkekaart_${card.nr}_trykk_3mm.pdf`, content: await d.pdf(card, { bleed: true }) }]
        : [];
      await d.mail({
        to: d.ownerEmail,
        subject: `${isPrint ? "PRINDI: " : ""}Uus kinkekaart ${card.nr} (${card.amount} €)`,
        text: lines.join("\n"),
        html: htmlMail(isPrint ? "Uus kinkekaart: prindi ja postita" : "Uus kinkekaart", lines.map(esc), {
          href: `${d.siteUrl}/haldus`,
          label: "Ava haldus",
        }),
        attachments,
      });
    } catch (e) {
      errors.push(`omaniku kiri: ${(e as Error).message}`);
    }
  }

  if (errors.length) {
    console.error(`[kinkekaart ${card.nr}] e-kiri ebaõnnestus:`, errors.join("; "));
    await d.store.updateCard(card.nr, { notes: `${card.notes}\nE-kiri ebaõnnestus ${new Date(d.now()).toISOString()}: ${errors.join("; ")}`.trim() });
  }
  return errors;
}

/** Saadab ostjale kinkekaardi kirja uuesti (halduse nupp). */
export async function resendBuyerMail(d: Deps, nr: string) {
  const card = await readCard(d, nr);
  if (!card) throw new Error("Kaarti ei leitud");
  if (!card.buyerEmail) throw new Error("Kaardil pole ostja e-posti aadressi");
  const errors = await sendCardMails(d, card, { buyerOnly: true });
  if (errors.length) throw new Error(`Kiri ei läinud välja: ${errors.join("; ")}`);
  return { to: card.buyerEmail };
}

/* ---------- aitäh-leht ja haldus ---------- */

export async function purchaseResult(d: Deps, sessionId: string) {
  const order = await d.store.getOrderBySession(sessionId);
  if (!order) return { state: "unknown" as const };
  const card = await d.store.getCardByPayment(sessionId);
  if (!card) return { state: "pending" as const };
  return {
    state: "ready" as const,
    nr: card.nr,
    amount: card.amount,
    validUntil: card.validUntil,
    delivery: card.delivery,
    address: addressText(card.address),
    email: card.buyerEmail,
    pdfUrl: signedPdfUrl(d, card.nr),
  };
}

/** Loeb kaardi ja märgib selle vajadusel aegunuks. */
export async function readCard(d: Deps, nr: string) {
  const c = await d.store.getCard(nr);
  if (c && c.status === "aktiivne" && c.validUntil < today(d.now())) {
    return d.store.updateCard(nr, { status: "aegunud" });
  }
  return c;
}

export async function listForAdmin(d: Deps) {
  await d.store.expire(today(d.now()));
  const [recent, printQueue] = await Promise.all([
    d.store.listCards({ limit: 50 }),
    d.store.listCards({ printQueue: true, limit: 100 }),
  ]);
  return { recent, printQueue, stock: await stockOverview(d) };
}

export async function setCardState(d: Deps, nr: string, action: "used" | "cancel" | "posted" | "reactivate") {
  const c = await readCard(d, nr);
  if (!c) throw new Error("Kaarti ei leitud");
  const nowIso = new Date(d.now()).toISOString();
  if (action === "used") {
    if (c.status !== "aktiivne") throw new Error(`Kaart on ${c.status}, seda ei saa kasutatuks märkida`);
    return d.store.updateCard(nr, { status: "kasutatud", usedAt: nowIso });
  }
  if (action === "reactivate") {
    if (c.status !== "kasutatud") throw new Error("Aktiivseks saab tagasi märkida ainult kasutatud kaardi");
    return d.store.updateCard(nr, { status: c.validUntil < today(d.now()) ? "aegunud" : "aktiivne", usedAt: null });
  }
  if (action === "cancel") return d.store.updateCard(nr, { status: "tühistatud" });
  if (c.delivery !== "print") throw new Error("See ei ole prinditud kaardi tellimus");
  return d.store.updateCard(nr, { printStatus: "postitatud" });
}

/* ---------- tootmise sõltuvused ---------- */

export const stripeCheckout = (secretKey: string): Checkout => ({
  async createSession(a) {
    const body = new URLSearchParams({
      mode: "payment",
      locale: "et",
      success_url: a.successUrl,
      cancel_url: a.cancelUrl,
      customer_email: a.email,
      client_reference_id: a.orderId,
      "metadata[order_id]": a.orderId,
      "payment_intent_data[metadata][order_id]": a.orderId,
      expires_at: String(a.expiresAt),
    });
    if (a.kind) {
      body.set("metadata[kind]", a.kind);
      body.set("payment_intent_data[metadata][kind]", a.kind);
    }
    a.lines.forEach((l, i) => {
      body.set(`line_items[${i}][quantity]`, "1");
      body.set(`line_items[${i}][price_data][currency]`, "eur");
      body.set(`line_items[${i}][price_data][unit_amount]`, String(l.cents));
      body.set(`line_items[${i}][price_data][product_data][name]`, l.name);
    });
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { id?: string; url?: string; error?: { message?: string } };
    if (!res.ok || !json.id || !json.url) throw new Error(`Stripe ${res.status}: ${json.error?.message ?? "tundmatu viga"}`);
    return { id: json.id, url: json.url };
  },
});

export const mailerSend: Mailer = async (m) => {
  const token = process.env["MAILERSEND_API_TOKEN"] ?? "";
  if (!token) throw new Error("MAILERSEND_API_TOKEN puudub");
  const res = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: JSON.stringify({
      from: { email: process.env["MAIL_FROM"] || "info@squeakycleanteenused.ee", name: RENTAL_COMPANY.name },
      to: [{ email: m.to }],
      reply_to: { email: RENTAL_COMPANY.email },
      subject: m.subject,
      text: m.text,
      html: m.html,
      ...(m.attachments?.length
        ? {
            attachments: m.attachments.map((a) => ({
              filename: a.filename,
              content: Buffer.from(a.content).toString("base64"),
              disposition: "attachment",
            })),
          }
        : {}),
    }),
  });
  if (!res.ok) throw new Error(`MailerSend ${res.status}: ${(await res.text()).slice(0, 300)}`);
  // Logis on näha, et kiri anti MailerSendile üle (aadress osaliselt peidetud).
  const masked = m.to.replace(/^(.).*(@.*)$/, "$1***$2");
  console.info(`[kinkekaart-kiri] ${res.status} → ${masked} "${m.subject}" id=${res.headers.get("x-message-id") ?? "-"}`);
};

type Row = Record<string, unknown>;
const toCard = (r: Row): Card => ({
  nr: r["card_number"] as string,
  amount: r["amount_eur"] as number,
  design: r["design"] as string,
  recipient: (r["recipient_name"] as string) ?? "",
  buyerName: (r["buyer_name"] as string) ?? "",
  buyerEmail: (r["buyer_email"] as string) ?? "",
  buyerPhone: (r["buyer_phone"] as string) ?? "",
  delivery: r["delivery"] as Card["delivery"],
  address: (r["shipping_address"] as Address | null) ?? null,
  envelope: (r["envelope_message"] as string) ?? "",
  printFee: (r["print_fee_eur"] as number) ?? 0,
  provider: r["payment_provider"] as string,
  paymentId: (r["payment_id"] as string | null) ?? null,
  orderId: (r["order_id"] as string | null) ?? null,
  paidAt: (r["paid_at"] as string | null) ?? null,
  issuedAt: r["issued_at"] as string,
  validUntil: (r["valid_until"] as string).slice(0, 10),
  status: r["status"] as CardStatus,
  printStatus: (r["print_status"] as Card["printStatus"]) ?? null,
  usedAt: (r["used_at"] as string | null) ?? null,
  notes: (r["notes"] as string) ?? "",
});
const fromCard = (c: Partial<Card>) => {
  const m: Record<string, unknown> = {};
  const map: [keyof Card, string][] = [
    ["nr", "card_number"], ["amount", "amount_eur"], ["design", "design"], ["recipient", "recipient_name"],
    ["buyerName", "buyer_name"], ["buyerEmail", "buyer_email"], ["buyerPhone", "buyer_phone"], ["delivery", "delivery"],
    ["address", "shipping_address"], ["envelope", "envelope_message"], ["printFee", "print_fee_eur"],
    ["provider", "payment_provider"], ["paymentId", "payment_id"], ["orderId", "order_id"], ["paidAt", "paid_at"],
    ["issuedAt", "issued_at"], ["validUntil", "valid_until"], ["status", "status"], ["printStatus", "print_status"],
    ["usedAt", "used_at"], ["notes", "notes"],
  ];
  for (const [k, col] of map) if (k in c) m[col] = c[k];
  return m;
};
const toOrder = (r: Row): Order => ({
  id: r["id"] as string,
  design: r["design"] as string,
  amount: r["amount_eur"] as number,
  recipient: (r["recipient_name"] as string) ?? "",
  delivery: r["delivery"] as Order["delivery"],
  address: (r["shipping_address"] as Address | null) ?? undefined,
  envelope: (r["envelope_message"] as string) ?? "",
  buyerName: r["buyer_name"] as string,
  buyerEmail: r["buyer_email"] as string,
  buyerPhone: (r["buyer_phone"] as string) ?? "",
  printFee: (r["print_fee_eur"] as number) ?? 0,
  total: r["total_eur"] as number,
  sessionId: (r["stripe_session_id"] as string | null) ?? null,
});

export async function supabaseStore(): Promise<Store> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Tabelid lisatakse migratsiooniga 20261117120000_gift_cards.sql.
  const db = supabaseAdmin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const must = <T>(r: { data: T; error: { message: string; code?: string } | null }) => {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  };
  return {
    async insertOrder(o) {
      const r = must(
        await db
          .from("gift_card_orders")
          .insert({
            amount_eur: o.amount,
            design: o.design,
            recipient_name: o.recipient,
            buyer_name: o.buyerName,
            buyer_email: o.buyerEmail,
            buyer_phone: o.buyerPhone,
            delivery: o.delivery,
            shipping_address: o.address ?? null,
            envelope_message: o.envelope,
            print_fee_eur: o.printFee,
            total_eur: o.total,
          })
          .select("id")
          .single(),
      ) as { id: string };
      return r.id;
    },
    async setOrderSession(id, sessionId) {
      must(await db.from("gift_card_orders").update({ stripe_session_id: sessionId }).eq("id", id));
    },
    async getOrder(id) {
      const r = must(await db.from("gift_card_orders").select("*").eq("id", id).maybeSingle()) as Row | null;
      return r ? toOrder(r) : null;
    },
    async getOrderBySession(sessionId) {
      const r = must(await db.from("gift_card_orders").select("*").eq("stripe_session_id", sessionId).maybeSingle()) as Row | null;
      return r ? toOrder(r) : null;
    },
    async getCard(nr) {
      const r = must(await db.from("gift_cards").select("*").eq("card_number", nr).maybeSingle()) as Row | null;
      return r ? toCard(r) : null;
    },
    async getCardByPayment(paymentId) {
      const r = must(await db.from("gift_cards").select("*").eq("payment_id", paymentId).maybeSingle()) as Row | null;
      return r ? toCard(r) : null;
    },
    async insertCard(c) {
      const r = await db.from("gift_cards").insert(fromCard(c));
      if (!r.error) return "ok";
      if (r.error.code === "23505") return /payment_id/.test(r.error.message) ? "duplicate_payment" : "duplicate_number";
      throw new Error(r.error.message);
    },
    async updateCard(nr, patch) {
      const r = must(await db.from("gift_cards").update(fromCard(patch)).eq("card_number", nr).select("*").maybeSingle()) as Row | null;
      return r ? toCard(r) : null;
    },
    async listCards({ printQueue, limit }) {
      let q = db.from("gift_cards").select("*");
      if (printQueue) q = q.eq("print_status", "ootab_printimist");
      const r = must(await q.order("issued_at", { ascending: false }).limit(limit)) as Row[];
      return r.map(toCard);
    },
    async countIssued() {
      const r = await db.from("gift_cards").select("id", { count: "exact", head: true }).neq("status", "tühistatud");
      if (r.error) throw new Error(r.error.message);
      return (r.count as number) ?? 0;
    },
    async countReserved(sinceIso) {
      const orders = must(
        await db.from("gift_card_orders").select("id").gte("created_at", sinceIso).not("stripe_session_id", "is", null),
      ) as { id: string }[];
      if (!orders.length) return 0;
      const done = must(await db.from("gift_cards").select("order_id").in("order_id", orders.map((o) => o.id))) as { order_id: string }[];
      return orders.length - done.length;
    },
    async expire(todayIso) {
      must(await db.from("gift_cards").update({ status: "aegunud" }).eq("status", "aktiivne").lt("valid_until", todayIso));
    },
  };
}

/** Tootmise sõltuvused keskkonnamuutujatest (vt .env.example). */
export async function prodDeps(origin?: string): Promise<Deps> {
  // Allkirjade saladus: GIFTCARD_SECRET, või kui see puudub, tuletatakse see Stripe'i salajasest võtmest
  // (sama tugev, kuid eraldi kasutuseks). Stripe'i võtme vahetamisel aeguvad vanad PDF-lingid ja halduse sessioon.
  const own = (process.env["GIFTCARD_SECRET"] ?? "").trim();
  const stripeKey = (process.env["STRIPE_SECRET_KEY"] ?? "").trim();
  const secret =
    own.length >= 32 ? own : stripeKey.length >= 32 ? createHmac("sha256", stripeKey).update("squeakyclean-giftcard-v1").digest("base64url") : "";
  if (!secret) throw new Error("Kinkekaartide seadistus puudub: STRIPE_SECRET_KEY (või GIFTCARD_SECRET) pole seatud");
  const { renderCardPdf } = await import("@/lib/giftcard-pdf.server");
  return {
    store: await supabaseStore(),
    mail: mailerSend,
    checkout: stripeCheckout((process.env["STRIPE_SECRET_KEY"] ?? "").trim()),
    pdf: renderCardPdf,
    now: Date.now,
    // Päringu aadress eelkõige, et eelvaates (preview) viiksid lingid eelvaatesse, mitte päris lehele.
    siteUrl: (origin || process.env["PUBLIC_SITE_URL"] || "https://www.squeakycleanteenused.ee").replace(/\/$/, ""),
    ownerEmail: process.env["OWNER_EMAIL"] || RENTAL_COMPANY.email,
    secret,
  };
}
