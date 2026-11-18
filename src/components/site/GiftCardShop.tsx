import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SectionHeading } from "@/components/site/SectionHeading";
import { CARD_THUMBS, GiftCardPreview } from "@/components/site/GiftCardPreview";
import { giftCardStock, startGiftCardCheckout } from "@/lib/giftcards.functions";
import {
  AMOUNTS,
  DEFAULT_AMOUNT,
  DESIGNS,
  MAX_AMOUNT,
  MIN_AMOUNT,
  PRINT_FEE,
  SHIPPING_TEXT,
  SINGLE_USE_TEXT,
  VALIDITY_MONTHS,
  amountHint,
  cardSizeMm,
  fmtDate,
  validAmount,
  validUntilFrom,
  type DesignId,
} from "@/lib/giftcards.config";

/* Kinkekaardi valik ja ost: kujundus, summa, saaja, kättesaamise viis, ostja andmed ja eelvaade.
   Hind arvutatakse uuesti serveris, siin on see ainult näitamiseks. */

const fieldCls =
  "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string | undefined; hint?: string; children: ReactNode }) {
  return (
    <div className="text-sm">
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-err`} className="mt-1 text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

type Errors = Partial<Record<string, string>>;

export function GiftCardShop({ cancelled }: { cancelled?: boolean }) {
  const [design, setDesign] = useState<DesignId>(DESIGNS[0].id);
  const [amountSel, setAmountSel] = useState(String(DEFAULT_AMOUNT));
  const [custom, setCustom] = useState("");
  const [recipient, setRecipient] = useState("");
  const [delivery, setDelivery] = useState<"digital" | "print">("digital");
  const [addr, setAddr] = useState({ name: "", street: "", city: "", zip: "" });
  const [envelope, setEnvelope] = useState("");
  const [buyer, setBuyer] = useState({ name: "", email: "", phone: "" });
  const [terms, setTerms] = useState(false);
  const [side, setSide] = useState<"front" | "back">("front");
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState("");
  const [website, setWebsite] = useState("");
  const openedAt = useRef(Date.now());
  // Laoseis serverist (null = piiramatu). Kuni see pole laetud, on kõik kujundused valitavad; server kontrollib niikuinii.
  const [stock, setStock] = useState<Record<string, number | null>>({});
  const loadStock = () =>
    giftCardStock()
      .then((s) => {
        setStock(s);
        setDesign((cur) => (s[cur] === 0 ? (DESIGNS.find((x) => s[x.id] !== 0)?.id ?? cur) : cur));
      })
      .catch(() => undefined);
  useEffect(() => {
    void loadStock();
  }, []);
  const soldOut = (id: string) => stock[id] === 0;
  const allSoldOut = DESIGNS.every((x) => soldOut(x.id));

  const d = DESIGNS.find((x) => x.id === design)!;
  const amount = amountSel === "custom" ? validAmount(custom === "" ? NaN : Number(custom)) : Number(amountSel);
  const printFee = delivery === "print" ? PRINT_FEE : 0;
  const total = (amount ?? 0) + printFee;
  const ym = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" }).slice(2, 7).replace("-", "");
  const data = useMemo(
    () => ({ amount, recipient, validUntil: fmtDate(validUntilFrom(new Date())), nr: `SQ-${ym}-····` }),
    [amount, recipient, ym],
  );
  const size = cardSizeMm(d);

  function validate(): Errors {
    const e: Errors = {};
    if (!amount) e["amount"] = `Kirjuta summa täisarvuna ${MIN_AMOUNT} kuni ${MAX_AMOUNT} eurot.`;
    if (recipient.length > 32) e["recipient"] = "Saaja nimi võib olla kuni 32 märki.";
    if (delivery === "print") {
      if (addr.name.trim().length < 2) e["addrName"] = "Kirjuta saaja nimi, kellele ümbrik postitatakse.";
      if (addr.street.trim().length < 3) e["addrStreet"] = "Kirjuta tänav ja maja (ning korteri) number.";
      if (addr.city.trim().length < 2) e["addrCity"] = "Kirjuta linn või asula.";
      if (!/^\d{5}$/.test(addr.zip.trim())) e["addrZip"] = "Postiindeks on 5 numbrit, nt 50090.";
    }
    if (buyer.name.trim().length < 2) e["buyerName"] = "Kirjuta oma nimi.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) e["buyerEmail"] = "Kirjuta e-posti aadress kujul nimi@näide.ee. Saadame kaardi sinna.";
    if (!terms) e["terms"] = "Märgi linnuke, et nõustud kinkekaardi tingimustega.";
    return e;
  }

  async function pay() {
    setFailure("");
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.getElementById(`gc-${Object.keys(e)[0]}`);
      first?.focus();
      return;
    }
    setSending(true);
    try {
      const r = await startGiftCardCheckout({
        data: {
          design,
          amount: amount!,
          recipient: recipient.trim(),
          delivery,
          ...(delivery === "print" ? { address: { ...addr } } : {}),
          envelope: delivery === "print" ? envelope.trim() : "",
          buyerName: buyer.name.trim(),
          buyerEmail: buyer.email.trim(),
          buyerPhone: buyer.phone.trim(),
          terms: true,
          website,
          elapsedMs: Date.now() - openedAt.current,
        },
      });
      if (!r.ok) {
        setFailure("Kahjuks on see kujundus vahepeal läbi müüdud. Vali palun mõni teine kujundus.");
        setSending(false);
        void loadStock();
        return;
      }
      window.location.href = r.url;
    } catch {
      setFailure("Makse alustamine ebaõnnestus. Proovi mõne minuti pärast uuesti või helista meile.");
      setSending(false);
    }
  }

  const err = (k: string) => errors[k];
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `gc-${k}-err` : undefined });

  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Kinkekaardid"
          title="Kingi aega,"
          accent="mitte asju"
          subtitle={`Kinkekaart sobib kõigile meie teenustele ja kehtib ${VALIDITY_MONTHS} kuud. Maksad kohe ja saad kaardi PDF-ina e-postile. Soovi korral saadame prinditud kaardi ümbrikus.`}
        />

        {cancelled && (
          <p role="status" className="mt-8 rounded-xl border border-gold/60 bg-secondary px-4 py-3 text-sm">
            Makse katkestati ja kaarti ei loodud. Raha ei võetud. Võid allpool uuesti proovida.
          </p>
        )}

        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void pay();
          }}
          className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="space-y-8">
            {/* 1. Kujundus */}
            <fieldset>
              <legend className="mb-3 font-display text-xl font-light">
                <span className="mr-2 italic text-accent">1</span>Vali kujundus
              </legend>
              {allSoldOut && (
                <p role="status" className="mb-3 rounded-xl border border-gold/60 bg-secondary px-4 py-3 text-sm">
                  Kõik kinkekaardid on hetkel läbi müüdud. Uued tulevad peagi, küsi julgelt telefoni või e-posti teel.
                </p>
              )}
              <div className="grid grid-cols-3 gap-2">
                {DESIGNS.map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    aria-pressed={design === x.id}
                    disabled={soldOut(x.id)}
                    aria-label={soldOut(x.id) ? `${x.name}, läbi müüdud` : undefined}
                    onClick={() => setDesign(x.id)}
                    className={`group relative overflow-hidden rounded-lg border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      design === x.id ? "border-gold" : "border-transparent hover:border-gold/50"
                    }`}
                  >
                    <img
                      src={CARD_THUMBS[x.id]}
                      alt=""
                      className={`block aspect-[3/2] w-full object-cover ${soldOut(x.id) ? "opacity-35 grayscale" : ""}`}
                      loading="lazy"
                    />
                    {soldOut(x.id) ? (
                      <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-black/70 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-white">
                        Läbi müüdud
                      </span>
                    ) : (
                      typeof stock[x.id] === "number" &&
                      stock[x.id]! <= 3 && (
                        <span className="absolute right-1 top-1 rounded bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-ink">Alles {stock[x.id]}</span>
                      )
                    )}
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[11px] text-white">{x.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Kujundused on loodud tehisintellekti abil.</p>
            </fieldset>

            {/* 2. Summa ja saaja */}
            <fieldset className="space-y-4">
              <legend className="mb-3 font-display text-xl font-light">
                <span className="mr-2 italic text-accent">2</span>Summa ja saaja
              </legend>
              <Field id="gc-amount" label="Summa" error={err("amount")} hint={`${amountHint(amount)} Kaart on ühekordne, seega vali summa, mis vastab teenusele.`}>
                <div className="grid gap-2 sm:grid-cols-2">
                  <select
                    id={amountSel === "custom" ? "gc-amount-sel" : "gc-amount"}
                    className={fieldCls}
                    value={amountSel}
                    onChange={(e) => setAmountSel(e.target.value)}
                  >
                    {AMOUNTS.map((a) => (
                      <option key={a} value={a}>
                        {a} €
                      </option>
                    ))}
                    <option value="custom">Muu summa…</option>
                  </select>
                  {amountSel === "custom" && (
                    <input
                      id="gc-amount"
                      inputMode="numeric"
                      placeholder={`${MIN_AMOUNT}–${MAX_AMOUNT} €`}
                      value={custom}
                      onChange={(e) => setCustom(e.target.value.replace(/[^\d]/g, ""))}
                      className={fieldCls}
                      {...inv("amount")}
                    />
                  )}
                </div>
              </Field>
              <Field id="gc-recipient" label="Saaja nimi (valikuline)" error={err("recipient")} hint="Kui jätad tühjaks, jääb kaardile joon nime käsitsi kirjutamiseks.">
                <input id="gc-recipient" maxLength={32} value={recipient} onChange={(e) => setRecipient(e.target.value)} className={fieldCls} {...inv("recipient")} />
              </Field>
            </fieldset>

            {/* 3. Kättesaamine */}
            <fieldset className="space-y-4">
              <legend className="mb-3 font-display text-xl font-light">
                <span className="mr-2 italic text-accent">3</span>Kuidas kaardi saad
              </legend>
              <div role="radiogroup" className="grid gap-2">
                {(
                  [
                    ["digital", "Digitaalne (PDF)", "Tasuta. Kaart tuleb e-postile kohe pärast makset."],
                    ["print", `Prinditud kaart ümbrikus (+${PRINT_FEE} €)`, `Sisaldab postikulu. ${SHIPPING_TEXT} PDF tuleb samuti kohe e-postile.`],
                  ] as const
                ).map(([v, l, h]) => (
                  <label
                    key={v}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${
                      delivery === v ? "border-gold bg-secondary" : "border-border hover:border-gold/60"
                    }`}
                  >
                    <input type="radio" name="delivery" value={v} checked={delivery === v} onChange={() => setDelivery(v)} className="mt-0.5 size-4 accent-primary" />
                    <span>
                      <span className="block font-medium">{l}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{h}</span>
                    </span>
                  </label>
                ))}
              </div>
              {delivery === "print" && (
                <div className="grid gap-4 rounded-xl border border-border p-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field id="gc-addrName" label="Kellele postitame (nimi)" error={err("addrName")}>
                      <input id="gc-addrName" autoComplete="name" maxLength={80} value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} className={fieldCls} {...inv("addrName")} />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field id="gc-addrStreet" label="Tänav, maja ja korter" error={err("addrStreet")}>
                      <input id="gc-addrStreet" autoComplete="street-address" maxLength={120} value={addr.street} onChange={(e) => setAddr({ ...addr, street: e.target.value })} className={fieldCls} {...inv("addrStreet")} />
                    </Field>
                  </div>
                  <Field id="gc-addrCity" label="Linn või asula" error={err("addrCity")}>
                    <input id="gc-addrCity" autoComplete="address-level2" maxLength={60} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={fieldCls} {...inv("addrCity")} />
                  </Field>
                  <Field id="gc-addrZip" label="Postiindeks" error={err("addrZip")}>
                    <input id="gc-addrZip" autoComplete="postal-code" inputMode="numeric" maxLength={5} value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value.replace(/\D/g, "") })} className={fieldCls} {...inv("addrZip")} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field id="gc-envelope" label="Tervitus ümbrikusse (valikuline)" hint={`${envelope.length}/200 märki`}>
                      <textarea id="gc-envelope" rows={3} maxLength={200} value={envelope} onChange={(e) => setEnvelope(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    </Field>
                  </div>
                </div>
              )}
            </fieldset>

            {/* 4. Ostja */}
            <fieldset className="space-y-4">
              <legend className="mb-3 font-display text-xl font-light">
                <span className="mr-2 italic text-accent">4</span>Sinu andmed
              </legend>
              <Field id="gc-buyerName" label="Nimi" error={err("buyerName")}>
                <input id="gc-buyerName" autoComplete="name" maxLength={80} value={buyer.name} onChange={(e) => setBuyer({ ...buyer, name: e.target.value })} className={fieldCls} {...inv("buyerName")} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="gc-buyerEmail" label="E-post" error={err("buyerEmail")}>
                  <input id="gc-buyerEmail" type="email" autoComplete="email" maxLength={160} value={buyer.email} onChange={(e) => setBuyer({ ...buyer, email: e.target.value })} className={fieldCls} {...inv("buyerEmail")} />
                </Field>
                <Field id="gc-buyerPhone" label="Telefon (valikuline)">
                  <input id="gc-buyerPhone" type="tel" autoComplete="tel" maxLength={40} value={buyer.phone} onChange={(e) => setBuyer({ ...buyer, phone: e.target.value })} className={fieldCls} />
                </Field>
              </div>
              <div className="text-sm">
                <label className="flex items-start gap-3">
                  <input id="gc-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 accent-primary" {...inv("terms")} />
                  <span>
                    Nõustun{" "}
                    <Link to="/kinkekaardi-tingimused" target="_blank" className="font-medium text-primary underline underline-offset-4">
                      kinkekaardi tingimustega
                    </Link>
                    .
                  </span>
                </label>
                {err("terms") && (
                  <p id="gc-terms-err" className="mt-1 text-xs font-medium text-destructive">
                    {err("terms")}
                  </p>
                )}
              </div>
            </fieldset>
          </div>

          {/* Meepott robotitele: peidetud inimese ja ekraanilugeja eest */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label>
              Veebileht
              <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </label>
          </div>

          {/* Eelvaade ja makse */}
          <div className="space-y-5 lg:sticky lg:top-28">
            <div role="tablist" aria-label="Kaardi külg" className="inline-flex rounded-full border border-border p-1">
              {(
                [
                  ["front", "Esikülg"],
                  ["back", "Tagakülg"],
                ] as const
              ).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  role="tab"
                  aria-selected={side === v}
                  onClick={() => setSide(v)}
                  className={`rounded-full px-4 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    side === v ? "bg-ink text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
            <GiftCardPreview design={d} data={data} side={side} label={`Kinkekaardi eelvaade, ${side === "front" ? "esikülg" : "tagakülg"}`} />
            <p className="text-xs text-muted-foreground">
              Trükimõõt {size.w} × {size.h} mm. Kaardi number ja täpne kehtivus tulevad pärast makset.
            </p>

            <div className="rounded-2xl bg-ink px-6 py-6 text-white">
              <dl className="space-y-1 text-sm text-white/75">
                <div className="flex justify-between gap-4">
                  <dt>Kinkekaart ({d.name})</dt>
                  <dd>{amount ? `${amount} €` : "–"}</dd>
                </div>
                {printFee > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt>Prinditud kaart ümbrikus</dt>
                    <dd>{printFee} €</dd>
                  </div>
                )}
              </dl>
              <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-white/15 pt-4">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Kokku</span>
                <span className="font-display text-4xl font-light">{amount ? `${total} €` : "–"}</span>
              </p>
              <p className="mt-1 text-xs text-white/60">Käibemaksu ei lisandu. Maksad kaardi, Apple Pay või Google Payga.</p>
              <p className="mt-3 rounded-lg border border-gold/40 px-3 py-2 text-xs leading-relaxed text-white/80">{SINGLE_USE_TEXT}</p>
              <button
                type="submit"
                disabled={sending || allSoldOut || soldOut(design)}
                className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
              >
                {sending ? "Suunan maksma…" : "Maksa"}
              </button>
              {failure && (
                <p role="alert" className="mt-3 text-sm text-[#f2b8b1]">
                  {failure}
                </p>
              )}
              {Object.keys(errors).length > 0 && (
                <p role="alert" className="mt-3 text-sm text-[#f2b8b1]">
                  Palun paranda märgitud väljad.
                </p>
              )}
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
