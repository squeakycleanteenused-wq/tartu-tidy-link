import { useLang } from "@/lib/i18n";

/* Avalehe tutvustus: mida pakume, kus ja et iga teenus on ühekordne. */
const COPY = {
  et: {
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
    <section id="teenus" className="scroll-mt-28 border-b border-border py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[3fr_2fr]">
        <div>
          <h2 className="text-3xl font-bold sm:text-4xl">{c.title}</h2>
          {c.paragraphs.map((p) => (
            <p key={p.slice(0, 20)} className="mt-4 max-w-2xl text-base leading-relaxed text-secondary-foreground">
              {p}
            </p>
          ))}
        </div>
        <div className="space-y-8">
          <div className="border-t-2 border-gold pt-4">
            <h3 className="font-sans text-base font-semibold">{c.onceTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{c.once}</p>
          </div>
          <div className="border-t-2 border-gold pt-4">
            <h3 className="font-sans text-base font-semibold">{c.howTitle}</h3>
            <ol className="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-secondary-foreground">
              {c.how.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
