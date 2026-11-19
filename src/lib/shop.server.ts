/* E-poe loogika (ainult server), 1. etapp: digitaalsed tooted.
   Salvestus, failid, makse ja e-kirjad on süstitavad (Deps), et voogu saaks testida (tests/shop.test.ts).
   Kasutab kinkekaartidega sama Stripe'i, MailerSendi ja allkirjasaladust (giftcards.server.ts). */
import { randomUUID } from "node:crypto";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { esc, hmac, htmlMail, safeEqual, type Checkout, type Mailer, type StripeEvent } from "@/lib/giftcards.server";

export const DOWNLOAD_DAYS = 7;
export const RESERVE_MINUTES = 31;

export type Product = {
  id: string;
  slug: string;
  title: string;
  short: string;
  description: string;
  category: string;
  kind: "digital" | "physical";
  priceCents: number;
  imagePath: string | null;
  filePath: string | null;
  fileName: string | null;
  active: boolean;
  sort: number;
};
export type ProductInput = Omit<Product, "id"> & { id?: string | undefined };

export type Order = {
  id: string;
  productId: string | null;
  productTitle: string;
  priceCents: number;
  buyerName: string;
  buyerEmail: string;
  consentAt: string;
  status: "pending" | "paid" | "refunded";
  sessionId: string | null;
  paidAt: string | null;
  downloads: number;
  notes: string;
  createdAt: string;
};

