import { useEffect, useState, type FormEvent } from "react";
import { adminProducts, adminResendProductMail, adminSaveProduct, adminUploadTicket } from "@/lib/shop.functions";
import { euro } from "@/lib/shop.shared";
import { fmtDate } from "@/lib/giftcards.config";

/* Halduse e-poe osa: tooted (lisamine, muutmine, avaldamine) ja makstud tellimused. */

type Data = Awaited<ReturnType<typeof adminProducts>>;
type AdminProduct = Data["products"][number];

const input = "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
const btn = "inline-flex h-9 items-center rounded-full border border-border px-4 text-sm hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";
const btnGold = "inline-flex h-10 items-center rounded-full bg-gold px-6 text-sm font-semibold text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

const errText = (e: unknown) => (e instanceof Error ? e.message : "Midagi läks valesti");

async function upload(what: "file" | "image", file: File) {
  const t = await adminUploadTicket({ data: { what, fileName: file.name } });
  const { supabase } = await import("@/integrations/supabase/client");
  const r = await supabase.storage.from(t.bucket).uploadToSignedUrl(t.path, t.token, file, file.type ? { contentType: file.type } : {});
  if (r.error) throw new Error(`Üleslaadimine ebaõnnestus: ${r.error.message}`);
  return t.path;
}

