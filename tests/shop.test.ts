/* E-poe (digitooted) voo testid ilma andmebaasi, Stripe'i ja MailerSendita.
   Käivita: npx -y bun@1 test tests/shop.test.ts */
import { describe, expect, test } from "bun:test";
import {
  NotForSaleError,
  handleStripeEvent,
  publicProduct,
  purchaseResult,
  resolveDownload,
  saveProduct,
  signedDownloadUrl,
  slugify,
  startCheckout,
  uploadTicket,
  verifyDownloadSig,
  type Deps,
  type Order,
  type Product,
  type Store,
} from "../src/lib/shop.server";
import type { Mail } from "../src/lib/giftcards.server";

function memoryStore(): Store & { products: Map<string, Product>; orders: Map<string, Order> } {
  const products = new Map<string, Product>();
  const orders = new Map<string, Order>();
  let n = 0;
  return {
    products,
    orders,
    async listProducts({ activeOnly }) {
      return [...products.values()].filter((p) => !activeOnly || p.active).sort((a, b) => a.sort - b.sort);
    },
    async getProduct(id) {
      return products.get(id) ?? null;
    },
    async getProductBySlug(slug) {
      return [...products.values()].find((p) => p.slug === slug) ?? null;
    },
    async saveProduct(p) {
      const id = p.id ?? `product-${++n}`;
      const saved = { ...p, id };
      products.set(id, saved);
      return saved;
    },
    async insertOrder(o) {
      const id = `order-${++n}`;
      orders.set(id, { ...o, id, status: "pending", sessionId: null, paidAt: null, downloads: 0, notes: "", createdAt: "" });
      return id;
    },
    async setOrderSession(id, sessionId) {
      orders.get(id)!.sessionId = sessionId;
    },
    async getOrder(id) {
      return orders.get(id) ?? null;
    },
    async getOrderBySession(s) {
      return [...orders.values()].find((o) => o.sessionId === s) ?? null;
    },
    async markPaid(id, paidAt) {
      const o = orders.get(id);
      if (!o || o.status !== "pending") return null;
      Object.assign(o, { status: "paid", paidAt });
      return { ...o };
    },
    async addDownload(id) {
      orders.get(id)!.downloads++;
    },
    async addNote(id, note) {
      orders.get(id)!.notes += note;
    },
    async listOrders() {
      return [...orders.values()].filter((o) => o.status === "paid");
    },
  };
}

function setup() {
  const store = memoryStore();
  const mails: Mail[] = [];
  const sessions: { orderId: string; kind?: string; lines: { cents: number }[] }[] = [];
  const d: Deps = {
    store,
    files: {
      async downloadUrl(path, name) {
        return `https://storage.test/${path}?name=${name}`;
      },
      async uploadTicket(_bucket, path) {
        return { path, token: "tok" };
      },
      imageUrl: (path) => `https://img.test/${path}`,
    },
    mail: async (m) => {
      mails.push(m);
    },
    checkout: {
      async createSession(a) {
        sessions.push(a);
        return { id: `cs_${sessions.length}`, url: `https://checkout.test/${sessions.length}` };
      },
    },
    now: () => Date.parse("2026-11-19T10:00:00Z"),
    siteUrl: "https://www.squeakycleanteenused.ee",
    ownerEmail: "omanik@test.ee",
    secret: "x".repeat(40),
  };
  return { d, store, mails, sessions };
}

const base = {
  slug: "",
  title: "Eluruumi üüripakett",
  short: "Leping ja aktid",
  description: "",
  category: "Üüriturg",
  kind: "digital" as const,
  priceCents: 1990,
  imagePath: null,
  filePath: "abc.pdf",
  fileName: "uuripakett.pdf",
  active: true,
  sort: 0,
};

const paidEvent = (orderId: string, amount: number, currency = "eur") => ({
  type: "checkout.session.completed",
  data: { object: { id: "cs_1", payment_status: "paid", amount_total: amount, currency, metadata: { order_id: orderId, kind: "product" } } },
});

