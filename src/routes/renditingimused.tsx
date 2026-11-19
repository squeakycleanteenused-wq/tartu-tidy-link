import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { RENTAL, buildRentalContract, rentalIncluded } from "@/lib/rental-contract";
import { SITE_URL, canonical } from "@/lib/site";

/* Tekstiilipuhastusmasina üürilepingu täistekst (tüüptingimused). Sama tekst, mis tellimisel täidetakse
   üürniku andmetega ja saadetakse pakkumisega (src/lib/rental-contract.ts). Muuda tingimusi ainult seal. */
const title = "Renditingimused: tekstiilipuhasti üürileping | Koduninja";
const description = `Bissell SpotClean Pro tekstiilipuhastusmasina üürilepingu täistekst: ${RENTAL.pricePerDay ?? "kokkuleppel"} € ööpäev, tagatisraha ei võeta, kuni ${RENTAL.maxDays} päeva.`;

export const Route = createFileRoute("/renditingimused")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/renditingimused` },
    ],
    links: [canonical("/renditingimused")],
  }),
  component: Page,
});

const template = buildRentalContract({
  isCompany: false,
  name: "",
  code: "",
  address: "",
  phone: "",
  email: "",
  days: 0,
  startISO: "",
  place: "",
});

function Page() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link to="/" hash="hinnakalkulaator" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Tagasi tellimise juurde
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:border-gold"
          >
            <Printer className="size-4" /> Prindi või salvesta PDF
          </button>
        </div>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.3em] text-accent">Renditingimused</p>
        <h1 className="mt-4 font-display text-4xl font-light tracking-tight">Tekstiilipuhastusmasina üürileping</h1>
        <p className="mt-5 text-base font-light leading-relaxed text-muted-foreground">
          Need on tüüptingimused. Kui tellid masina rendi, täidetakse leping sinu andmetega ja saadame selle koos pakkumisega
          e-postile. Leping sõlmitakse, kui kinnitad pakkumise. {rentalIncluded("et")}
        </p>
        <pre className="mt-10 whitespace-pre-wrap rounded-2xl border border-border bg-secondary/40 p-6 font-sans text-sm leading-relaxed text-secondary-foreground">
          {template}
        </pre>
      </div>
    </SiteLayout>
  );
}
