import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { clientCopySubject, clientCopyText } from "@/lib/mail-texts";

/* E-kirjade saatmine MailerSendi kaudu (serveris, API-võti ei jõua brauserisse).
   Vercelis (Settings → Environment Variables, Production) peavad olema:
     MAILERSEND_API_TOKEN  – MailerSendi API võti (Sending access)
     MAIL_FROM             – saatja aadress kinnitatud domeenil, vaikimisi info@squeakycleanteenused.ee
   Kui võtit pole, tagastab saatmine { sent: false } ja vorm avab kliendi e-posti programmi. */

const API = "https://api.mailersend.com/v1/email";
const token = () => process.env['MAILERSEND_API_TOKEN'] ?? "";
const from = () => process.env['MAIL_FROM'] || "info@squeakycleanteenused.ee";

/* Lihtne kaitse kuritarvituse vastu: ühe serveri eksemplari kohta kuni 20 saatmist 10 minutis. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 20;
let recent: number[] = [];
function allow() {
  const now = Date.now();
  recent = recent.filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) return false;
  recent.push(now);
  return true;
}

async function send(to: { email: string; name?: string }, replyTo: { email: string; name?: string }, subject: string, text: string) {
  const res = await fetch(API, {
    method: "POST",
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
    body: JSON.stringify({
      from: { email: from(), name: RENTAL_COMPANY.name },
      to: [to],
      reply_to: replyTo,
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`MailerSend ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

export const mailStatus = createServerFn({ method: "GET" }).handler(async () => ({ configured: Boolean(token()) }));

const schema = z.object({
  kind: z.enum(["request", "withdrawal"]),
  lang: z.enum(["et", "en"]),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(20000),
  clientEmail: z.string().trim().email().max(160),
  clientName: z.string().trim().min(1).max(120),
});

export const sendSiteMail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    if (!token()) return { sent: false as const, copy: false };
    if (!allow()) throw new Error("Too many requests");

    const receivedAt = new Date().toLocaleString(data.lang === "et" ? "et-EE" : "en-GB", { timeZone: "Europe/Tallinn" });
    const client = { email: data.clientEmail, name: data.clientName };

    // 1) Ettevõtte postkasti. Kui see ebaõnnestub, viskab vea ja vorm avab e-posti programmi.
    await send({ email: RENTAL_COMPANY.email, name: RENTAL_COMPANY.name }, client, data.subject, `${data.message}\n\nSaadetud: ${receivedAt}`);

    // 2) Kliendile koopia / taganemise kinnitus kindla põhja järgi.
    let copy = false;
    try {
      await send(
        client,
        { email: RENTAL_COMPANY.email, name: RENTAL_COMPANY.name },
        clientCopySubject(data.kind, data.lang),
        clientCopyText(data.kind, data.lang, data.clientName, data.message, receivedAt),
      );
      copy = true;
    } catch (e) {
      console.error("[mail] client copy failed", e);
    }
    return { sent: true as const, copy };
  });

/* E-poe avamise teavituse soov: saadetakse ainult ettevõtte postkasti (kliendile ei saadeta midagi). */
const shopSchema = z.object({
  email: z.string().trim().email().max(160),
  lang: z.enum(["et", "en"]),
});

export const notifyShopSignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => shopSchema.parse(data))
  .handler(async ({ data }) => {
    if (!token()) throw new Error("Mail not configured");
    if (!allow()) throw new Error("Too many requests");
    const at = new Date().toLocaleString("et-EE", { timeZone: "Europe/Tallinn" });
    await send(
      { email: RENTAL_COMPANY.email, name: RENTAL_COMPANY.name },
      { email: data.email },
      "E-poe avamise teavituse soov",
      `Palun teavita e-poe avamisest: ${data.email}\nKeel: ${data.lang}\nAeg: ${at}\n\nNõusolek: ainult e-poe avamise teavitus. Kustuta aadress pärast teavituse saatmist või kui inimene seda palub.`,
    );
    return { ok: true as const };
  });
