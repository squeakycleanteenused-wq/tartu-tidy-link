import { useRef, useState, type FormEvent } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, FileText } from "lucide-react";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { shopProduct, startProductCheckout } from "@/lib/shop.functions";
import { DIGITAL_CONSENT_TEXT, euro } from "@/lib/shop.shared";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/pood/$slug")({
  validateSearch: z.object({ katkestatud: z.coerce.number().optional().catch(undefined) }),
  loader: async ({ params }) => {
    const p = await shopProduct({ data: { slug: params.slug } });
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} | Squeaky Clean e-pood` },
          { name: "description", content: loaderData.short || loaderData.title },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.short || loaderData.title },
          { property: "og:url", content: `${SITE_URL}/pood/${loaderData.slug}` },
          ...(loaderData.imageUrl ? [{ property: "og:image", content: loaderData.imageUrl }] : []),
        ]
      : [],
    links: loaderData ? [{ rel: "canonical", href: `${SITE_URL}/pood/${loaderData.slug}` }] : [],
  }),
  component: Page,
});

const input = "h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

function Page() {
  const p = Route.useLoaderData();
  const { katkestatud } = Route.useSearch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [terms, setTerms] = useState(false);
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");
  const [sending, setSending] = useState(false);
  const openedAt = useRef(Date.now());

  async function buy(e: FormEvent) {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) err["email"] = "Kirjuta e-posti aadress kujul nimi@näide.ee. Saadame allalaadimislingi sinna.";
    if (!consent) err["consent"] = "Digitoote ostmiseks märgi see linnuke.";
    if (!terms) err["terms"] = "Märgi linnuke, et nõustud e-poe tingimustega.";
    setErrors(err);
    setFailure("");
    if (Object.keys(err).length) {
      document.getElementById(`p-${Object.keys(err)[0]}`)?.focus();
      return;
    }
    setSending(true);
    try {
      const r = await startProductCheckout({
        data: {
          slug: p.slug,
          buyerName: name.trim(),
          buyerEmail: email.trim(),
          digitalConsent: true,
          terms: true,
          website,
          elapsedMs: Date.now() - openedAt.current,
        },
      });
      if (!r.ok) {
        setFailure("See toode ei ole hetkel müügil.");
        setSending(false);
        return;
      }
      window.location.href = r.url;
    } catch {
      setFailure("Makse alustamine ebaõnnestus. Proovi mõne minuti pärast uuesti või kirjuta meile.");
      setSending(false);
    }
  }

  const paragraphs = p.description.split(/\n\s*\n/).filter(Boolean);
  const inv = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `p-${k}-err` : undefined });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <Link to="/pood" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kõik tooted
        </Link>
        {katkestatud === 1 && (
          <p role="status" className="mt-6 rounded-xl border border-gold/60 bg-secondary px-4 py-3 text-sm">
            Makse katkestati ja raha ei võetud. Võid uuesti proovida.
          </p>
        )}
        <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1.1fr_1fr]">
          <div>
            {p.imageUrl ? (
              <img src={p.imageUrl} alt={p.title} className="w-full rounded-[28px] object-cover shadow-[0_24px_60px_-30px_rgb(0_0_0/0.5)]" />
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-[28px] bg-ink text-gold">
                <FileText className="size-16" strokeWidth={1.2} />
              </div>
            )}
            <div className="mt-8 space-y-4 text-base font-light leading-relaxed text-secondary-foreground">
              {paragraphs.map((t) => (
                <p key={t.slice(0, 30)} className="whitespace-pre-line">
                  {t}
                </p>
              ))}
            </div>
          </div>

          <div className="lg:sticky lg:top-28">
            <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
              {p.category || "Digitoode"}
              {p.fileType ? ` · ${p.fileType}` : ""}
            </p>
            <h1 className="mt-4 font-display text-4xl font-light leading-tight tracking-tight sm:text-5xl">{p.title}</h1>
            {p.short && <p className="mt-4 text-lg font-light text-muted-foreground">{p.short}</p>}

            <form noValidate onSubmit={buy} className="mt-8 space-y-4 rounded-2xl bg-ink p-6 text-white">
              <p className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Hind</span>
                <span className="font-display text-4xl font-light">{euro(p.priceCents)}</span>
              </p>
              <p className="text-xs text-white/60">Käibemaksu ei lisandu. Allalaadimine kohe pärast makset, link tuleb ka e-postile.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">
                  <span className="mb-1 block text-white/80">Nimi (valikuline)</span>
                  <input id="p-name" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} className={`${input} text-foreground`} />
                </label>
                <label className="text-sm">
                  <span className="mb-1 block text-white/80">E-post</span>
                  <input id="p-email" type="email" autoComplete="email" maxLength={160} value={email} onChange={(e) => setEmail(e.target.value)} className={`${input} text-foreground`} {...inv("email")} />
                </label>
              </div>
              {errors["email"] && <p id="p-email-err" className="text-xs text-[#f2b8b1]">{errors["email"]}</p>}
              <label className="flex items-start gap-3 text-sm text-white/85">
                <input id="p-consent" type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 size-4 accent-[#b8913b]" {...inv("consent")} />
                <span>{DIGITAL_CONSENT_TEXT}</span>
              </label>
              {errors["consent"] && <p id="p-consent-err" className="text-xs text-[#f2b8b1]">{errors["consent"]}</p>}
              <label className="flex items-start gap-3 text-sm text-white/85">
                <input id="p-terms" type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 size-4 accent-[#b8913b]" {...inv("terms")} />
                <span>
                  Nõustun{" "}
                  <Link to="/e-poe-tingimused" target="_blank" className="text-gold underline underline-offset-4">
                    e-poe tingimustega
                  </Link>
                  .
                </span>
              </label>
              {errors["terms"] && <p id="p-terms-err" className="text-xs text-[#f2b8b1]">{errors["terms"]}</p>}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-14 w-full items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-60"
              >
                {sending ? "Suunan maksma…" : "Osta"}
              </button>
              {failure && <p role="alert" className="text-sm text-[#f2b8b1]">{failure}</p>}
              <p className="text-xs text-white/55">Makse Stripe'i turvalisel lehel (kaart, Apple Pay, Google Pay). Dokumendid ei asenda individuaalset õigusnõu.</p>
            </form>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
