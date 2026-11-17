import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";

/* Intro: lühike lubadus ja tellimise sammud kohe foto all.
   About: pikem tutvustus (oluline otsingumootoritele), asub lehe allosas KKK järel. */
const COPY = {
  et: {
    eyebrow: "Squeaky Clean",
    lead: "Puhas kodu,",
    leadAccent: "ilma et peaksid sellele mõtlema.",
    leadText: "Ütle, mida vajad. Saadame sulle kindla hinna, tuleme kokkulepitud ajal ning sina saad tegelda oma asjadega.",
    howEyebrow: "Nii see käib",
    aboutEyebrow: "Meist",
    title: "Ühekordne kodukoristus Tartus, Põlvas ja lähiümbruses",
    paragraphs: [
      "Squeaky Clean Teenused OÜ pakub kodukoristust Tartus ja Põlvas ning kokkuleppel ka nende lähiümbruses. Koristame kortereid ja eramaju, meie kliendid on nii eraisikud kui ka ettevõtted. Koristaja koju saad tellida veebis: arvuta hind ja saada päring.",
      "Hoolduskoristus hoiab kodu iga päev puhtana. Suurpuhastus on põhjalikum ja sobib ka kolimiskoristuseks või siis, kui kodu pole tükk aega koristatud. Lisaks peseme aknaid ja teeme lisatöid: näiteks peseme seest ahju, külmkapi ja kapid või koristame rõdu ja terrassi. Polstermööbli, vaipade ja madratsite puhastamiseks saad meilt rentida tekstiilipuhastusmasina.",
    ],
    onceTitle: "Ühekordne või regulaarne, ilma pikaajalise lepinguta",
    once: "Iga koristus on eraldi tellimus ja leping kehtib ainult selle ühe korra kohta. Pikaajalist lepingut ega kuutasu ei ole ja järgmist korda tellima ei pea. Kui soovid, käime ka regulaarselt, näiteks kord nädalas või kord kuus, nii kodudes kui ka ettevõtetes. Iga külastuse kohta saadame eraldi pakkumise ja võid igal ajal lõpetada.",
    howTitle: "Kuidas tellida",
    how: [
      "Vaata kalkulaatorist hinda ja saada päring.",
      "Saadame e-postiga pakkumise kindla hinna ja ajaga.",
      "Kui pakkumine sobib, kinnitad selle. Alles siis on leping sõlmitud.",
      "Pärast koristust saadame arve, mille tasud pangaülekandega.",
    ],
  },
  en: {
    eyebrow: "Squeaky Clean",
    lead: "A clean home,",
    leadAccent: "without having to think about it.",
    leadText: "Tell us what you need. We send a fixed price, arrive at the agreed time and you get your time back.",
    howEyebrow: "How it works",
    aboutEyebrow: "About us",
    title: "One-time home cleaning in Tartu, Põlva and the surrounding area",
    paragraphs: [
      "Squeaky Clean Teenused OÜ offers home cleaning in the cities of Tartu and Põlva and, by agreement, in their surrounding areas. We clean apartments and houses for private customers and companies. You can book a cleaner for your home online: calculate the price and send a request.",
      "We offer maintenance cleaning to restore everyday cleanliness and deep cleaning, also as move-in or move-out cleaning or after a longer break. We also wash windows and do extra jobs such as cleaning the inside of ovens, fridges and cupboards, or cleaning balconies and terraces. You can also rent an upholstery cleaning machine for sofas, carpets and mattresses.",
    ],
    onceTitle: "One-time or regular, without a long-term contract",
    once: "Each cleaning is a separate order: there is no ongoing contract or monthly fee and no obligation to order again. We can also come regularly, for example weekly or monthly, for homes and companies – we send a separate offer for each visit and you can stop at any time.",
    howTitle: "How to order",
    how: [
      "Use the price calculator below to get an estimate and send a request.",
      "We send you an offer by email with a fixed price and time.",
      "The contract is concluded only when you confirm the offer.",
      "After the cleaning you receive an invoice and pay by bank transfer.",
    ],
  },
} as const;

export function Intro() {
  const { lang } = useLang();
  const c = COPY[lang];
  return (
    <section id="teenus" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={c.eyebrow} title={c.lead} accent={c.leadAccent} subtitle={c.leadText} />

        <p className="mt-20 text-[11px] font-medium uppercase tracking-[0.3em] text-accent">{c.howEyebrow}</p>
        <ol className="mt-8 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {c.how.map((s, i) => (
            <li key={s} className="border-t border-gold/60 pt-6">
              <span className="font-display text-5xl font-light italic text-accent">{i + 1}</span>
              <p className="mt-4 text-base font-light leading-relaxed text-secondary-foreground">{s}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function About() {
  const { lang } = useLang();
  const c = COPY[lang];
  return (
    <section id="meist" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[3fr_2fr]">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">{c.aboutEyebrow}</p>
          <h2 className="mt-5 font-display text-3xl font-light leading-[1.15] tracking-tight sm:text-4xl">{c.title}</h2>
          {c.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="mt-6 max-w-2xl text-base font-light leading-relaxed text-secondary-foreground">
              {p}
            </p>
          ))}
        </div>
        <div className="self-end border-t border-gold/60 pt-6">
          <h3 className="font-display text-2xl font-light">{c.onceTitle}</h3>
          <p className="mt-4 text-base font-light leading-relaxed text-secondary-foreground">{c.once}</p>
        </div>
      </div>
    </section>
  );
}
