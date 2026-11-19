import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { RENTAL_COMPANY, companyContact } from "@/lib/rental-contract";
import { DIGITAL_CONSENT_TEXT } from "@/lib/shop.shared";
import { SITE_URL, canonical } from "@/lib/site";

/* E-poe tingimused (1. etapp: digitaalsed tooted). 2. etapis lisanduvad kaupade tarne ja tagastus. */
const title = "E-poe tingimused | Koduninja";
const VALID_FROM = "19.11.2026";

export const Route = createFileRoute("/e-poe-tingimused")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: "Koduninja e-poe müügitingimused digitaalsetele toodetele." },
      { property: "og:url", content: `${SITE_URL}/e-poe-tingimused` },
    ],
    links: [canonical("/e-poe-tingimused")],
  }),
  component: Page,
});

const SECTIONS: [string, string[]][] = [
  ["1. Müüja", [`${RENTAL_COMPANY.name}, ${companyContact("et")}. Müüja ei ole käibemaksukohustuslane, hindadele käibemaksu ei lisandu.`]],
  [
    "2. Tooted",
    [
      "E-poes müüakse digitaalseid tooteid (nt dokumendipõhjad PDF-, Word- või Excel-failina). Toote sisu, failivorming ja hind on kirjas tootelehel enne ostu.",
      "Dokumendipõhjad on üldised abivahendid ega asenda individuaalset õigusnõu. Kasutaja vastutab dokumendi sobivuse eest oma olukorrale.",
    ],
  ],
  [
    "3. Ostmine ja maksmine",
    [
      "Ost tehakse tootelehel. Makse toimub Stripe'i turvalisel makselehel (pangakaart, Apple Pay, Google Pay); kaardiandmed meieni ei jõua.",
      "Leping sõlmitakse, kui makse on õnnestunud. Ostu kinnitus koos allalaadimislingiga saadetakse ostja e-postile.",
    ],
  ],
  [
    "4. Üleandmine",
    [
      "Digitaalne toode tehakse kättesaadavaks kohe pärast makse kinnitamist: allalaadimisnupp aitäh-lehel ja link e-kirjas. Link kehtib 7 päeva. Kui link aegub või kaob, saadame tasuta uue.",
      "Faili võib kasutada ostja oma tarbeks. Faili edasimüümine või avalik jagamine ei ole lubatud.",
    ],
  ],
  [
    "5. Taganemisõigus",
    [
      `Digitaalse sisu puhul, mida ei toimetata kätte füüsilisel andmekandjal, kaob tarbija 14-päevane taganemisõigus, kui sisu üleandmist on alustatud tarbija sõnaselgel eelneval nõusolekul ja tarbija on kinnitanud, et on sellest teadlik (VÕS § 53 lg 4 p 13). Seepärast palume enne makset märkida linnuke: „${DIGITAL_CONSENT_TEXT}"`,
      "Nõusoleku aeg salvestatakse ja kinnitatakse ostja e-kirjas.",
    ],
  ],
  [
    "6. Puudused",
    [
      `Kui fail ei avane, on vigane või ei vasta kirjeldusele, kirjuta ${RENTAL_COMPANY.email}. Saadame korras faili või tagastame raha.`,
    ],
  ],
  [
    "7. Isikuandmed",
    [`Ostja nime ja e-posti kasutame ainult ostu täitmiseks ja raamatupidamiseks. Täpsemalt: ${SITE_URL}/privaatsus.`],
  ],
  [
    "8. Kaebused",
    [
      `Pretensiooni korral kirjuta ${RENTAL_COMPANY.email} või helista ${RENTAL_COMPANY.phone}; vastame 15 päeva jooksul. Tarbija võib pöörduda tarbijavaidluste komisjoni poole (www.ttja.ee). Kohaldatakse Eesti õigust.`,
    ],
  ],
];

function Page() {
  return (
    <SiteLayout>
      <div className="mx-auto max-w-3xl px-6 py-14">
        <Link to="/pood" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Tagasi e-poodi
        </Link>
        <p className="mt-8 text-[11px] font-medium uppercase tracking-[0.3em] text-accent">E-pood</p>
        <h1 className="mt-4 font-display text-4xl font-light tracking-tight">E-poe tingimused</h1>
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
