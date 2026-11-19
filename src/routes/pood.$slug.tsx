import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, Check, FileText, ShoppingBag } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { CartBar } from "@/components/site/CartBar";
import { shopProduct } from "@/lib/shop.functions";
import { AI_PRODUCT_NOTE, BUNDLE_TEXT, bundlePct, euro } from "@/lib/shop.shared";
import { cart, useCart } from "@/lib/cart";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/pood/$slug")({
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

function Page() {
  const p = Route.useLoaderData();
  const items = useCart();
  const inCart = items.includes(p.slug);
  const count = items.length + (inCart ? 0 : 1);
  const pct = bundlePct(count);

  const paragraphs = p.description.split(/\n\s*\n/).filter(Boolean);

  return (
    <SiteLayout>
      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
        <Link to="/pood" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kõik tooted
        </Link>
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

            <div className="mt-8 space-y-4 rounded-2xl bg-ink p-6 text-white">
              <p className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.3em] text-gold">Hind</span>
                <span className="font-display text-4xl font-light">{euro(p.priceCents)}</span>
              </p>
              <p className="text-xs text-white/60">Käibemaksu ei lisandu. Allalaadimine kohe pärast makset, link tuleb ka e-postile.</p>
              {inCart ? (
                <Link
                  to="/pood/korv"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Check className="size-4" /> Ostukorvis · vaata korvi
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => cart.add(p.slug)}
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <ShoppingBag className="size-4" /> Lisa ostukorvi
                </button>
              )}
              <p className="rounded-xl border border-gold/40 px-4 py-3 text-sm text-white/85">
                {pct > 0 && !inCart ? `Koos korvis olevaga saad −${pct}% kogu ostult. ` : ""}
                {BUNDLE_TEXT}{" "}
                <Link to="/pood" className="text-gold underline underline-offset-4">
                  Vali veel tooteid
                </Link>
              </p>
              <p className="text-xs text-white/55">Makse Stripe'i turvalisel lehel (kaart, Apple Pay, Google Pay). Dokumendid ei asenda individuaalset õigusnõu.</p>
            </div>
            {p.aiMade && <p className="mt-3 text-xs text-muted-foreground">{AI_PRODUCT_NOTE}</p>}
          </div>
        </div>
      </div>
      <CartBar />
    </SiteLayout>
  );
}