export interface Store {
  listProducts(o: { activeOnly: boolean }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  getProductBySlug(slug: string): Promise<Product | null>;
  saveProduct(p: ProductInput): Promise<Product>;
  insertOrder(o: Omit<Order, "id" | "status" | "sessionId" | "paidAt" | "downloads" | "notes" | "createdAt">): Promise<string>;
  setOrderSession(id: string, sessionId: string): Promise<void>;
  getOrder(id: string): Promise<Order | null>;
  getOrderBySession(sessionId: string): Promise<Order | null>;
  /** pending → paid. Tagastab tellimuse ainult siis, kui olek päriselt muutus (idempotentsus). */
  markPaid(id: string, paidAt: string): Promise<Order | null>;
  addDownload(id: string): Promise<void>;
  addNote(id: string, note: string): Promise<void>;
  listOrders(limit: number): Promise<Order[]>;
}

export interface Files {
  /** Lühiajaline link privaatsele failile (allalaadimiseks). */
  downloadUrl(path: string, fileName: string): Promise<string>;
  /** Üleslaadimise luba otse brauserist salve. */
  uploadTicket(bucket: "product-files" | "product-images", path: string): Promise<{ path: string; token: string }>;
  imageUrl(path: string): string;
}

export type Deps = {
  store: Store;
  files: Files;
  mail: Mailer;
  checkout: Checkout;
  now: () => number;
  siteUrl: string;
  ownerEmail: string;
  secret: string;
};

export { euro } from "@/lib/shop.shared";
import { euro } from "@/lib/shop.shared";

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Avalik vaade tootest (ilma failitee ja muu sisemiseta). */
export function publicProduct(d: Pick<Deps, "files">, p: Product) {
  return {
    slug: p.slug,
    title: p.title,
    short: p.short,
    description: p.description,
    category: p.category,
    kind: p.kind,
    priceCents: p.priceCents,
    imageUrl: p.imagePath ? d.files.imageUrl(p.imagePath) : null,
    fileType: p.fileName ? (p.fileName.split(".").pop() ?? "").toUpperCase() : null,
  };
}
export type PublicProduct = ReturnType<typeof publicProduct>;

/* ---------- allalaadimislink ---------- */

export function signedDownloadUrl(d: Pick<Deps, "secret" | "siteUrl" | "now">, orderId: string, days = DOWNLOAD_DAYS) {
  const exp = Math.floor(d.now() / 1000) + days * 86400;
  const sig = hmac(d.secret, `dl.${orderId}.${exp}`);
  return `${d.siteUrl}/api/pood/fail?o=${orderId}&exp=${exp}&sig=${sig}`;
}
export function verifyDownloadSig(d: Pick<Deps, "secret" | "now">, orderId: string, exp: number, sig: string) {
  if (!Number.isFinite(exp) || exp * 1000 < d.now()) return false;
  return safeEqual(sig, hmac(d.secret, `dl.${orderId}.${exp}`));
}

/* ---------- ost ---------- */

export class NotForSaleError extends Error {
  constructor() {
    super("Toode ei ole müügil");
  }
}

export async function startCheckout(
  d: Deps,
  input: { slug: string; buyerName: string; buyerEmail: string },
  origin: string,
) {
  const p = await d.store.getProductBySlug(input.slug);
  if (!p || !p.active || p.kind !== "digital" || !p.filePath) throw new NotForSaleError();
  const id = await d.store.insertOrder({
    productId: p.id,
    productTitle: p.title,
    priceCents: p.priceCents,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    consentAt: new Date(d.now()).toISOString(),
  });
  const s = await d.checkout.createSession({
    orderId: id,
    kind: "product",
    lines: [{ name: p.title, cents: p.priceCents }],
    email: input.buyerEmail,
    successUrl: `${origin}/pood/aitah?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${origin}/pood/${p.slug}?katkestatud=1`,
    expiresAt: Math.floor(d.now() / 1000) + RESERVE_MINUTES * 60,
  });
  await d.store.setOrderSession(id, s.id);
  return { url: s.url };
}

/** Stripe'i sündmus e-poe tellimuse kohta (metadata.kind = "product"). Idempotentne. */
export async function handleStripeEvent(d: Deps, ev: StripeEvent): Promise<"paid" | "duplicate" | "ignored"> {
  if (ev.type !== "checkout.session.completed" && ev.type !== "checkout.session.async_payment_succeeded") return "ignored";
  const s = ev.data.object;
  if (s.payment_status !== "paid") return "ignored";
  const orderId = s.metadata?.["order_id"];
  const order = orderId ? await d.store.getOrder(orderId) : null;
  if (!order) throw new Error(`Tellimust ei leitud: ${orderId}`);
  if (s.amount_total !== order.priceCents || (s.currency ?? "").toLowerCase() !== "eur") {
    throw new Error(`Makse summa ei klapi: ${s.amount_total} ${s.currency} vs ${order.priceCents} senti`);
  }
  const paid = await d.store.markPaid(order.id, new Date(d.now()).toISOString());
  if (!paid) return "duplicate";
  await sendOrderMails(d, paid);
  return "paid";
}

export async function sendOrderMails(d: Deps, o: Order, opts: { buyerOnly?: boolean } = {}) {
  const link = signedDownloadUrl(d, o.id);
  const consent = new Date(o.consentAt).toLocaleString("et-EE", { timeZone: "Europe/Tallinn" });
  const errors: string[] = [];
  try {
    await d.mail({
      to: o.buyerEmail,
      subject: `Sinu ost: ${o.productTitle}`,
      text: [
        `Aitäh ostu eest! ${o.productTitle} (${euro(o.priceCents)}) on allalaadimiseks valmis.`,
        `Laadi alla (link kehtib ${DOWNLOAD_DAYS} päeva): ${link}`,
        `Nõustusid ${consent}, et digitaalne sisu tehakse kättesaadavaks kohe pärast makset ja et sellega kaob 14-päevane taganemisõigus.`,
        `Tingimused: ${d.siteUrl}/e-poe-tingimused`,
        `Küsimuste korral: ${RENTAL_COMPANY.email}, ${RENTAL_COMPANY.phone}`,
      ].join("\n\n"),
      html: htmlMail(
        "Sinu ost on valmis",
        [
          `Aitäh ostu eest! <b>${esc(o.productTitle)}</b> (${esc(euro(o.priceCents))}) on allalaadimiseks valmis.`,
          `Allalaadimislink kehtib ${DOWNLOAD_DAYS} päeva. Kui see aegub, kirjuta meile ja saadame uue.`,
          `Kinnitus: nõustusid ${esc(consent)}, et digitaalne sisu tehakse kättesaadavaks kohe pärast makset ja et sellega kaob 14-päevane taganemisõigus.`,
          `Tingimused: <a href="${esc(d.siteUrl)}/e-poe-tingimused">${esc(d.siteUrl)}/e-poe-tingimused</a>`,
        ],
        { href: link, label: "Laadi alla" },
      ),
    });
  } catch (e) {
    errors.push(`ostja kiri: ${(e as Error).message}`);
  }
  if (d.ownerEmail && !opts.buyerOnly) {
    try {
      const lines = [
        `Uus e-poe ost: ${o.productTitle}, ${euro(o.priceCents)}.`,
        `Ostja: ${o.buyerName || "–"} <${o.buyerEmail}>`,
        `Tellimus: ${o.id}`,
      ];
      await d.mail({
        to: d.ownerEmail,
        subject: `Uus e-poe ost: ${o.productTitle} (${euro(o.priceCents)})`,
        text: lines.join("\n"),
        html: htmlMail("Uus e-poe ost", lines.map(esc), { href: `${d.siteUrl}/haldus`, label: "Ava haldus" }),
      });
    } catch (e) {
      errors.push(`omaniku kiri: ${(e as Error).message}`);
    }
  }
  if (errors.length) {
    console.error(`[e-pood ${o.id}] e-kiri ebaõnnestus`);
    await d.store.addNote(o.id, `E-kiri ebaõnnestus ${new Date(d.now()).toISOString()}: ${errors.join("; ")}`);
  }
  return errors;
}

export async function purchaseResult(d: Deps, sessionId: string) {
  const o = await d.store.getOrderBySession(sessionId);
  if (!o) return { state: "unknown" as const };
  if (o.status !== "paid") return { state: "pending" as const };
  return {
    state: "ready" as const,
    title: o.productTitle,
    email: o.buyerEmail,
    downloadUrl: signedDownloadUrl(d, o.id),
  };
}

/** Allalaadimine: kontrollib allkirja ja makset, tagastab lühiajalise salvelingi. */
export async function resolveDownload(d: Deps, orderId: string, exp: number, sig: string) {
  if (!verifyDownloadSig(d, orderId, exp, sig)) return { ok: false as const, reason: "link" as const };
  const o = await d.store.getOrder(orderId);
  if (!o || o.status !== "paid" || !o.productId) return { ok: false as const, reason: "order" as const };
  const p = await d.store.getProduct(o.productId);
  if (!p?.filePath) return { ok: false as const, reason: "file" as const };
  await d.store.addDownload(o.id);
  return { ok: true as const, url: await d.files.downloadUrl(p.filePath, p.fileName ?? "fail") };
}

/* ---------- haldus ---------- */

export async function saveProduct(d: Deps, input: ProductInput) {
  const slug = slugify(input.slug || input.title);
  if (!slug) throw new Error("Tootel peab olema nimi");
  const clash = await d.store.getProductBySlug(slug);
  if (clash && clash.id !== input.id) throw new Error(`Aadress /pood/${slug} on juba teisel tootel kasutusel`);
  if (input.active && input.kind === "digital" && !input.filePath) throw new Error("Avaldamiseks lisa tootele fail");
  return d.store.saveProduct({ ...input, slug });
}

export async function uploadTicket(d: Deps, what: "file" | "image", fileName: string) {
  const ext = (fileName.split(".").pop() ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const allowed = what === "image" ? ["jpg", "jpeg", "png", "webp"] : ["pdf", "docx", "doc", "xlsx", "xls", "zip", "odt", "ods"];
  if (!allowed.includes(ext)) throw new Error(`Lubatud failitüübid: ${allowed.join(", ")}`);
  const bucket = what === "image" ? "product-images" : "product-files";
  const path = `${randomUUID()}.${ext}`;
  return { bucket, ...(await d.files.uploadTicket(bucket, path)) };
}

/* ---------- tootmise sõltuvused ---------- */

type Row = Record<string, unknown>;
const toProduct = (r: Row): Product => ({
  id: r["id"] as string,
  slug: r["slug"] as string,
  title: r["title"] as string,
  short: (r["short"] as string) ?? "",
  description: (r["description"] as string) ?? "",
  category: (r["category"] as string) ?? "",
  kind: r["kind"] as Product["kind"],
  priceCents: r["price_cents"] as number,
  imagePath: (r["image_path"] as string | null) ?? null,
  filePath: (r["file_path"] as string | null) ?? null,
  fileName: (r["file_name"] as string | null) ?? null,
  active: r["active"] as boolean,
  sort: (r["sort"] as number) ?? 0,
});
const fromProduct = (p: ProductInput) => ({
  slug: p.slug,
  title: p.title,
  short: p.short,
  description: p.description,
  category: p.category,
  kind: p.kind,
  price_cents: p.priceCents,
  image_path: p.imagePath,
  file_path: p.filePath,
  file_name: p.fileName,
  active: p.active,
  sort: p.sort,
  updated_at: new Date().toISOString(),
});
const toOrder = (r: Row): Order => ({
  id: r["id"] as string,
  productId: (r["product_id"] as string | null) ?? null,
  productTitle: r["product_title"] as string,
  priceCents: r["price_cents"] as number,
  buyerName: (r["buyer_name"] as string) ?? "",
  buyerEmail: r["buyer_email"] as string,
  consentAt: r["consent_at"] as string,
  status: r["status"] as Order["status"],
  sessionId: (r["stripe_session_id"] as string | null) ?? null,
  paidAt: (r["paid_at"] as string | null) ?? null,
  downloads: (r["downloads"] as number) ?? 0,
  notes: (r["notes"] as string) ?? "",
  createdAt: r["created_at"] as string,
});

export async function supabaseStore(): Promise<Store> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // Tabelid: migratsioon 20261119120000_shop_products.sql
  const db = supabaseAdmin as unknown as { from: (t: string) => any }; // eslint-disable-line @typescript-eslint/no-explicit-any
  const must = <T>(r: { data: T; error: { message: string } | null }) => {
    if (r.error) throw new Error(r.error.message);
    return r.data;
  };
  return {
    async listProducts({ activeOnly }) {
      let q = db.from("products").select("*");
      if (activeOnly) q = q.eq("active", true);
      const r = must(await q.order("category").order("sort").order("title")) as Row[];
      return r.map(toProduct);
    },
    async getProduct(id) {
      const r = must(await db.from("products").select("*").eq("id", id).maybeSingle()) as Row | null;
      return r ? toProduct(r) : null;
    },
    async getProductBySlug(slug) {
      const r = must(await db.from("products").select("*").eq("slug", slug).maybeSingle()) as Row | null;
      return r ? toProduct(r) : null;
    },
    async saveProduct(p) {
      const row = fromProduct(p);
      const r = p.id
        ? must(await db.from("products").update(row).eq("id", p.id).select("*").single())
        : must(await db.from("products").insert(row).select("*").single());
      return toProduct(r as Row);
    },
    async insertOrder(o) {
      const r = must(
        await db
          .from("product_orders")
          .insert({
            product_id: o.productId,
            product_title: o.productTitle,
            price_cents: o.priceCents,
            buyer_name: o.buyerName,
            buyer_email: o.buyerEmail,
            consent_at: o.consentAt,
          })
          .select("id")
          .single(),
      ) as { id: string };
      return r.id;
    },
    async setOrderSession(id, sessionId) {
      must(await db.from("product_orders").update({ stripe_session_id: sessionId }).eq("id", id));
    },
    async getOrder(id) {
      const r = must(await db.from("product_orders").select("*").eq("id", id).maybeSingle()) as Row | null;
      return r ? toOrder(r) : null;
    },
    async getOrderBySession(sessionId) {
      const r = must(await db.from("product_orders").select("*").eq("stripe_session_id", sessionId).maybeSingle()) as Row | null;
      return r ? toOrder(r) : null;
    },
    async markPaid(id, paidAt) {
      const r = must(
        await db.from("product_orders").update({ status: "paid", paid_at: paidAt }).eq("id", id).eq("status", "pending").select("*").maybeSingle(),
      ) as Row | null;
      return r ? toOrder(r) : null;
    },
    async addDownload(id) {
      const o = must(await db.from("product_orders").select("downloads").eq("id", id).single()) as { downloads: number };
      must(await db.from("product_orders").update({ downloads: o.downloads + 1 }).eq("id", id));
    },
    async addNote(id, note) {
      const o = must(await db.from("product_orders").select("notes").eq("id", id).single()) as { notes: string };
      must(await db.from("product_orders").update({ notes: `${o.notes}\n${note}`.trim() }).eq("id", id));
    },
    async listOrders(limit) {
      const r = must(
        await db.from("product_orders").select("*").eq("status", "paid").order("paid_at", { ascending: false }).limit(limit),
      ) as Row[];
      return r.map(toOrder);
    },
  };
}

export async function supabaseFiles(): Promise<Files> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const base = (process.env["SUPABASE_URL"] ?? "").trim().replace(/\/$/, "");
  return {
    async downloadUrl(path, fileName) {
      const r = await supabaseAdmin.storage.from("product-files").createSignedUrl(path, 60, { download: fileName });
      if (r.error || !r.data) throw new Error(r.error?.message ?? "Faili linki ei saanud luua");
      return r.data.signedUrl;
    },
    async uploadTicket(bucket, path) {
      const r = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
      if (r.error || !r.data) throw new Error(r.error?.message ?? "Üleslaadimise luba ei saanud luua");
      return { path: r.data.path, token: r.data.token };
    },
    imageUrl(path) {
      return `${base}/storage/v1/object/public/product-images/${path}`;
    },
  };
}

export async function prodDeps(origin?: string): Promise<Deps> {
  const g = await import("@/lib/giftcards.server");
  const base = await g.prodDeps(origin);
  return {
    store: await supabaseStore(),
    files: await supabaseFiles(),
    mail: base.mail,
    checkout: base.checkout,
    now: base.now,
    siteUrl: base.siteUrl,
    ownerEmail: base.ownerEmail,
    secret: base.secret,
  };
}
