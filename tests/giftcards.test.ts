/* Kinkekaartide voo testid ilma andmebaasi, Stripe'i ja MailerSendita.
   Käivita: npx -y bun@1 test tests/giftcards.test.ts */
import { createHmac } from "node:crypto";
import { describe, expect, test } from "bun:test";
import {
  CARD_NR_RE,
  adminToken,
  checkPassword,
  handleStripeEvent,
  issueCard,
  purchaseResult,
  readCard,
  remaining,
  SoldOutError,
  setCardState,
  signedPdfUrl,
  startCheckout,
  verifyAdminToken,
  verifyPdfSig,
  verifyStripeSignature,
  type Card,
  type Deps,
  type Mail,
  type Order,
  type Store,
} from "../src/lib/giftcards.server";
import { TOTAL_STOCK } from "../src/lib/giftcards.config";

type MemOrder = Order & { createdAt: string };
function memoryStore(clock: () => number): Store & { cards: Map<string, Card>; orders: Map<string, MemOrder> } {
  const orders = new Map<string, MemOrder>();
  const cards = new Map<string, Card>();
  let n = 0;
  return {
    orders,
    cards,
    async insertOrder(o) {
      const id = `order-${++n}`;
      orders.set(id, { ...o, id, sessionId: null, createdAt: new Date(clock()).toISOString() });
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
    async getCard(nr) {
      return cards.get(nr) ?? null;
    },
    async getCardByPayment(p) {
      return [...cards.values()].find((c) => c.paymentId === p) ?? null;
    },
    async insertCard(c) {
      if (c.paymentId && [...cards.values()].some((x) => x.paymentId === c.paymentId)) return "duplicate_payment";
      if (cards.has(c.nr)) return "duplicate_number";
      cards.set(c.nr, { ...c });
      return "ok";
    },
    async updateCard(nr, patch) {
      const c = cards.get(nr);
      if (!c) return null;
      Object.assign(c, patch);
      return { ...c };
    },
    async listCards({ printQueue, limit }) {
      return [...cards.values()].filter((c) => !printQueue || c.printStatus === "ootab_printimist").slice(0, limit);
    },
    async countIssued() {
      return [...cards.values()].filter((c) => c.status !== "tühistatud").length;
    },
    async countReserved(since) {
      return [...orders.values()].filter(
        (o) => o.sessionId && o.createdAt >= since && ![...cards.values()].some((c) => c.orderId === o.id),
      ).length;
    },
    async expire(today) {
      for (const c of cards.values()) if (c.status === "aktiivne" && c.validUntil < today) c.status = "aegunud";
    },
  };
}

function setup(nowMs = Date.UTC(2026, 10, 17, 10)) {
  let now = nowMs;
  const store = memoryStore(() => now);
  const mails: Mail[] = [];
  const sessions: { orderId: string; lines: { name: string; cents: number }[]; expiresAt: number }[] = [];
  const d: Deps = {
    store,
    mail: async (m) => {
      mails.push(m);
    },
    checkout: {
      async createSession(a) {
        sessions.push(a);
        return { id: `cs_test_${sessions.length}`, url: `https://checkout.stripe.test/${sessions.length}` };
      },
    },
    pdf: async (_c, o) => new Uint8Array([o.bleed ? 2 : 1]),
    now: () => now,
    siteUrl: "https://example.test",
    ownerEmail: "omanik@example.test",
    secret: "x".repeat(40),
  };
  return { d, store, mails, sessions, setNow: (t: number) => (now = t) };
}

const order = {
  design: "tartu",
  amount: 75,
  recipient: "Mari",
  delivery: "digital" as const,
  envelope: "",
  buyerName: "Ostja Olev",
  buyerEmail: "olev@example.test",
  buyerPhone: "",
};
const paid = (sessionId: string, orderId: string, cents: number, type = "checkout.session.completed") => ({
  type,
  data: { object: { id: sessionId, payment_status: "paid", amount_total: cents, currency: "eur", metadata: { order_id: orderId } } },
});

describe("kinkekaardid", () => {
  test("digitaalne ost: hind serveris, kaart alles webhookiga, e-kirjad", async () => {
    const { d, store, mails, sessions } = setup();
    const r = await startCheckout(d, order, "https://example.test");
    expect(r.url).toContain("checkout.stripe.test");
    expect(sessions[0]!.lines).toEqual([{ name: "Kinkekaart 75 € (Tartu)", cents: 7500 }]);
    expect(store.cards.size).toBe(0);
    expect((await purchaseResult(d, "cs_test_1")).state).toBe("pending");

    expect(await handleStripeEvent(d, paid("cs_test_1", "order-1", 7500))).toBe("issued");
    const card = [...store.cards.values()][0]!;
    expect(card.nr).toMatch(CARD_NR_RE);
    expect(card.nr.startsWith("SQ-2611-")).toBe(true);
    expect(card.validUntil).toBe("2027-11-17");
    expect(card.printStatus).toBeNull();
    expect(mails.map((m) => m.to)).toEqual(["olev@example.test", "omanik@example.test"]);
    expect(mails[0]!.subject).toBe(`Sinu Squeaky Cleani kinkekaart ${card.nr}`);
    expect(mails[0]!.attachments?.[0]?.content[0]).toBe(1); // kliendi PDF ilma lõikevaruta
    expect(mails[1]!.attachments).toEqual([]);

    const res = await purchaseResult(d, "cs_test_1");
    expect(res.state).toBe("ready");
  });

  test("prinditud ost: lisatasu, trükifail omanikule, ootab printimist", async () => {
    const { d, store, mails, sessions } = setup();
    await startCheckout(
      d,
      { ...order, delivery: "print", address: { name: "Mari", street: "Rüütli 1", city: "Tartu", zip: "51007" }, envelope: "Palju õnne!" },
      "https://example.test",
    );
    expect(sessions[0]!.lines.map((l) => l.cents)).toEqual([7500, 500]);
    await handleStripeEvent(d, paid("cs_test_1", "order-1", 8000));
    const card = [...store.cards.values()][0]!;
    expect(card.printStatus).toBe("ootab_printimist");
    expect(card.envelope).toBe("Palju õnne!");
    expect(mails[1]!.subject.startsWith("PRINDI:")).toBe(true);
    expect(mails[1]!.attachments?.[0]?.content[0]).toBe(2); // trükifail lõikevaruga
    expect(mails[0]!.text).toContain("Rüütli 1");
    await setCardState(d, card.nr, "posted");
    expect(store.cards.get(card.nr)!.printStatus).toBe("postitatud");
  });

  test("sama webhook kaks korda ei loo kahte kaarti ega saada kirju uuesti", async () => {
    const { d, store, mails } = setup();
    await startCheckout(d, order, "https://example.test");
    expect(await handleStripeEvent(d, paid("cs_test_1", "order-1", 7500))).toBe("issued");
    expect(await handleStripeEvent(d, paid("cs_test_1", "order-1", 7500, "checkout.session.async_payment_succeeded"))).toBe("duplicate");
    expect(store.cards.size).toBe(1);
    expect(mails.length).toBe(2);
  });

  test("katkestatud või maksmata makse ei loo kaarti; vale summa lükatakse tagasi", async () => {
    const { d, store } = setup();
    await startCheckout(d, order, "https://example.test");
    const unpaid = paid("cs_test_1", "order-1", 7500);
    unpaid.data.object.payment_status = "unpaid";
    expect(await handleStripeEvent(d, unpaid)).toBe("ignored");
    expect(await handleStripeEvent(d, { type: "checkout.session.expired", data: { object: { id: "cs_test_1" } } })).toBe("ignored");
    await expect(handleStripeEvent(d, paid("cs_test_1", "order-1", 100))).rejects.toThrow();
    expect(store.cards.size).toBe(0);
  });

  test("aegunud ja kasutatud kaart halduses", async () => {
    const { d, setNow } = setup();
    const { card } = await issueCard(d, {
      order: { ...order, printFee: 0 },
      provider: "käsitsi",
      paymentId: null,
      paidAt: null,
      sendMail: false,
    });
    await setCardState(d, card.nr, "used");
    expect((await readCard(d, card.nr))!.status).toBe("kasutatud");
    await expect(setCardState(d, card.nr, "used")).rejects.toThrow();
    await setCardState(d, card.nr, "reactivate");

    setNow(Date.UTC(2027, 10, 18, 10)); // päev pärast kehtivuse lõppu
    expect((await readCard(d, card.nr))!.status).toBe("aegunud");
    await expect(setCardState(d, card.nr, "used")).rejects.toThrow();
  });

  test("laoseis: üks ühine kogus kõigi kujunduste peale, pooleli makse reserveerib, tühistatud vabastab", async () => {
    const { d, store, setNow } = setup();
    const start = Date.UTC(2026, 10, 17, 10);
    const limit = TOTAL_STOCK!;
    expect(limit).toBe(6);
    // Erinevad kujundused võtavad samast kogusest.
    for (let i = 1; i <= limit; i++) await startCheckout(d, { ...order, design: i % 2 ? "tartu" : "roosa" }, "https://example.test");
    expect(await remaining(d)).toBe(0);
    await expect(startCheckout(d, { ...order, design: "joulud" }, "https://example.test")).rejects.toBeInstanceOf(SoldOutError);

    await handleStripeEvent(d, paid("cs_test_1", "order-1", 7500)); // üks makstud
    setNow(start + 32 * 60_000); // ülejäänud pooleli maksed aegusid
    expect(await remaining(d)).toBe(limit - 1);
    await startCheckout(d, order, "https://example.test");
    expect(await remaining(d)).toBe(limit - 2);

    const nr = [...store.cards.values()][0]!.nr;
    await setCardState(d, nr, "cancel");
    expect(await remaining(d)).toBe(limit - 1);
  });

  test("ühekordne kasutus: kasutatud kaarti ei saa uuesti kasutatuks märkida", async () => {
    const { d } = setup();
    const { card } = await issueCard(d, { order: { ...order, printFee: 0 }, provider: "käsitsi", paymentId: null, paidAt: null, sendMail: false });
    await setCardState(d, card.nr, "used");
    await expect(setCardState(d, card.nr, "used")).rejects.toThrow(/kasutatud/);
    await setCardState(d, card.nr, "cancel");
    await expect(setCardState(d, card.nr, "used")).rejects.toThrow(/tühistatud/);
  });

  test("allkirjad: PDF-link, haldus ja Stripe'i webhook", () => {
    const { d, setNow } = setup();
    const u = new URL(signedPdfUrl(d, "SQ-2611-ABCD"));
    const exp = Number(u.searchParams.get("exp"));
    const sig = u.searchParams.get("sig")!;
    expect(verifyPdfSig(d, "SQ-2611-ABCD", exp, sig)).toBe(true);
    expect(verifyPdfSig(d, "SQ-2611-ABCE", exp, sig)).toBe(false);
    setNow(Date.UTC(2026, 11, 18)); // 31 päeva hiljem
    expect(verifyPdfSig(d, "SQ-2611-ABCD", exp, sig)).toBe(false);

    const t = adminToken(d);
    expect(verifyAdminToken(d, t)).toBe(true);
    expect(verifyAdminToken(d, t.replace(/.$/, "x"))).toBe(false);
    expect(checkPassword("pikk-salasõna-123", "pikk-salasõna-123")).toBe(true);
    expect(checkPassword("vale", "pikk-salasõna-123")).toBe(false);
    expect(checkPassword("lühike", "lühike")).toBe(false);
    expect(checkPassword("", "")).toBe(false);

    const secret = "whsec_test";
    const body = JSON.stringify({ a: 1 });
    const ts = Math.floor(Date.now() / 1000);
    const v1 = createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
    expect(verifyStripeSignature(body, `t=${ts},v1=${v1}`, secret, Date.now())).toBe(true);
    expect(verifyStripeSignature(body + " ", `t=${ts},v1=${v1}`, secret, Date.now())).toBe(false);
    expect(verifyStripeSignature(body, `t=${ts - 1000},v1=${v1}`, secret, Date.now())).toBe(false);
    expect(verifyStripeSignature(body, null, secret, Date.now())).toBe(false);
  });
});