describe("e-pood", () => {
  test("slug tehakse nimest, täpitähed lihtsustatakse", () => {
    expect(slugify("Eluruumi üüripakett – 2026!")).toBe("eluruumi-uuripakett-2026");
    expect(slugify("Õuna šokolaad")).toBe("ouna-sokolaad");
  });

  test("toote salvestamine: unikaalne aadress, avaldamiseks on fail kohustuslik", async () => {
    const { d } = setup();
    const p = await saveProduct(d, base);
    expect(p.slug).toBe("eluruumi-uuripakett");
    await expect(saveProduct(d, { ...base, short: "teine" })).rejects.toThrow(/juba teisel tootel/);
    await expect(saveProduct(d, { ...base, slug: "uus", filePath: null })).rejects.toThrow(/lisa tootele fail/);
    expect((await saveProduct(d, { ...base, slug: "mustand", filePath: null, active: false })).active).toBe(false);
    expect((await saveProduct(d, { ...p, title: "Muudetud" })).id).toBe(p.id);
  });

  test("avalik vaade ei näita failiteed", async () => {
    const { d } = setup();
    const pub = publicProduct(d, await saveProduct(d, { ...base, imagePath: "pilt.webp" }));
    expect(pub.fileType).toBe("PDF");
    expect(pub.imageUrl).toBe("https://img.test/pilt.webp");
    expect(JSON.stringify(pub)).not.toContain("abc.pdf");
  });

  test("peidetud toodet ei saa osta", async () => {
    const { d } = setup();
    await saveProduct(d, { ...base, active: false });
    await expect(startCheckout(d, { slug: "eluruumi-uuripakett", buyerName: "", buyerEmail: "a@b.ee" }, "https://x")).rejects.toBeInstanceOf(
      NotForSaleError,
    );
  });

  test("ost: makse → üks kord kirjad, allalaadimine töötab", async () => {
    const { d, store, mails, sessions } = setup();
    await saveProduct(d, base);
    const r = await startCheckout(d, { slug: "eluruumi-uuripakett", buyerName: "Mari", buyerEmail: "mari@test.ee" }, "https://x");
    expect(r.url).toBe("https://checkout.test/1");
    expect(sessions[0]!.kind).toBe("product");
    expect(sessions[0]!.lines[0]!.cents).toBe(1990);
    const orderId = sessions[0]!.orderId;
    expect(store.orders.get(orderId)!.consentAt).toBe("2026-11-19T10:00:00.000Z");

    expect((await purchaseResult(d, "cs_1")).state).toBe("pending");
    expect(await handleStripeEvent(d, paidEvent(orderId, 1990))).toBe("paid");
    expect(await handleStripeEvent(d, paidEvent(orderId, 1990))).toBe("duplicate");
    expect(mails.map((m) => m.to)).toEqual(["mari@test.ee", "omanik@test.ee"]);
    expect(mails[0]!.text).toContain("taganemisõigus");

    const res = await purchaseResult(d, "cs_1");
    expect(res.state).toBe("ready");
    const u = new URL((res as { downloadUrl: string }).downloadUrl);
    const dl = await resolveDownload(d, u.searchParams.get("o")!, Number(u.searchParams.get("exp")), u.searchParams.get("sig")!);
    expect(dl).toEqual({ ok: true, url: "https://storage.test/abc.pdf?name=uuripakett.pdf" });
    expect(store.orders.get(orderId)!.downloads).toBe(1);
  });

  test("vale summa või valuuta lükatakse tagasi", async () => {
    const { d, sessions, mails } = setup();
    await saveProduct(d, base);
    await startCheckout(d, { slug: "eluruumi-uuripakett", buyerName: "", buyerEmail: "a@b.ee" }, "https://x");
    const orderId = sessions[0]!.orderId;
    await expect(handleStripeEvent(d, paidEvent(orderId, 100))).rejects.toThrow(/summa/);
    await expect(handleStripeEvent(d, paidEvent(orderId, 1990, "usd"))).rejects.toThrow(/summa/);
    expect(mails.length).toBe(0);
  });

  test("allalaadimislink: võltsitud või aegunud ei kehti, maksmata tellimus ei saa faili", async () => {
    const { d, sessions } = setup();
    await saveProduct(d, base);
    await startCheckout(d, { slug: "eluruumi-uuripakett", buyerName: "", buyerEmail: "a@b.ee" }, "https://x");
    const orderId = sessions[0]!.orderId;
    const u = new URL(signedDownloadUrl(d, orderId));
    const exp = Number(u.searchParams.get("exp"));
    const sig = u.searchParams.get("sig")!;
    expect(verifyDownloadSig(d, orderId, exp, sig)).toBe(true);
    expect(verifyDownloadSig(d, "order-999", exp, sig)).toBe(false);
    expect(verifyDownloadSig(d, orderId, exp + 1, sig)).toBe(false);
    expect(verifyDownloadSig({ ...d, now: () => (exp + 1) * 1000 }, orderId, exp, sig)).toBe(false);
    expect(await resolveDownload(d, orderId, exp, sig)).toEqual({ ok: false, reason: "order" });
  });

  test("üleslaadimine lubab ainult kindlaid failitüüpe", async () => {
    const { d } = setup();
    expect((await uploadTicket(d, "image", "Pilt.WEBP")).bucket).toBe("product-images");
    expect((await uploadTicket(d, "file", "leping.docx")).path).toMatch(/^[0-9a-f-]{36}\.docx$/);
    await expect(uploadTicket(d, "file", "viirus.exe")).rejects.toThrow(/Lubatud/);
    await expect(uploadTicket(d, "image", "pilt.svg")).rejects.toThrow(/Lubatud/);
  });
});
