import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { SINGLE_USE_TEXT, VALIDITY_MONTHS } from "@/lib/giftcards.config";
import { SITE_URL, canonical } from "@/lib/site";

/* KOHATÄIDE. Juriidiline tekst on vaja omanikul (või juristil) kirjutada.
   Omaniku otsus: kaart on ühekordne, jääki ei tagastata ega kanta üle (SINGLE_USE_TEXT giftcards.config.ts-is).
   Kindlasti peab kirjas olema: kehtivusaeg, ühekordne kasutus ja jääk,
   eraisiku 14-päevane taganemisõigus internetiostul, tagastamine/tühistamine, prinditud kaardi kättetoimetamine. */
export const Route = createFileRoute("/kinkekaardi-tingimused")({
  head: () => ({
    meta: [{ title: "Kinkekaardi tingimused | Squeaky Clean" }, { name: "robots", content: "noindex" }],
    links: [canonical("/kinkekaardi-tingimused")],
  }),
  component: Page,
});

function Page() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link to="/kinkekaardid" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Tagasi kinkekaartide juurde
        </Link>
        <h1 className="mt-6 font-display text-4xl font-light">Kinkekaardi tingimused</h1>
        <p className="mt-6 rounded-xl border border-gold/60 bg-secondary p-4 text-sm">
          Tingimused on koostamisel. Kinkekaart kehtib {VALIDITY_MONTHS} kuud väljastamisest ja sobib kõigile{" "}
          <a href={`${SITE_URL}/tingimused`} className="underline underline-offset-4">
            meie teenustele
          </a>
          . Küsimuste korral kirjuta meile.
        </p>
        <p className="mt-4 text-sm leading-relaxed">{SINGLE_USE_TEXT}</p>
      </div>
    </SiteLayout>
  );
}
