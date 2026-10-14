import { useLang } from "@/lib/i18n";

/* "Miks valida meid": ainult väited, mis tulenevad meie tingimustest ja hinnakirjast.
   Ära lisa siia kinnitamata väiteid (nt kindlustus, ökovahendid, arvustused). */
const COPY = {
  et: {
    title: "Miks valida Squeaky Clean",
    items: [
      ["Hind on teada enne tööd", "Kalkulaator näitab orienteeruva hinna kohe ja pakkumises saad kindla hinna. Kui olukord kohapeal oluliselt erineb, küsime enne töö algust sinu nõusolekut."],
      ["Ilma kohustusteta", "Iga koristus on eraldi tellimus – nii ühekordne kui ka regulaarne. Püsilepingut, kuutasu ega minimaalset perioodi ei ole."],
      ["Maksad arve alusel", "Tasumine pangaülekandega arve alusel, üldjuhul 7-päevase maksetähtajaga. Hinnale käibemaksu ei lisandu."],
      ["Kohalik teenus", "Koristame Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses."],
      ["Selged tingimused", "Tingimused, privaatsuspoliitika ja 14-päevane taganemisõigus eraisikule on lehel avalikult kirjas."],
      ["Ka erisoovid", "Lisatööd tunnihinnaga, nõuanne foto põhjal ja tekstiilipuhastusmasina üür polstermööbli ja vaipade jaoks."],
    ],
  },
  en: {
    title: "Why choose Squeaky Clean",
    items: [
      ["Know the price before the work", "The calculator shows an estimate right away and the offer gives you a fixed price. If the situation on site differs significantly, we ask for your consent before starting."],
      ["No commitments", "Each cleaning is a separate order – one-time or regular. No ongoing contract, monthly fee or minimum period."],
      ["Pay by invoice", "Payment by bank transfer against an invoice, generally within 7 days. No VAT is added to the price."],
      ["Local service", "We clean in the cities of Tartu and Põlva and, by agreement, their surroundings."],
      ["Clear terms", "Our terms, privacy policy and the 14-day right of withdrawal for private customers are published on the site."],
      ["Special requests too", "Extra jobs at an hourly rate, advice based on a photo and rental of an upholstery cleaning machine for sofas and carpets."],
    ],
  },
} as const;

export function WhyUs() {
  const { lang } = useLang();
  const c = COPY[lang];
  return (
    <section id="miks-meie" className="scroll-mt-28 border-b border-border py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{c.title}</h2>
        <ol className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {c.items.map(([h, p], i) => (
            <li key={h} className="border-t-2 border-gold pt-4">
              <p className="font-display text-sm font-bold text-accent">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-1 font-sans text-base font-semibold">{h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{p}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
