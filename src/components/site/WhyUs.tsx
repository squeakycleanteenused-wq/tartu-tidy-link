import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";

/* "Miks valida meid": ainult väited, mis tulenevad meie tingimustest ja hinnakirjast.
   Ära lisa siia kinnitamata väiteid (nt kindlustus, ökovahendid, arvustused). */
const COPY = {
  et: {
    eyebrow: "Meie lubadus",
    title: "Kolm asja,",
    accent: "milles võid kindel olla",
    items: [
      ["Kindel hind enne tööd", "Kalkulaator näitab orienteeruva hinna kohe ja pakkumises saad kindla hinna. Kui olukord kohapeal oluliselt erineb, küsime enne töö algust sinu nõusolekut. Maksad arve alusel, käibemaksu ei lisandu."],
      ["Ilma lepingu sidumiseta", "Iga koristus on eraldi tellimus, nii ühekordne kui ka regulaarne. Püsilepingut, kuutasu ega minimaalset perioodi ei ole."],
      ["Kohalik ja selge", "Koristame Tartu ja Põlva linnas ning kokkuleppel lähiümbruses. Tingimused ja 14-päevane taganemisõigus eraisikule on lehel avalikult kirjas."],
    ],
  },
  en: {
    eyebrow: "Our promise",
    title: "Three things",
    accent: "you can count on",
    items: [
      ["A fixed price before the work", "The calculator shows an estimate right away and the offer gives you a fixed price. If the situation on site differs significantly, we ask for your consent before starting. You pay by invoice, with no VAT added."],
      ["No commitment", "Each cleaning is a separate order, one-time or regular. No ongoing contract, monthly fee or minimum period."],
      ["Local and clear", "We clean in the cities of Tartu and Põlva and, by agreement, their surroundings. Our terms and the 14-day right of withdrawal for private customers are published on the site."],
    ],
  },
} as const;

export function WhyUs() {
  const { lang } = useLang();
  const c = COPY[lang];
  return (
    <section id="miks-meie" className="scroll-mt-28 bg-ink py-24 text-white sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading dark eyebrow={c.eyebrow} title={c.title} accent={c.accent} />
        <ol className="mt-16 grid gap-x-12 gap-y-12 md:grid-cols-3">
          {c.items.map(([h, p], i) => (
            <li key={h} className="border-t border-gold/50 pt-8">
              <p className="font-display text-sm italic text-gold">{["I", "II", "III"][i]}</p>
              <h3 className="mt-4 font-display text-2xl font-light text-white sm:text-3xl">{h}</h3>
              <p className="mt-4 text-base font-light leading-relaxed text-white/70">{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
