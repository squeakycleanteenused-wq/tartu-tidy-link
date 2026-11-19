import { useEffect, useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, FileText, X } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { shopProducts, startProductCheckout } from "@/lib/shop.functions";
import { BUNDLE_TEXT, DIGITAL_CONSENT_TEXT, euro, priceCart } from "@/lib/shop.shared";
import { cart, useCart } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/pood/korv")({
  validateSearch: z.object({ katkestatud: z.coerce.number().optional().catch(undefined) }),
  loader: () => shopProducts(),
  head: () => ({
    meta: [{ title: "Ostukorv | Squeaky Clean e-pood" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${SITE_URL}/pood` }],
  }),
  component: Page,
});

const input = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

function Page() {
  const all = Route.useLoaderData();
  const { katkestatud } = Route.useSearch();
  const slugs = useCart();
  const items = slugs.map((s) => all.find((p) => p.slug === s)).filter((p): p is (typeof all)[number] => !!p);
  const price = priceCart(items.map((p) => p.priceCents));

  // Korvist kaovad tooted, mida enam ei müüda (peidetud või kustutatud). Kui nimekiri ei laadinud, korvi ei puututa.
  useEffect(() => {
    if (all.length && slugs.length && items.length !== slugs.length) cart.set(items.map((p) => p.slug));
  }, [all, slugs, items]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [sending, setSending] = useState(false);
  const openedAt = useRef(Date.now());

  async function pay(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) err["email"] = "Kirjuta e-posti aadress kujul nimi@näide.ee. Saadame allalaadimislingid sinna.";
    if (!consent) err["consent"] = "Digitoodete ostmiseks märgi see linnuke.";
    if (!terms) err["terms"] = "Märgi linnuke, et nõustud e-poe tingimustega.";
    setErrors(err);
    setFailure("");
    if (Object.keys(err).length) {
      document.getElementById(`k-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const r = await startProductCheckout({
        data: {
          slugs: items.map((p) => p.slug),
          buyerName: name.trim(),
          buyerEmail: email.trim(),
          digitalConsent: true,
          terms: true,
          website,
          elapsedMs: Date.now() - openedAt.current,
        },
      });
      if (!r.ok) {
        if (r.unavailable.length) cart.set(items.map((p) => p.slug).filter((s) => !r.unavailable.includes(s)));
        setFailure("Mõni toode ei ole enam müügil ja eemaldasime selle korvist. Vaata korv üle ja proovi uuesti.");
        setSending(false);
        return;
      }
      window.location.href = r.url;
    } catch {
      setFailure("Makse alustamine ebaõnnestus. Proovi mõne minuti pärast uuesti või kirjuta meile.");
      setSending(false);
    }
  }

  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `k-${k}-err` : undefined });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <Link to="/pood" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Jätka ostlemist
        </Link>
        <h1 className="mt-6 font-display text-4xl font-light tracking-tight sm:text-5xl">Ostukorv</h1>
        {katkestatud === 1 && (
          <p role="status" className="mt-6 rounded-xl border border-gold/60 bg-secondary px-4 py-3 text-sm">
            Makse katkestati ja raha ei võetud. Võid uuesti proovida.
          </p>
        )}

        {!hydrated ? (
          <p className="mt-10 text-muted-foreground" role="status">
            Laen ostukorvi…
          </p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-border p-8 text-center">
            <p className="text-muted-foreground">Ostukorv on tühi.</p>
            <p className="mt-2 text-sm text-muted-foreground">{BUNDLE_TEXT}</p>
            <Link to="/pood" className="mt-6 inline-flex h-12 items-center rounded-full bg-gold px-8 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c]">
              Vaata tooteid
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <ul className="divide-y divide-border border-y border-border">
                {items.map((p, i) => (
                  <li key={p.slug} className="flex items-center gap-4 py-4">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="size-16 rounded-xl object-cover" />
                    ) : (
                      <div className="grid size-16 place-items-center rounded-xl bg-ink text-gold">
                        <FileText className="size-6" strokeWidth={1.2} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link to="/pood/$slug" params={{ slug: p.slug }} className="font-medium hover:underline">
                        {p.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{p.fileType ?? "Digitoode"}</p>
                    </div>
                    <div className="text-right">
                      {price.pct > 0 && <p className="text-xs text-muted-foreground line-through">{euro(p.priceCents)}</p>}
                      <p className="font-display text-xl font-light">{euro(price.lines[i]!)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => cart.remove(p.slug)}
                      aria-label={`Eemalda ${p.title}`}
                      className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-5 rounded-xl bg-secondary px-4 py-3 text-sm">
                {price.next
                  ? `Lisa veel ${price.next.add === 1 ? "üks toode" : `${price.next.add} toodet`} ja saad kogu ostult −${price.next.pct}%.`
                  : `Said suurima komplektisoodustuse −${price.pct}%.`}{" "}
                <Link to="/pood" className="text-accent underline underline-offset-4">
                  Vali tooteid
                </Link>
              </p>
            </div>

            <form noValidate onSubmit={pay} className="space-y-4 rounded-2xl bg-ink p-6 text-white lg:sticky lg:top-28">
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-white/75">
                  <dt>Tooted ({items.length})</dt>
                  <dd>{euro(price.subtotal)}</dd>
                </div>
                {price.discount > 0 && (
                  <div className="flex justify-between text-gold">
                    <dt>Komplektisoodustus −{price.pct}%</dt>
                    <dd>−{euro(price.discount)}</dd>
                  </div>
                )}
                <div className="flex items-baseline justify-between border-t border-white/15 pt-3">
                  <dt className="text-[11px] uppercase tracking-[0.3em] text-gold">Kokku</dt>
                  <dd className="font-display text-4xl font-light">{euro(price.total)}</dd>
                </div>
              </dl>
              <p className="text-xs text-white/60">Käibemaksu ei lisandu. Allalaadimine kohe pärast makset, lingid tulevad ka e-postile.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-white/80">Nimi (valikuline)</span>
                  <input id="k-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={input} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-white/80">E-post</span>
                  <input id="k-email" type="email" autoComplete="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} className={input} {...inv("email")} />
                </label>
              </div>
              {errors["email"] && <p id="k-email-err" className="text-xs text-[#f2b8b1]">{errors["email"]}</p>}
              <label className="flex items-start gap-3 text-sm text-white/85">
                <input id="k-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[#b8913b]" {...inv("consent")} />
                <span>{DIGITAL_CONSENT_TEXT}</span>
              </label>
              {errors["consent"] && <p id="k-consent-err" className="text-xs text-[#f2b8b1]">{errors["consent"]}</p>}
              <label className="flex items-start gap-3 text-sm text-white/85">
                <input id="k-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 accent-[#b8913b]" {...inv("terms")} />
                <span>
                  Nõustun{" "}
                  <Link to="/e-poe-tingimused" target="_blank" className="text-gold underline underline-offset-4">
                    e-poe tingimustega
                  </Link>
                  .
                </span>
              </label>
              {errors["terms"] && <p id="k-terms-err" className="text-xs text-[#f2b8b1]">{errors["terms"]}</p>}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
              >
                {sending ? "Suunan maksma…" : `Maksa ${euro(price.total)}`}
              </button>
              {failure && <p role="alert" className="text-sm text-[#f2b8b1]">{failure}</p>}
              <p className="text-xs text-white/55">Makse Stripe'i turvalisel lehel (kaart, Apple Pay, Google Pay). Dokumendid ei asenda individuaalset õigusnõu.</p>
            </form>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