export function AdminProducts() {
  const [data, setData] = useState<Data | null>(null);
  const [loadErr, setLoadErr] = useState("");
  const [editing, setEditing] = useState<AdminProduct | "new" | null>(null);

  async function reload() {
    try {
      setData(await adminProducts());
      setLoadErr("");
    } catch (e) {
      setLoadErr(errText(e));
    }
  }
  useEffect(() => {
    void reload();
  }, []);

  return (
    <>
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl font-light">E-poe tooted</h2>
          {editing === null && (
            <button type="button" className={btnGold} onClick={() => setEditing("new")}>
              + Lisa toode
            </button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Toode on poes nähtav, kui „Avaldatud“ on märgitud. Digitootel peab olema fail, mille ostja saab alla laadida.
        </p>
        {loadErr && <p role="alert" className="mt-3 text-sm text-destructive">Tooteid ei saanud laadida: {loadErr}</p>}

        {editing !== null && (
          <ProductForm
            key={editing === "new" ? "new" : editing.id}
            product={editing === "new" ? null : editing}
            onDone={(saved) => {
              setEditing(null);
              if (saved) void reload();
            }}
          />
        )}

        <div className="mt-4 space-y-3">
          {data?.products.length === 0 && <p className="text-sm text-muted-foreground">Tooteid pole veel lisatud.</p>}
          {data?.products.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-border p-4">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt="" className="size-14 rounded-lg object-cover" />
              ) : (
                <div className="size-14 rounded-lg bg-secondary" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium">{p.title}</p>
                <p className="text-sm text-muted-foreground">
                  {euro(p.priceCents)} · /pood/{p.slug} · {p.fileName ?? "fail puudub"}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs ${p.active ? "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-secondary text-muted-foreground"}`}
              >
                {p.active ? "avaldatud" : "peidus"}
              </span>
              {p.active && (
                <a href={`/pood/${p.slug}`} target="_blank" rel="noreferrer" className={btn}>
                  Vaata
                </a>
              )}
              <button type="button" className={btn} onClick={() => setEditing(p)}>
                Muuda
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl font-light">E-poe tellimused</h2>
        <div className="mt-3 space-y-3">
          {data?.orders.length === 0 && <p className="text-sm text-muted-foreground">Makstud tellimusi veel pole.</p>}
          {data?.orders.map((o) => <OrderRow key={o.id} o={o} />)}
        </div>
      </section>
    </>
  );
}

function OrderRow({ o }: { o: Data["orders"][number] }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function resend() {
    setBusy(true);
    setMsg("");
    try {
      const r = await adminResendProductMail({ data: { orderId: o.id } });
      setMsg(`Kiri saadetud: ${r.to}`);
    } catch (e) {
      setMsg(errText(e));
    }
    setBusy(false);
  }
  return (
    <div className="rounded-xl border border-border p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium">
            {o.productTitle} · {euro(o.priceCents)}
          </p>
          <p className="text-muted-foreground">
            {o.buyerName ? `${o.buyerName}, ` : ""}
            {o.buyerEmail} · {o.paidAt ? fmtDate(o.paidAt) : ""} · alla laaditud {o.downloads}×
          </p>
        </div>
        <button type="button" disabled={busy} className={btn} onClick={resend}>
          Saada kiri uuesti
        </button>
      </div>
      {o.notes && <p className="mt-2 whitespace-pre-line text-xs text-muted-foreground">{o.notes}</p>}
      {msg && <p role="status" className="mt-2 text-xs">{msg}</p>}
    </div>
  );
}

function ProductForm({ product, onDone }: { product: AdminProduct | null; onDone: (saved: boolean) => void }) {
  const [f, setF] = useState({
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    short: product?.short ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    price: product ? String(product.priceCents / 100).replace(".", ",") : "",
    sort: String(product?.sort ?? 0),
    active: product?.active ?? false,
  });
  const [imagePath, setImagePath] = useState(product?.imagePath ?? null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl ?? null);
  const [file, setFile] = useState({ path: product?.filePath ?? null, name: product?.fileName ?? null });
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  async function pick(what: "file" | "image", list: FileList | null) {
    const picked = list?.[0];
    if (!picked) return;
    setBusy(what === "image" ? "Laen pilti üles…" : "Laen faili üles…");
    setMsg("");
    try {
      const path = await upload(what, picked);
      if (what === "image") {
        setImagePath(path);
        setImagePreview(URL.createObjectURL(picked));
      } else {
        setFile({ path, name: picked.name });
      }
    } catch (e) {
      setMsg(errText(e));
    }
    setBusy("");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    const priceCents = Math.round(Number(f.price.replace(",", ".").replace(/\s|€/g, "")) * 100);
    if (!Number.isFinite(priceCents) || priceCents < 50) {
      setMsg("Hind peab olema vähemalt 0,50 €.");
      return;
    }
    if (f.title.trim().length < 2) {
      setMsg("Kirjuta tootele nimi.");
      return;
    }
    setBusy("Salvestan…");
    setMsg("");
    try {
      await adminSaveProduct({
        data: {
          ...(product ? { id: product.id } : {}),
          slug: f.slug,
          title: f.title,
          short: f.short,
          description: f.description,
          category: f.category,
          kind: "digital",
          priceCents,
          imagePath,
          filePath: file.path,
          fileName: file.name,
          active: f.active,
          sort: Number.parseInt(f.sort, 10) || 0,
        },
      });
      onDone(true);
    } catch (e) {
      setMsg(errText(e));
      setBusy("");
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 grid gap-4 rounded-2xl border border-gold/60 p-5 sm:grid-cols-2">
      <h3 className="font-display text-xl font-light sm:col-span-2">{product ? "Muuda toodet" : "Uus toode"}</h3>
      <label className="text-sm">
        <span className="mb-1 block">Nimi</span>
        <input required maxLength={120} value={f.title} onChange={set("title")} className={input} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Hind (€)</span>
        <input inputMode="decimal" placeholder="9,90" value={f.price} onChange={set("price")} className={input} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Kategooria (valikuline)</span>
        <input maxLength={60} placeholder="Üüriturg" value={f.category} onChange={set("category")} className={input} />
      </label>
      <label className="text-sm">
        <span className="mb-1 block">Aadress (jäta tühjaks, tehakse nimest)</span>
        <input maxLength={80} placeholder="uuripakett" value={f.slug} onChange={set("slug")} className={input} />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block">Lühikirjeldus (näha tootekaardil)</span>
        <input maxLength={300} value={f.short} onChange={set("short")} className={input} />
      </label>
      <label className="text-sm sm:col-span-2">
        <span className="mb-1 block">Pikk kirjeldus (lõigud eralda tühja reaga)</span>
        <textarea rows={7} maxLength={5000} value={f.description} onChange={set("description")} className={`${input} h-auto py-2`} />
      </label>

      <div className="text-sm">
        <span className="mb-1 block">Pilt (jpg, png, webp, kuni 5 MB)</span>
        <div className="flex items-center gap-3">
          {imagePreview ? <img src={imagePreview} alt="" className="size-16 rounded-lg object-cover" /> : <div className="size-16 rounded-lg bg-secondary" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={!!busy} onChange={(e) => void pick("image", e.target.files)} className="text-xs" />
        </div>
        {imagePath && (
          <button type="button" className="mt-2 text-xs underline" onClick={() => { setImagePath(null); setImagePreview(null); }}>
            Eemalda pilt
          </button>
        )}
      </div>
      <div className="text-sm">
        <span className="mb-1 block">Müüdav fail (pdf, docx, xlsx, zip…, kuni 50 MB)</span>
        <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.odt,.ods" disabled={!!busy} onChange={(e) => void pick("file", e.target.files)} className="text-xs" />
        <p className="mt-2 text-xs text-muted-foreground">{file.name ? `Praegu: ${file.name}` : "Faili pole veel lisatud."}</p>
      </div>

      <label className="text-sm">
        <span className="mb-1 block">Järjekord (väiksem number eespool)</span>
        <input inputMode="numeric" value={f.sort} onChange={set("sort")} className={input} />
      </label>
      <label className="flex items-center gap-3 self-end text-sm">
        <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} className="size-4 accent-[#b8913b]" />
        Avaldatud (näha poes ja ostetav)
      </label>

      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button disabled={!!busy} className={btnGold}>
          {busy || "Salvesta"}
        </button>
        <button type="button" disabled={busy === "Salvestan…"} className={btn} onClick={() => onDone(false)}>
          Loobu
        </button>
        {msg && <p role="alert" className="text-sm text-destructive">{msg}</p>}
      </div>
    </form>
  );
}
