import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import {
  DOWNLOAD_LINK_DAYS,
  MAX_AMOUNT,
  MIN_AMOUNT,
  PRINT_FEE,
  SHIPPING_TEXT,
  TOTAL_STOCK,
  VALIDITY_MONTHS,
} from "@/lib/giftcards.config";
import { RENTAL_COMPANY, companyContact } from "@/lib/rental-contract";
import { SITE_URL, canonical } from "@/lib/site";

/* Kinkekaardi tingimused. Arvud (kehtivus, kogus, lisatasu, summad) tulevad giftcards.config.ts-ist,
   seega muuda neid seal. Omaniku otsused: kehtib 12 kuud, piiratud kogus, ühekordne kasutus, jääki ei tagastata. */
const title = "Kinkekaardi tingimused | Squeaky Clean";
const description = `Squeaky Clean kodukoristuse kinkekaardi tingimused: kehtib ${VALIDITY_MONTHS} kuud, ühekordne kasutus, piiratud kogus.`;
const VALID_FROM = "18.11.2026";

export const Route = createFileRoute("/kinkekaardi-tingimused")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/kinkekaardi-tingimused` },
    ],
    links: [canonical("/kinkekaardi-tingimused")],
  }),
  component: Page,
});


const SECTIONS: [string, string[]][] = [
  [
    "1. Müüja",
    [
      `Kinkekaarti müüb ja selle alusel osutab teenust ${RENTAL_COMPANY.name}, ${companyContact("et")}.`,
      "Ettevõte ei ole käibemaksukohustuslane, kinkekaardi hinnale käibemaksu ei lisandu.",
    ],
  ],
  [
    "2. Mis on kinkekaart",
    [
      `Kinkekaart on ettemaksu tõend, mida saab kasutada ${RENTAL_COMPANY.name} kodukoristusteenuste eest tasumiseks (hoolduskoristus, suurpuhastus, kolimiskoristus, aknapesu ja lisatööd) Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Kinkekaardiga ei saa tasuda e-poe kaupade ega tekstiilipuhastusmasina rendi eest.`,
      `Kinkekaardi summa on ${MIN_AMOUNT} kuni ${MAX_AMOUNT} eurot. Igal kaardil on unikaalne number kujul SQ-AAKK-XXXX.`,
      `Kinkekaarte on müügil piiratud koguses${TOTAL_STOCK != null ? ` (kokku ${TOTAL_STOCK} tk, kujundust saab valida vabalt)` : ""}. Allesolev kogus on näha ostulehel. Kui kaardid on otsas, ei saa neid osta.`,
    ],
  ],
  [
    "3. Ostmine ja maksmine",
    [
      "Kinkekaardi saab osta lehel squeakycleanteenused.ee/kinkekaardid. Hind on näidatud enne makset ja see on lõplik.",
      "Makse toimub Stripe'i turvalisel makselehel (pangakaart, Apple Pay või Google Pay). Kaardiandmed sisestad Stripe'i lehel ja need meieni ei jõua.",
      "Leping sõlmitakse, kui makse on õnnestunud. Kinkekaart väljastatakse alles pärast makse laekumise kinnitust.",
    ],
  ],
  [
    "4. Kättetoimetamine",
    [
      `Digitaalne kinkekaart (PDF) saadetakse ostja e-postile kohe pärast makset. PDF-i saab alla laadida ka aitäh-lehelt; allalaadimislink kehtib ${DOWNLOAD_LINK_DAYS} päeva.`,
      `Prinditud kinkekaart ümbrikus maksab lisaks ${PRINT_FEE} € (sisaldab postikulu) ja saadetakse ostja märgitud aadressile Eestis. ${SHIPPING_TEXT} Lisaks saab ostja kohe ka PDF-i.`,
      "Kontrolli enne makset, et e-posti ja postiaadress on õiged. Vale aadressi tõttu kaduma läinud paberkaardi eest me ei vastuta, kuid saadame PDF-i uuesti.",
    ],
  ],
  [
    "5. Kehtivus",
    [
      `Kinkekaart kehtib ${VALIDITY_MONTHS} kuud väljastamise kuupäevast. Kehtivuse lõpp on kaardile kirjutatud.`,
      "Teenus tuleb broneerida ja osutada kehtivusaja jooksul. Aegunud kinkekaarti ei pikendata ega hüvitata.",
    ],
  ],
  [
    "6. Kasutamine",
    [
      "Kinkekaardi kasutamiseks broneeri aeg kodulehe hinnapäringu vormi kaudu, e-postiga või telefonil ja ütle broneerides kaardi number. Enne teenuse osutamist kontrollime, et kaart on kehtiv ja kasutamata.",
      "Kinkekaarti saab kasutada ühe korra. Kui teenus maksab vähem kui kaardi summa, jääki ei tagastata ega kanta üle. Kui teenus maksab rohkem, tasub kaardi kasutaja vahe arve alusel pangaülekandega.",
      "Kinkekaarti ei saa vahetada raha vastu ega kasutada osade kaupa.",
      "Kinkekaart on esitajale: kaardi numbri esitaja võib selle kasutada. Hoia kaardi numbrit nagu sularaha. Kui kaart on juba kasutatud, ei saa seda uuesti kasutada.",
      `Teenuse osutamisele kehtivad üldised teenuseosutamise tingimused (${SITE_URL}/tingimused), sh tühistamise ja ligipääsu nõuded.`,
    ],
  ],
  [
    "7. Taganemisõigus",
    [
      "Eraisikust ostjal on õigus internetis ostetud kinkekaardist 14 päeva jooksul ostust põhjust avaldamata taganeda, kui kinkekaarti ei ole selle aja jooksul kasutatud.",
      `Taganemiseks kirjuta ${RENTAL_COMPANY.email} või kasuta lehe ülamenüü nuppu „Taganen lepingust“ ja lisa kaardi number. Tagastame makstud summa (prinditud kaardi puhul koos lisatasuga) 14 päeva jooksul samale maksevahendile. Kaart tühistatakse ja seda ei saa enam kasutada.`,
      "Kui kinkekaardiga on teenus 14 päeva jooksul juba osutatud, taganemisõigus kaob.",
    ],
  ],
  [
    "8. Kadunud kaart ja vead",
    [
      "Kui PDF on kadunud, kirjuta meile ostja e-posti aadressilt ja saadame kaardi uuesti. Kaardi number jääb samaks.",
      "Kui kinkekaardil on viga (nt vale summa või nimi), anna sellest kohe teada ja parandame selle tasuta.",
    ],
  ],
  [
    "9. Isikuandmed",
    [
      `Ostja ja saaja andmeid kasutame ainult kinkekaardi väljastamiseks, kättetoimetamiseks ja kasutamise kontrollimiseks. Täpsemalt: ${SITE_URL}/privaatsus.`,
    ],
  ],
  [
    "10. Kaebused ja vaidlused",
    [
      `Pretensiooni või küsimuse korral kirjuta ${RENTAL_COMPANY.email} või helista ${RENTAL_COMPANY.phone}. Vastame 15 päeva jooksul.`,
      "Kui me kokkuleppele ei jõua, võib tarbija pöörduda Tarbijakaitse ja Tehnilise Järelevalve Ameti juures tegutseva tarbijavaidluste komisjoni poole (www.ttja.ee) või kohtusse. Tingimustele kohaldatakse Eesti õigust.",
      "Tingimuste muutmine ei mõjuta juba müüdud kinkekaarte: nendele kehtivad ostu hetkel kehtinud tingimused.",
    ],
  ],
];

function Page() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link to="/kinkekaardid" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Tagasi kinkekaartide juurde
        </Link>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.3em] text-accent">Kinkekaart</p>
        <h1 className="mt-4 font-display text-4xl font-light tracking-tight">Kinkekaardi tingimused</h1>
        <p className="mt-3 text-sm text-muted-foreground">Kehtivad alates {VALID_FROM}.</p>
        <div className="mt-10 space-y-8">
          {SECTIONS.map(([h, ps]) => (
            <section key={h}>
              <h2 className="font-sans text-base font-semibold">{h}</h2>
              {ps.map((p) => (
                <p key={p.slice(0, 30)} className="mt-2 text-sm leading-relaxed text-secondary-foreground">
                  {p}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </SiteLayout>
  );
}
