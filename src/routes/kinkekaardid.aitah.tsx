import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { giftCardPurchase } from "@/lib/giftcards.functions";
import { SHIPPING_TEXT, fmtDate } from "@/lib/giftcards.config";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/kinkekaardid/aitah")({
  validateSearch: z.object({ session_id: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [{ title: "Aitäh! | Squeaky Clean kinkekaart" }, { name: "robots", content: "noindex" }],
    links: [{ rel: "canonical", href: `${SITE_URL}/kinkekaardid` }],
  }),
  component: Page,
});

type Result = Awaited<ReturnType<typeof giftCardPurchase>>;

function Page() {
  const { session_id } = Route.useSearch();
  const [r, setR] = useState<Result | null>(null);
  const [tries, setTries] = useState(0);

  // Kaart tekib alles siis, kui Stripe'i webhook makse kinnitab. Tavaliselt mõne sekundiga, seega küsime uuesti.
  useEffect(() => {
    if (!session_id) return;
    let alive = true;
    void giftCardPurchase({ data: { sessionId: session_id } })
      .then((x) => alive && setR(x))
      .catch(() => alive && setR({ state: "unknown" }));
    return () => {
      alive = false;
    };
  }, [session_id, tries]);
  useEffect(() => {
    if (r?.state !== "pending" || tries > 30) return;
    const t = window.setTimeout(() => setTries((n) => n + 1), 2000);
    return () => window.clearTimeout(t);
  }, [r, tries]);

  return (
    <SiteLayout>
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">Kinkekaart</p>
          {!session_id || r?.state === "unknown" ? (
            <>
              <h1 className="mt-5 font-display text-4xl font-light">Tellimust ei leitud</h1>
              <p className="mt-5 text-muted-foreground">
                Kui maksid, saabub kaart mõne minuti jooksul e-postile. Kui seda ei tule, kirjuta meile ja saadame kaardi kohe.
              </p>
            </>
          ) : r?.state === "ready" ? (
            <>
              <h1 className="mt-5 font-display text-4xl font-light sm:text-5xl">
                Aitäh! <span className="italic text-accent">Kaart on valmis.</span>
              </h1>
              <div className="mx-auto mt-10 max-w-md rounded-2xl bg-ink px-6 py-7 text-white">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Kaardi number</p>
                <p className="mt-2 font-display text-3xl font-light tracking-wide">{r.nr}</p>
                <p className="mt-2 text-sm text-white/70">
                  {r.amount} € · kehtib kuni {fmtDate(r.validUntil)}
                </p>
                <a
                  href={r.pdfUrl}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Laadi alla PDF
                </a>
              </div>
              <p className="mt-8 text-muted-foreground">Saatsime kaardi ka e-postile {r.email}.</p>
              {r.delivery === "print" && (
                <p className="mt-2 text-muted-foreground">
                  Postitame kaardi aadressile {r.address}. {SHIPPING_TEXT}
                </p>
              )}
            </>
          ) : (
            <>
              <h1 className="mt-5 font-display text-4xl font-light">Kinnitame makset…</h1>
              <p className="mt-5 text-muted-foreground" role="status">
                {tries > 30
                  ? "Makse kinnitamine võtab tavalisest kauem. Kaart saabub e-postile kohe, kui makse on kinnitatud."
                  : "See võtab tavaliselt paar sekundit. Ära sulge lehte."}
              </p>
            </>
          )}
          <Link to="/" className="mt-10 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">
            Tagasi avalehele
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
