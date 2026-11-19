import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/* E-poe serverifunktsioonid. Loogika on shop.server.ts-is (laetakse ainult serveris). */

async function ctx() {
  const { getRequestUrl } = await import("@tanstack/react-start/server");
  const shop = await import("./shop.server");
  const origin = getRequestUrl().origin;
  return { shop, d: await shop.prodDeps(origin), origin };
}

async function admin() {
  const c = await ctx();
  const { getCookie } = await import("@tanstack/react-start/server");
  const g = await import("./giftcards.server");
  if (!g.verifyAdminToken(c.d, getCookie(g.ADMIN_COOKIE))) throw new Error("Pole sisse logitud");
  return c;
}

const text = (max: number) => z.string().trim().max(max);

/* ---------- avalik ---------- */

export const shopProducts = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { shop, d } = await ctx();
    const list = await d.store.listProducts({ activeOnly: true });
    return list.map((p) => shop.publicProduct(d, p));
  } catch (e) {
    // pood ei tohi kogu lehte maha võtta: tühja nimekirja korral näidatakse ootelisti
    console.error(`[e-pood] tooteid ei saanud laadida: ${(e as Error).name}`);
    return [];
  }
});

export const shopProduct = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: z.string().max(100) }).parse(data))
  .handler(async ({ data }) => {
    const { shop, d } = await ctx();
    const p = await d.store.getProductBySlug(data.slug);
    return p && p.active ? shop.publicProduct(d, p) : null;
  });

export const startProductCheckout = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z
      .object({
        slugs: z.array(z.string().max(100)).min(1).max(20),
        buyerName: text(80),
        buyerEmail: z.string().trim().email().max(160),
        digitalConsent: z.literal(true),
        terms: z.literal(true),
        website: z.string().max(200).optional(), // meepott
        elapsedMs: z.number().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    if ((data.website ?? "").trim() !== "" || !(typeof data.elapsedMs === "number" && data.elapsedMs >= 3000)) {
      throw new Error("Vorm saadeti liiga kiiresti");
    }
    const { shop, d, origin } = await ctx();
    try {
      return { ok: true as const, ...(await shop.startCheckout(d, data, origin)) };
    } catch (e) {
      if (e instanceof shop.NotForSaleError) return { ok: false as const, unavailable: e.slugs };
      throw e;
    }
  });

export const productPurchase = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ sessionId: z.string().min(10).max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { shop, d } = await ctx();
    return shop.purchaseResult(d, data.sessionId);
  });

/* ---------- haldus ---------- */

export const adminProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { d } = await admin();
  const [products, orders] = await Promise.all([d.store.listProducts({ activeOnly: false }), d.store.listOrders(50)]);
  return {
    products: products.map((p) => ({ ...p, imageUrl: p.imagePath ? d.files.imageUrl(p.imagePath) : null })),
    orders,
  };
});

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: text(80),
  title: text(120).min(2),
  short: text(300),
  description: text(5000),
  category: text(60),
  kind: z.enum(["digital", "physical"]),
  priceCents: z.number().int().min(50).max(1000000),
  imagePath: z.string().max(200).nullable(),
  filePath: z.string().max(200).nullable(),
  fileName: z.string().max(200).nullable(),
  active: z.boolean(),
  sort: z.number().int().min(-1000).max(1000),
  aiMade: z.boolean(),
});

export const adminSaveProduct = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => productSchema.parse(data))
  .handler(async ({ data }) => {
    const { shop, d } = await admin();
    return { product: await shop.saveProduct(d, data) };
  });

export const adminUploadTicket = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ what: z.enum(["file", "image"]), fileName: z.string().max(200) }).parse(data))
  .handler(async ({ data }) => {
    const { shop, d } = await admin();
    return shop.uploadTicket(d, data.what, data.fileName);
  });

export const adminResendProductMail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ orderId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { shop, d } = await admin();
    const o = await d.store.getOrder(data.orderId);
    if (!o || o.status !== "paid") throw new Error("Makstud tellimust ei leitud");
    const errors = await shop.sendOrderMails(d, o, { buyerOnly: true });
    if (errors.length) throw new Error("Kiri ei läinud välja, vaata tellimuse märkust");
    return { to: o.buyerEmail };
  });
