import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* E-poe ootelist: registreerimine, kinnitamine ja loobumine. Loogika on waitlist.server.ts-is
   (see laetakse alles serveris, et service role võti ei jõuaks brauseri paketti).
   Vercelis vajalikud muutujad: vaata .env.example. */

async function deps() {
  const w = await import("./waitlist.server");
  return {
    w,
    d: {
      store: await w.supabaseStore(),
      mail: w.mailerSend,
      now: Date.now,
      siteUrl: process.env["PUBLIC_SITE_URL"] || undefined,
    },
  };
}

/** Turnstile avalik saidivõti (või null, kui Turnstile pole sisse lülitatud). */
export const shopConfig = createServerFn({ method: "GET" }).handler(async () => {
  const { turnstileConfig } = await import("./waitlist.server");
  return { turnstileSiteKey: turnstileConfig()?.siteKey ?? null };
});

const subscribeSchema = z.object({
  email: z.string().trim().email().max(160),
  lang: z.enum(["et", "en"]),
  website: z.string().max(200).optional(),
  elapsedMs: z.number().optional(),
  turnstileToken: z.string().max(4096).optional(),
});

export const subscribeShop = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => subscribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { getRequestIP } = await import("@tanstack/react-start/server");
    const { w, d } = await deps();
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";

    // Honeypot ja ajakontroll enne kõike muud, et botid ei saaks Turnstile'i ega andmebaasi koormata.
    if (
      (data.website ?? "").trim() !== "" ||
      !(typeof data.elapsedMs === "number" && data.elapsedMs >= w.MIN_FILL_MS)
    ) {
      return { ok: true as const };
    }
    const ts = w.turnstileConfig();
    if (
      ts &&
      !(await w.verifyTurnstile(
        ts.secret,
        data.turnstileToken ?? "",
        ip === "unknown" ? undefined : ip,
      ))
    ) {
      throw new Error("Turnstile failed");
    }
    const r = await w.subscribe(d, { ...data, ipHash: await w.hashIp(ip) });
    if (!r.ok) throw new Error("Too many requests");
    return { ok: true as const };
  });

const tokenSchema = z.object({ token: z.string().min(20).max(100) });

export const confirmShop = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { w, d } = await deps();
    return { result: await w.confirmToken(d, data.token) };
  });

export const unsubscribeShop = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => tokenSchema.parse(data))
  .handler(async ({ data }) => {
    const { w, d } = await deps();
    return { result: await w.unsubscribeToken(d, data.token) };
  });
