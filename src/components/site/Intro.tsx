import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";

/* Intro: lühike lubadus ja tellimise sammud kohe foto all.
   About: pikem tutvustus (oluline otsingumootoritele), asub lehe allosas KKK järel. */
const COPY = {
  et: {
    eyebrow: "Squeaky Clean",
    lead: "Puhas kodu,",
    leadAccent: "ilma et peaksid sellele mõtlema.",
    leadText: "Ütle meile, mida vajad. Meie saadame kindla hinna, tuleme kokkulepitud ajal ja sina saad oma aja tagasi.",
    howEyebrow: "Kuidas see käib",
    aboutEyebrow: "Meist",
    title: "Ühekordne kodukoristus Tartus, Põlvas ja lähiümbruses",
    paragraphs: [
      "Squeaky Clean Teenused OÜ pakub kodukoristusteenust Tartu linnas, Põlva linnas ja kokkuleppel nende lähiümbruses. Koristame kortereid ja maju nii eraisikutele kui ka ettevõtetele. Koristaja koju saad tellida lihtsalt veebis: arvuta hind ja saada päring.",
      "Pakume hoolduskoristust, mis taastab igapäevase puhtuse, ja suurpuhastust, mis sobib ka kolimiskoristuseks enne või pärast kolimist või pärast pikemat pausi. Lisaks peseme aknaid ning teeme lisatöid, näiteks ahju, külmkapi ja kappide sisepesu või rõdu ja terrassi koristuse. Meilt saab üürida ka tekstiilipuhastusmasina polstermööbli, vaipade ja madratsite puhastamiseks.",
    ],
    onceTitle: "Ühekordne või regulaarne, ilma püsilepinguta",
    once: "Iga koristus on eraldi tellimus: püsilepingut ega kuutasu ei ole ja sul ei teki kohustust uuesti tellida. Soovi korral käime ka regulaarselt, näiteks kord nädalas või kord kuus, nii kodudes kui ka ettevõtetes – iga külastuse kohta saadame eraldi pakkumise ja võid igal ajal lõpetada.",
    howTitle: "Kuidas tellida",
    how: [
      "Arvuta allpool hinnakalkulaatoriga orienteeruv hind ja saada päring.",
      "Saadame sulle e-kirjaga pakkumise kindla hinna ja ajaga.",
      "Leping sõlmitakse alles siis, kui sa pakkumise kinnitad.",
      "Pärast koristust saad arve ja tasud pangaülekandega.",
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
