/* E-poe ootelisti loogika (ainult server). Salvestus ja kirjade saatmine on süstitavad, et voogu saaks testida
   ilma andmebaasi ja MailerSendita. Tootmises kasutatakse Supabase'i (service role) ja MailerSendi. */
import type { Lang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { SITE_URL } from "@/lib/site";
import {
  CONFIRM_HOURS,
  confirmSubject,
  confirmText,
  ownerNotificationText,
} from "@/lib/waitlist-texts";

export const MIN_FILL_MS = 3000;
export const MAX_PER_IP_PER_HOUR = 3;
export const RESEND_COOLDOWN_MS = 5 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export type Row = {
  id: string;
  email: string;
  lang: Lang;
  status: "pending" | "confirmed";
  expires_at: string | null;
  last_sent_at: string;
};

export interface Store {
  purgeExpired(nowIso: string): Promise<void>;
  countAttempts(ipHash: string, sinceIso: string): Promise<number>;
  addAttempt(ipHash: string): Promise<void>;
  findByEmail(email: string): Promise<Row | null>;
  findByTokenHash(tokenHash: string): Promise<Row | null>;
  /** Lisab uue ootel rea või uuendab olemasoleva ootel rea tokenit. */
  savePending(p: {
    email: string;
    lang: Lang;
    tokenHash: string;
    expiresAt: string;
    nowIso: string;
  }): Promise<Row>;
  /** Muudab ainult ootel rea kinnitatuks; true ainult siis, kui see rida just muutus. */
  confirm(id: string, nowIso: string): Promise<boolean>;
  remove(id: string): Promise<void>;
}

export type Mailer = (m: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}) => Promise<void>;

export type Deps = { store: Store; mail: Mailer; now: () => number; siteUrl?: string | undefined };

/* ---------- abifunktsioonid ---------- */

export async function sha256Hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function newToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const base = (d: Deps) => (d.siteUrl ?? SITE_URL).replace(/\/$/, "");

/* ---------- registreerimine ---------- */

export type SubscribeInput = {
  email: string;
  lang: Lang;
  /** Nähtamatu lõks: inimene jätab tühjaks. */
  website?: string | undefined;
  /** Millisekundeid lehe laadimisest vormi saatmiseni (mõõdab brauser). */
  elapsedMs?: number | undefined;
  ipHash: string;
};

export type SubscribeResult = { ok: true } | { ok: false; reason: "rate_limited" };

export async function subscribe(d: Deps, input: SubscribeInput): Promise<SubscribeResult> {
  // Bot: vastame edukalt, aga ei salvesta ega saada midagi.
  if (input.website && input.website.trim() !== "") return { ok: true };
  if (typeof input.elapsedMs !== "number" || !(input.elapsedMs >= MIN_FILL_MS)) return { ok: true };

  const now = d.now();
  const nowIso = new Date(now).toISOString();

  if (
    (await d.store.countAttempts(input.ipHash, new Date(now - HOUR_MS).toISOString())) >=
    MAX_PER_IP_PER_HOUR
  ) {
    return { ok: false, reason: "rate_limited" };
  }
  await d.store.addAttempt(input.ipHash);
  await d.store.purgeExpired(nowIso);

  const email = input.email.trim().toLowerCase();
  const existing = await d.store.findByEmail(email);
  // Ei avalda, kas aadress on juba listis, ega saada uut kirja liiga tihti (kaitse kellegi e-posti üle ujutamise vastu).
  if (existing?.status === "confirmed") return { ok: true };
  if (existing && now - Date.parse(existing.last_sent_at) < RESEND_COOLDOWN_MS) return { ok: true };

  const token = newToken();
  const row = await d.store.savePending({
    email,
    lang: input.lang,
    tokenHash: await sha256Hex(token),
    expiresAt: new Date(now + CONFIRM_HOURS * HOUR_MS).toISOString(),
    nowIso,
  });
  const b = base(d);
  try {
    await d.mail({
      to: email,
      subject: confirmSubject(input.lang),
      text: confirmText(
        input.lang,
        `${b}/epood/kinnita?token=${token}`,
        `${b}/epood/loobu?token=${token}`,
        `${b}/privaatsus`,
      ),
      replyTo: RENTAL_COMPANY.email,
    });
  } catch (e) {
    await d.store.remove(row.id); // kiri ei läinud, seega ei jäta "kummitusrida"
    throw e;
  }
  return { ok: true };
}

/* ---------- kinnitamine ja loobumine ---------- */

export type ConfirmResult = "confirmed" | "already" | "expired" | "invalid";

