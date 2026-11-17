import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  adminCardAction,
  adminFindCard,
  adminIssueCard,
  adminLogin,
  adminLogout,
  adminOverview,
  adminStatus,
} from "@/lib/giftcards.functions";
import { AMOUNTS, DESIGNS, MAX_AMOUNT, MIN_AMOUNT, designById, fmtDate, type DesignId } from "@/lib/giftcards.config";
import type { Card } from "@/lib/giftcards.server";

/* Kinkekaartide haldus (ainult omanikule, parool keskkonnamuutujas ADMIN_PASSWORD). */
export const Route = createFileRoute("/haldus")({
  head: () => ({ meta: [{ title: "Haldus | Squeaky Clean" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Page,
});

const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const btn = "inline-flex h-9 items-center rounded-full border border-border px-4 text-sm hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const btnGold = "inline-flex h-10 items-center rounded-full bg-gold px-6 text-sm font-semibold text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const STATUS_CLS: Record<string, string> = {
  aktiivne: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
  kasutatud: "bg-secondary text-muted-foreground",
  aegunud: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  tühistatud: "bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-200",
};
const pdfHref = (nr: string, bleed = false) => `/api/kinkekaart/haldus-pdf?nr=${encodeURIComponent(nr)}${bleed ? "&bleed=1" : ""}`;

function Page() {
  const [logged, setLogged] = useState<boolean | null>(null);
  useEffect(() => {
    void adminStatus().then((r) => setLogged(r.loggedIn)).catch(() => setLogged(false));
  }, []);
  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Squeaky Clean</p>
        <h1 className="mt-2 font-display text-3xl font-light">Kinkekaartide haldus</h1>
        {logged === null ? null : logged ? <Admin onLogout={() => setLogged(false)} /> : <Login onOk={() => setLogged(true)} />}
      </div>
    </main>
  );
}

function Login({ onOk }: { onOk: () => void }) {
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const r = await adminLogin({ data: { password: pw } }).catch(() => ({ ok: false }));
    setBusy(false);
    if (r.ok) onOk();
    else setMsg("Vale parool. Proovi uuesti.");
  }
  return (
    <form onSubmit={submit} className="mt-8 max-w-sm space-y-3">
      <label htmlFor="pw" className="block text-sm font-medium">
        Parool
      </label>
      <input id="pw" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className={input} />
      {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
      <button className={btnGold} disabled={busy}>
        Logi sisse
      </button>
    </form>
  );
}

function CardRow({ c, onChange }: { c: Card; onChange: (c: Card) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function act(action: "used" | "cancel" | "posted" | "reactivate") {
    if (action === "cancel" && !window.confirm(`Tühistan kaardi ${c.nr}? Seda ei saa tagasi võtta.`)) return;
    setBusy(true);
    setErr("");
    try {
      const r = await adminCardAction({ data: { nr: c.nr, action } });
      if (r.card) onChange(r.card);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-lg">{c.nr}</p>
        <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ${STATUS_CLS[c.status] ?? ""}`}>{c.status}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {c.amount} € · {designById(c.design)?.name ?? c.design} · kehtib kuni {fmtDate(c.validUntil)}
        {c.recipient ? ` · kellele: ${c.recipient}` : ""}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Ostja: {c.buyerName || "–"} {c.buyerEmail ? `<${c.buyerEmail}>` : ""} {c.buyerPhone} · makse: {c.provider}
        {c.usedAt ? ` · kasutatud ${fmtDate(c.usedAt)}` : ""}
      </p>
      {c.delivery === "print" && (
        <p className="mt-2 text-sm">
          <b>Postiga:</b> {c.address ? `${c.address.name}, ${c.address.street}, ${c.address.zip} ${c.address.city}` : "–"} ·{" "}
          {c.printStatus === "postitatud" ? "postitatud" : "ootab printimist"}
          {c.envelope && <span className="block text-muted-foreground">Ümbrikusse: „{c.envelope}”</span>}
        </p>
      )}
      {c.notes && <p className="mt-2 whitespace-pre-line text-xs text-amber-800 dark:text-amber-300">{c.notes}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        {c.status === "aktiivne" && (
          <button className={btn} disabled={busy} onClick={() => act("used")}>
            Märgi kasutatuks
          </button>
        )}
        {c.status === "kasutatud" && (
          <button className={btn} disabled={busy} onClick={() => act("reactivate")}>
            Märgi uuesti aktiivseks
          </button>
        )}
        {c.status !== "tühistatud" && (
          <button className={btn} disabled={busy} onClick={() => act("cancel")}>
            Tühista
          </button>
        )}
        <a className={btn} href={pdfHref(c.nr)}>
          PDF
        </a>
        {c.delivery === "print" && (
          <>
            <a className={btn} href={pdfHref(c.nr, true)}>
              Laadi trükifail
            </a>
            {c.printStatus !== "postitatud" && (
              <button className={btn} disabled={busy} onClick={() => act("posted")}>
                Märgi postitatuks
              </button>
            )}
          </>
        )}
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}

function Admin({ onLogout }: { onLogout: () => void }) {
  const [data, setData] = useState<{ recent: Card[]; printQueue: Card[] } | null>(null);
  const [q, setQ] = useState("");
  const [found, setFound] = useState<Card | null | "none">(null);
  const [loadErr, setLoadErr] = useState("");
  const reload = () =>
    adminOverview()
      .then(setData)
      .catch((e: Error) => setLoadErr(e.message));
  useEffect(() => {
    void reload();
  }, []);
  const update = (c: Card) => {
    if (found && found !== "none" && found.nr === c.nr) setFound(c);
    void reload();
  };

  async function search(e: FormEvent) {
    e.preventDefault();
    const r = await adminFindCard({ data: { nr: q } });
    setFound(r.card ?? "none");
  }

  return (
    <div className="mt-6 space-y-12">
      <div className="flex justify-end">
        <button className={btn} onClick={() => void adminLogout().then(onLogout)}>
          Logi välja
        </button>
      </div>
      {loadErr && <p role="alert" className="text-sm text-destructive">Andmeid ei saanud laadida: {loadErr}</p>}

      <section>
        <h2 className="font-display text-2xl font-light">Otsi kaarti</h2>
        <form onSubmit={search} className="mt-3 flex max-w-md gap-2">
          <label htmlFor="q" className="sr-only">
            Kaardi number
          </label>
          <input id="q" placeholder="SQ-2611-ABCD" value={q} onChange={(e) => setQ(e.target.value)} className={input} />
          <button className={btnGold}>Otsi</button>
        </form>
        <div className="mt-4">
          {found === "none" && <p className="text-sm text-muted-foreground">Sellise numbriga kaarti ei leitud.</p>}
          {found && found !== "none" && <CardRow c={found} onChange={update} />}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-light">Ootab printimist</h2>
        <div className="mt-3 space-y-3">
          {data?.printQueue.length === 0 && <p className="text-sm text-muted-foreground">Midagi pole printida.</p>}
          {data?.printQueue.map((c) => <CardRow key={c.nr} c={c} onChange={update} />)}
        </div>
      </section>

      <IssueForm onIssued={(c) => { setFound(c); void reload(); }} />

      <section>
        <h2 className="font-display text-2xl font-light">Viimased kaardid</h2>
        <div className="mt-3 space-y-3">
          {data?.recent.length === 0 && <p className="text-sm text-muted-foreground">Kaarte pole veel väljastatud.</p>}
          {data?.recent.map((c) => <CardRow key={c.nr} c={c} onChange={update} />)}
        </div>
      </section>
    </div>
  );
}

function IssueForm({ onIssued }: { onIssued: (c: Card) => void }) {
  const [f, setF] = useState({ design: DESIGNS[0].id as DesignId, amount: "100", recipient: "", buyerName: "", buyerEmail: "", notes: "", sendMail: true });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(f.amount);
    if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      setMsg(`Summa peab olema täisarv ${MIN_AMOUNT}–${MAX_AMOUNT} €.`);
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await adminIssueCard({ data: { ...f, amount } });
      setMsg(`Väljastatud: ${r.card.nr}`);
      onIssued(r.card);
    } catch (e) {
      setMsg(`Ei õnnestunud: ${(e as Error).message}`);
    }
    setBusy(false);
  }
  return (
    <section>
      <h2 className="font-display text-2xl font-light">Väljasta käsitsi</h2>
      <p className="mt-1 text-sm text-muted-foreground">Näiteks kui klient maksis arvega. Makset ei looda.</p>
      <form onSubmit={submit} className="mt-4 grid max-w-2xl gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Kujundus
          <select className={`${input} mt-1`} value={f.design} onChange={(e) => setF({ ...f, design: e.target.value as DesignId })}>
            {DESIGNS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Summa (€)
          <input className={`${input} mt-1`} list="amounts" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/\D/g, "") })} />
          <datalist id="amounts">
            {AMOUNTS.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </label>
        <label className="text-sm">
          Kellele (valikuline)
          <input className={`${input} mt-1`} maxLength={32} value={f.recipient} onChange={(e) => setF({ ...f, recipient: e.target.value })} />
        </label>
        <label className="text-sm">
          Ostja nimi
          <input className={`${input} mt-1`} maxLength={80} value={f.buyerName} onChange={(e) => setF({ ...f, buyerName: e.target.value })} />
        </label>
        <label className="text-sm">
          Ostja e-post (valikuline)
          <input className={`${input} mt-1`} type="email" value={f.buyerEmail} onChange={(e) => setF({ ...f, buyerEmail: e.target.value })} />
        </label>
        <label className="text-sm">
          Märkus
          <input className={`${input} mt-1`} maxLength={500} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="nt arve nr 123" />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={f.sendMail} onChange={(e) => setF({ ...f, sendMail: e.target.checked })} className="size-4 accent-primary" />
          Saada kaart ostja e-postile
        </label>
        <div className="sm:col-span-2">
          <button className={btnGold} disabled={busy}>
            Väljasta kaart
          </button>
          {msg && <p role="status" className="mt-2 text-sm">{msg}</p>}
        </div>
      </form>
    </section>
  );
}
