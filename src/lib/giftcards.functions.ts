import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { DESIGN_IDS, MAX_AMOUNT, MIN_AMOUNT } from "@/lib/giftcards.config";

/* Kinkekaartide serverifunktsioonid. Loogika on giftcards.server.ts-is (laetakse ainult serveris,
   et võtmed ja andmebaasi ligipääs ei jõuaks brauseri paketti). Muutujad: vaata .env.example. */

async function ctx() {
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  const g = await import("./giftcards.server");
  const origin = getRequestUrl().origin;
  return { g, d: await g.prodDeps(origin), origin };
}

const text = (max: number) => z.string().trim().max(max);

const orderSchema = z
  .object({
    design: z.enum(DESIGN_IDS),
    amount: z.number().int().min(MIN_AMOUNT).max(MAX_AMOUNT),
    recipient: text(32),
    delivery: z.enum(["digital", "print"]),
    address: z
      .object({ name: text(80).min(2), street: text(120).min(3), city: text(60).min(2), zip: z.string().trim().regex(/^\d{5}$/) })
      .optional(),
    envelope: text(200),
    buyerName: text(80).min(2),
    buyerEmail: z.string().trim().email().max(160),
    buyerPhone: text(40),
    terms: z.literal(true),
    website: z.string().max(200).optional(), // meepott: inimene seda välja ei näe
    elapsedMs: z.number().optional(),
  })
  .refine((o) => o.delivery === "digital" || !!o.address, { message: "Postiaadress puudub", path: ["address"] });

/** Loob makse ja tagastab Stripe'i makselehe aadressi. Hind arvutatakse serveris. */
export const startGiftCardCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    // Botikaitse: täidetud meepott või liiga kiire täitmine. Andmebaasi ja Stripe'i ei puudutata.
    if ((data.website ?? "").trim() !== "" || !(typeof data.elapsedMs === "number" && data.elapsedMs >= 4000)) {
      throw new Error("Vorm saadeti liiga kiiresti");
    }
    const { g, d, origin } = await ctx();
    const { terms: _terms, website: _w, elapsedMs: _e, ...input } = data;
    try {
      return { ok: true as const, ...(await g.startCheckout(d, input, origin)) };
    } catch (e) {
      if (e instanceof g.SoldOutError) return { ok: false as const, reason: "sold_out" as const };
      throw e;
    }
  });

/** Mitu kaarti igast kujundusest on veel saada (null = piiramatu). */
export const giftCardStock = createServerFn({ method: "GET" }).handler(async () => {
  const { g, d } = await ctx();
  return g.stockOverview(d);
});

/** Aitäh-leht: kas webhook on kaardi juba väljastanud. */
export const giftCardPurchase = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(10).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { g, d } = await ctx();
    return g.purchaseResult(d, data.sessionId);
  });

/* ---------- haldus ---------- */

async function admin() {
  const c = await ctx();
  const { getCookie } = await import("@tanstack/react-start/server");
  if (!c.g.verifyAdminToken(c.d, getCookie(c.g.ADMIN_COOKIE))) throw new Error("Pole sisse logitud");
  return c;
}

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await admin();
    return { loggedIn: true };
  } catch {
    return { loggedIn: false };
  }
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ password: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { g, d } = await ctx();
    const { setCookie } = await import("@tanstack/react-start/server");
    if (!g.checkPassword(data.password, (process.env["ADMIN_PASSWORD"] ?? "").trim())) {
      await new Promise((r) => setTimeout(r, 1000)); // aeglustab parooli arvamist
      return { ok: false };
    }
    setCookie(g.ADMIN_COOKIE, g.adminToken(d), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: g.ADMIN_HOURS * 3600,
    });
    return { ok: true };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  const { ADMIN_COOKIE } = await import("./giftcards.server");
  deleteCookie(ADMIN_COOKIE, { path: "/" });
  return { ok: true };
});

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { g, d } = await admin();
  return g.listForAdmin(d);
});

export const adminFindCard = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ nr: z.string().trim().toUpperCase().max(20) }).parse(data))
  .handler(async ({ data }) => {
    const { g, d } = await admin();
    return { card: await g.readCard(d, data.nr) };
  });

export const adminCardAction = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ nr: z.string().max(20), action: z.enum(["used", "cancel", "posted", "reactivate"]) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { g, d } = await admin();
    return { card: await g.setCardState(d, data.nr, data.action) };
  });

/** Saadab ostjale kinkekaardi kirja (PDF manusena) uuesti. */
export const adminResendMail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ nr: z.string().max(20) }).parse(data))
  .handler(async ({ data }) => {
    const { g, d } = await admin();
    return g.resendBuyerMail(d, data.nr);
  });

/** Käsitsi väljastamine (nt kui klient maksis arvega). Makset ei looda. */
export const adminIssueCard = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        design: z.enum(DESIGN_IDS),
        amount: z.number().int().min(MIN_AMOUNT).max(MAX_AMOUNT),
        recipient: text(32),
        buyerName: text(80),
        buyerEmail: z.union([z.literal(""), z.string().trim().email().max(160)]),
        notes: text(500),
        sendMail: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { g, d } = await admin();
    const r = await g.issueCard(d, {
      order: {
        design: data.design,
        amount: data.amount,
        recipient: data.recipient,
        delivery: "digital",
        envelope: "",
        buyerName: data.buyerName,
        buyerEmail: data.buyerEmail,
        buyerPhone: "",
        printFee: 0,
      },
      provider: "käsitsi",
      paymentId: null,
      paidAt: null,
      notes: data.notes,
      sendMail: data.sendMail && !!data.buyerEmail,
    });
    return { card: r.card };
  });
