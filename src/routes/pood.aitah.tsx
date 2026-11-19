import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { productPurchase } from "@/lib/shop.functions";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/pood/aitah")({
  validateSearch: z.object({ session_id: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Aitäh! | Squeaky Clean e-pood" },
      { name: "robots", content: "noindex" },
      { name: "referrer", content: "no-referrer" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/pood` }],
  }),
  component: Page,
});

type Result = Awaited<ReturnType<typeof productPurchase>>;

function Page() {
  const fromUrl = Route.useSearch().session_id;
  const [session_id, setSessionId] = useState(fromUrl);
  const [checked, setChecked] = useState(!!fromUrl);
  // Makse ID ei jää aadressiribale (ei satu analüütikasse, ajalukku ega jagatud linki).
  // Lehe uuesti laadimisel võetakse see brauseri sessioonist.
  useEffect(() => {
    try {
      if (fromUrl) {
        window.sessionStorage.setItem("sc-shop-session", fromUrl);
        window.history.replaceState(null, "", window.location.pathname);
      } else {
        setSessionId(window.sessionStorage.getItem("sc-shop-session") ?? undefined);
      }
    } catch {
      /* privaatne režiim: jätkame ilma */
    }
    setChecked(true);
  }, [fromUrl]);
  const [r, setR] = useState<Result | null>(null);
  const [tries, setTries] = useState(0);

  // Ost kinnitatakse alles siis, kui Stripe'i webhook makse kinnitab. Tavaliselt mõne sekundiga, seega küsime uuesti.
  useEffect(() => {
    if (!session_id) return;
    let alive = true;
    void productPurchase({ data: { sessionId: session_id } })
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
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">E-pood</p>
          {!checked ? (
            <h1 className="mt-5 font-display text-4xl font-light">Kinnitame makset…</h1>
          ) : !session_id || r?.state === "unknown" ? (
            <>
              <h1 className="mt-5 font-display text-4xl font-light">Tellimust ei leitud</h1>
              <p className="mt-5 text-muted-foreground">
                Kui maksid, saabub allalaadimislink mõne minuti jooksul e-postile. Kui seda ei tule, kirjuta meile ja saadame selle kohe.
              </p>
            </>
          ) : r?.state === "ready" ? (
            <>
              <h1 className="mt-5 font-display text-4xl font-light sm:text-5xl">
                Aitäh! <span className="italic text-accent">Fail on valmis.</span>
              </h1>
              <div className="mx-auto mt-10 max-w-md rounded-2xl bg-ink px-6 py-7 text-white">
                <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Sinu ost</p>
                <p className="mt-2 font-display text-2xl font-light">{r.title}</p>
                <a
                  href={r.downloadUrl}
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-sm font-semibold uppercase tracking-[0.15em] text-ink hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  Laadi alla
                </a>
              </div>
              <p className="mt-8 text-muted-foreground">Saatsime allalaadimislingi ka e-postile {r.email}. Link kehtib 7 päeva.</p>
            </>
          ) : (
            <>
              <h1 className="mt-5 font-display text-4xl font-light">Kinnitame makset…</h1>
              <p className="mt-5 text-muted-foreground" role="status">
                {tries > 30
                  ? "Makse kinnitamine võtab tavalisest kauem. Link saabub e-postile kohe, kui makse on kinnitatud."
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