export async function confirmToken(d: Deps, token: string): Promise<ConfirmResult> {
  const row = await d.store.findByTokenHash(await sha256Hex(token));
  if (!row) return "invalid";
  if (row.status === "confirmed") return "already";
  const now = d.now();
  if (!row.expires_at || Date.parse(row.expires_at) < now) {
    await d.store.remove(row.id);
    return "expired";
  }
  // Teavitus läheb ainult siis, kui just meie muutsime rea kinnitatuks (topeltklikk ei saada kaks korda).
  if (await d.store.confirm(row.id, new Date(now).toISOString())) {
    try {
      const at = new Date(now).toLocaleString("et-EE", { timeZone: "Europe/Tallinn" });
      await d.mail({
        to: RENTAL_COMPANY.email,
        subject: "E-poe avamise teavituse soov",
        text: ownerNotificationText(row.email, row.lang, at),
        replyTo: row.email,
      });
    } catch (e) {
      // Aadress jääb kinnitatuna andmebaasi; inimesele näitame ikka edukat vastust.
      console.error("[waitlist] owner notification failed", e);
    }
  }
  return "confirmed";
}

export type UnsubscribeResult = "removed" | "invalid";

export async function unsubscribeToken(d: Deps, token: string): Promise<UnsubscribeResult> {
  const row = await d.store.findByTokenHash(await sha256Hex(token));
  if (!row) return "invalid";
  await d.store.remove(row.id);
  return "removed";
}

/* ---------- tootmise sõltuvused ---------- */

export function turnstileConfig() {
  const siteKey = process.env["TURNSTILE_SITE_KEY"] ?? "";
  const secret = process.env["TURNSTILE_SECRET_KEY"] ?? "";
  return siteKey && secret ? { siteKey, secret } : null;
}

export async function verifyTurnstile(secret: string, response: string, ip?: string) {
  if (!response) return false;
  const body = new URLSearchParams({ secret, response });
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });
  if (!res.ok) return false;
  const json = (await res.json()) as { success?: boolean };
  return json.success === true;
}

export async function hashIp(ip: string) {
  const pepper = process.env["WAITLIST_SALT"] || process.env["SUPABASE_SERVICE_ROLE_KEY"] || "";
  return sha256Hex(`${pepper}:${ip}`);
}

export const mailerSend: Mailer = async ({ to, subject, text, replyTo }) => {
  const token = process.env["MAILERSEND_API_TOKEN"] ?? "";
  if (!token) throw new Error("Mail not configured");
  const res = await fetch("https://api.mailersend.com/v1/email", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify({
      from: {
        email: process.env["MAIL_FROM"] || "info@squeakycleanteenused.ee",
        name: RENTAL_COMPANY.name,
      },
      to: [{ email: to }],
      ...(replyTo ? { reply_to: { email: replyTo } } : {}),
      subject,
      text,
    }),
  });
  if (!res.ok) throw new Error(`MailerSend ${res.status}: ${(await res.text()).slice(0, 300)}`);
};

export async function supabaseStore(): Promise<Store> {
  const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
  const cols = "id,email,lang,status,expires_at,last_sent_at";
  const must = <T>(r: { data: T; error: { message: string } | null }) => {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  };
  return {
    async purgeExpired(nowIso) {
      must(
        await db.from("shop_waitlist").delete().eq("status", "pending").lt("expires_at", nowIso),
      );
      must(
        await db
          .from("shop_waitlist_attempts")
          .delete()
          .lt("created_at", new Date(Date.parse(nowIso) - 24 * HOUR_MS).toISOString()),
      );
    },
    async countAttempts(ipHash, sinceIso) {
      const r = await db
        .from("shop_waitlist_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip_hash", ipHash)
        .gte("created_at", sinceIso);
      if (r.error) throw new Error(r.error.message);
      return r.count ?? 0;
    },
    async addAttempt(ipHash) {
      must(await db.from("shop_waitlist_attempts").insert({ ip_hash: ipHash }));
    },
    async findByEmail(email) {
      return must(
        await db.from("shop_waitlist").select(cols).eq("email", email).maybeSingle(),
      ) as Row | null;
    },
    async findByTokenHash(tokenHash) {
      return must(
        await db.from("shop_waitlist").select(cols).eq("token_hash", tokenHash).maybeSingle(),
      ) as Row | null;
    },
    async savePending(p) {
      const existing = must(
        await db.from("shop_waitlist").select("id").eq("email", p.email).maybeSingle(),
      );
      const fields = {
        lang: p.lang,
        status: "pending",
        token_hash: p.tokenHash,
        expires_at: p.expiresAt,
        last_sent_at: p.nowIso,
      };
      const q = existing
        ? db.from("shop_waitlist").update(fields).eq("id", existing.id)
        : db.from("shop_waitlist").insert({ email: p.email, ...fields });
      return must(await q.select(cols).single()) as Row;
    },
    async confirm(id, nowIso) {
      const rows = must(
        await db
          .from("shop_waitlist")
          .update({ status: "confirmed", confirmed_at: nowIso })
          .eq("id", id)
          .eq("status", "pending")
          .select("id"),
      );
      return (rows?.length ?? 0) > 0;
    },
    async remove(id) {
      must(await db.from("shop_waitlist").delete().eq("id", id));
    },
  };
}
