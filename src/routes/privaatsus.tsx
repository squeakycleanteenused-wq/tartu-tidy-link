import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { SITE_URL, canonical } from "@/lib/site";

const title = "Privaatsuspoliitika | Squeaky Clean Teenused OÜ";
const description = "Kuidas Squeaky Clean Teenused OÜ sinu isikuandmeid töötleb, kellele neid edastab ja millised on sinu õigused.";

export const Route = createFileRoute("/privaatsus")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/privaatsus` },
    ],
    links: [canonical("/privaatsus")],
  }),
  component: PrivacyPage,
});

/* Muuda siin, kui lisandub uus teenusepakkuja või muutub andmete kasutus. */
const c = RENTAL_COMPANY;
const COPY = {
  et: {
    back: "Tagasi avalehele",
    title: "Privaatsuspoliitika",
    intro: "Kehtib alates 01.10.2026. Siin selgitame, milliseid isikuandmeid me kogume, miks, kellele neid edastame ja millised on sinu õigused.",
    sections: [
      ["1. Vastutav töötleja", `${c.name}, registrikood ${c.code}, aadress ${c.address}, e-post ${c.email}, telefon ${c.phone}. Andmekaitse küsimustes kirjuta samale e-posti aadressile.`],
      ["2. Milliseid andmeid töötleme", "Hinnapäring ja leping: nimi, e-post, telefon, koristusobjekti aadress ja asukoht, soovitud aeg, lisainfo (nt allergiad), ettevõtte puhul ettevõtte nimi ja registrikood. Tekstiilipuhastaja üür: lisaks eraisiku isikukood ja elukoha aadress või ettevõtte esindaja nimi ja asukoha aadress. Küsimus fotoga: fotod, küsimus, e-post ja nimi (valikuline). Taganemisavaldus: nimi, aadress, lepingu andmed ja e-post. E-poe teavitus: e-posti aadress. Veebilehe kasutamine: tehnilised andmed, nt IP-aadress, mida majutusteenuse pakkuja töötleb lehe toimimiseks ja turvalisuseks."],
      ["3. Eesmärgid ja õiguslik alus", "Pakkumise koostamine, lepingu sõlmimine ja täitmine (isikuandmete kaitse üldmääruse art 6 lg 1 p b). Arvete ja raamatupidamisdokumentide säilitamine (art 6 lg 1 p c, raamatupidamise seadus). Nõuete esitamine ja kaitsmine, nt kahju korral üüritud masinale; selleks kasutame ka isikukoodi (art 6 lg 1 p f, õigustatud huvi). Fotode põhjal nõu andmine ja e-poe avamise teavitus (art 6 lg 1 p a, nõusolek). Reklaami tulemuslikkuse mõõtmine Google Adsiga (art 6 lg 1 p a, nõusolek)."],
      ["4. Kellele andmeid edastame", "Kasutame teenusepakkujaid, kes töötlevad andmeid meie nimel ja meie juhiste järgi: Vercel Inc. (veebilehe majutus), Supabase (andmebaas e-poe teavituste jaoks), EmailJS (päringute ja kinnituste e-kirjade saatmine), Google (e-postkast Gmail ja Google Ads). Raamatupidamiseks võime andmeid edastada raamatupidamisteenuse osutajale. Andmeid ei müüda ega anta muul eesmärgil kolmandatele isikutele, välja arvatud juhul, kui seadus seda nõuab."],
      ["5. Andmete edastamine väljapoole Euroopa Liitu", "Osa teenusepakkujaid (nt Vercel ja Google) võib andmeid töödelda ka USA-s. Sel juhul toimub edastamine EL-i ja USA andmekaitseraamistiku või Euroopa Komisjoni kinnitatud lepingu tüüptingimuste alusel."],
      ["6. Kui kaua andmeid säilitame", "Arveid ja raamatupidamisdokumente 7 aastat (raamatupidamise seadus). Lepingu andmeid ja kirjavahetust kuni lepingust tulenevate nõuete aegumiseni (üldjuhul 3 aastat pärast lepingu täitmist). Päringuid, millest lepingut ei sündinud, ning fotosid ja küsimusi nii kaua, kui see on vajalik vastamiseks ja võimalike küsimuste lahendamiseks, kuid mitte kauem kui 12 kuud. E-poe teavituse aadressi kuni e-poe avamise teavituse saatmiseni või nõusoleku tagasivõtmiseni."],
      ["7. Sinu õigused", "Sul on õigus tutvuda oma andmetega, nõuda nende parandamist või kustutamist, piirata töötlemist, esitada vastuväiteid õigustatud huvil põhinevale töötlemisele ja saada oma andmed masinloetaval kujul. Nõusolekul põhineva töötlemise puhul võid nõusoleku igal ajal tagasi võtta; see ei mõjuta varasema töötlemise seaduslikkust. Kirjuta selleks aadressile " + c.email + ". Kui leiad, et rikume sinu õigusi, võid pöörduda Andmekaitse Inspektsiooni poole (www.aki.ee)."],
      ["8. Automatiseeritud otsused", "Me ei tee sinu kohta automatiseeritud otsuseid ega profiilianalüüsi, millel oleks sinu jaoks õiguslikke tagajärgi. Hinnakalkulaator arvutab orienteeruva hinna ainult sinu sisestatud andmete põhjal."],
    ] as [string, string][],
  },
  en: {
    back: "Back to home",
    title: "Privacy policy",
    intro: "Valid from 1 October 2026. This policy explains which personal data we collect, why, to whom we disclose it and what your rights are.",
    sections: [
      ["1. Controller", `${c.name}, registry code ${c.code}, address ${c.address}, email ${c.email}, phone ${c.phone}. For data protection questions, write to the same email address.`],
      ["2. Data we process", "Price request and contract: name, email, phone, address and location of the cleaning site, preferred time, additional information (e.g. allergies), and for companies the company name and registry code. Upholstery cleaner rental: additionally a private person's personal ID code and home address, or a company representative's name and registered address. Question with a photo: photos, question, email and name (optional). Withdrawal notice: name, address, contract details and email. Shop notification: email address. Use of the website: technical data such as IP address, processed by the hosting provider to run and secure the site."],
      ["3. Purposes and legal basis", "Preparing the offer and concluding and performing the contract (GDPR Art. 6(1)(b)). Keeping invoices and accounting records (Art. 6(1)(c), Accounting Act). Making and defending claims, e.g. if a rented machine is damaged; we also use the personal ID code for this (Art. 6(1)(f), legitimate interest). Giving advice based on photos and notifying you when the shop opens (Art. 6(1)(a), consent). Measuring advertising performance with Google Ads (Art. 6(1)(a), consent)."],
      ["4. Recipients", "We use service providers that process data on our behalf and on our instructions: Vercel Inc. (website hosting), Supabase (database for shop notifications), EmailJS (sending request and confirmation emails), Google (Gmail mailbox and Google Ads). We may share data with an accounting service provider for bookkeeping. We do not sell data or share it with third parties for other purposes unless required by law."],
      ["5. Transfers outside the EU", "Some service providers (e.g. Vercel and Google) may also process data in the USA. Such transfers are based on the EU-US Data Privacy Framework or the European Commission's standard contractual clauses."],
      ["6. Retention", "Invoices and accounting records: 7 years (Accounting Act). Contract data and correspondence: until contractual claims expire (generally 3 years after performance). Requests that did not lead to a contract, and photos and questions: as long as needed to reply and resolve any questions, but no longer than 12 months. Shop notification address: until the opening notice is sent or you withdraw consent."],
      ["7. Your rights", "You have the right to access your data, request correction or erasure, restrict processing, object to processing based on legitimate interest and receive your data in a machine-readable format. Where processing is based on consent, you may withdraw it at any time; this does not affect the lawfulness of earlier processing. To exercise your rights, write to " + c.email + ". If you believe we are infringing your rights, you may contact the Estonian Data Protection Inspectorate (www.aki.ee)."],
      ["8. Automated decisions", "We do not make automated decisions or profiling with legal effects concerning you. The price calculator only calculates an estimate from the data you enter."],
    ] as [string, string][],
  },
};

function PrivacyContent() {
  const { lang } = useLang();
  const t = COPY[lang];
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {t.back}
      </Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t.intro}</p>
      <div className="mt-10 space-y-7">
        {t.sections.map(([h, p]) => (
          <section key={h}>
            <h2 className="font-sans text-base font-semibold">{h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{p}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <SiteLayout>
      <PrivacyContent />
    </SiteLayout>
  );
}
