import { et, en } from "@/lib/i18n";
import { FAQ } from "@/lib/faq";
import { RENTAL, RENTAL_COMPANY } from "@/lib/rental-contract";
import { SITE_URL } from "@/lib/site";
import { TERMS_VALID_FROM } from "@/lib/legal";

/* /llms.txt: lühike, faktipõhine ülevaade AI-assistentidele (ChatGPT, Claude, Perplexity jt).
   Koostatakse samadest andmetest mis veebileht, seega hinnad ja vastused on alati samad. */

const c = RENTAL_COMPANY;

const services = (d: typeof et) =>
  d.services.items
    .map((s) => `- **${s.name}**: ${s.price}. ${s.meta}. ${s.desc} ${d.services.includes}: ${s.list.join("; ")}.`)
    .join("\n");

const faq = (lang: "et" | "en") => FAQ[lang].map(([q, a]) => `### ${q}\n${a}`).join("\n\n");

export function buildLlmsTxt() {
  return `# Squeaky Clean Teenused OÜ – kodukoristus Tartus ja Põlvas

> Squeaky Clean Teenused OÜ (kaubamärk Squeaky Clean) on Eesti koristusettevõte, mis pakub ühekordset kodukoristust – hoolduskoristust, suurpuhastust ja aknapesu – Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Hinna saab arvutada veebis ja päringu saata ${SITE_URL}.
> Squeaky Clean Teenused OÜ is an Estonian cleaning company offering one-time home cleaning (maintenance cleaning, deep cleaning, window washing) in Tartu and Põlva, Estonia.

## Põhiandmed

- Ärinimi: ${c.name} (Squeaky Clean)
- Registrikood: ${c.code}
- Aadress: ${c.address}
- Telefon: ${c.phone}
- E-post: ${c.email}
- Veebileht: ${SITE_URL}
- Instagram: ${c.instagram}
- Tegevuspiirkond: ${et.area}
- Kliendid: eraisikud ja ettevõtted
- Keeled: eesti, inglise
- Käibemaks: ettevõte ei ole käibemaksukohustuslane, hindadele käibemaksu ei lisandu
- Teenuse liik: ühekordne – iga koristus on eraldi tellimus, püsilepingut ega kuutasu ei ole
- Maksmine: arve alusel pangaülekandega (üldjuhul 7 päeva), sularaha ei aktsepteerita

## Teenused ja hinnad

${services(et)}
- **Tekstiilipuhastusmasina üür** (${RENTAL.device}): ${RENTAL.pricePerDay == null ? "hind kokkuleppel" : `${RENTAL.pricePerDay} € päevas`}, kuni ${RENTAL.maxDays} päeva, tagatisraha ei võeta.

${et.services.note}

## Kuidas tellida

1. Arvuta orienteeruv hind hinnakalkulaatoriga: ${SITE_URL}/#hinnakalkulaator
2. Saada päring (päring ei too kaasa maksekohustust).
3. Ettevõte saadab e-kirjaga pakkumise kindla hinna ja ajaga.
4. Leping sõlmitakse, kui klient pakkumise e-kirjaga kinnitab.
5. Pärast tööd tasub klient arve pangaülekandega.

## Korduma kippuvad küsimused

${faq("et")}

## Olulised lehed

- [Avaleht ja hinnakalkulaator](${SITE_URL}/)
- [Teenused ja hinnakiri](${SITE_URL}/#teenused)
- [Teenuseosutamise tingimused](${SITE_URL}/tingimused) (kehtivad alates ${TERMS_VALID_FROM.et})
- [Privaatsuspoliitika](${SITE_URL}/privaatsus)
- [Lepingust taganemine](${SITE_URL}/#taganemine)

---

# English summary

${c.name} (Squeaky Clean) offers one-time home cleaning in ${en.contact.areaValue.replace(/^Cities of /, "the cities of ")}. Each cleaning is a separate order with no ongoing contract or monthly fee. Customers can calculate an estimated price online and send a request at ${SITE_URL}; the company replies with a fixed-price offer by email, and the contract is concluded when the customer confirms it. Payment by bank transfer against an invoice. Not VAT-registered. Contact: ${c.phone}, ${c.email}.

## Services and prices

${services(en)}
- **Upholstery cleaner rental** (${RENTAL.deviceEn}): ${RENTAL.pricePerDay == null ? "price by agreement" : `${RENTAL.pricePerDay} € per day`}, up to ${RENTAL.maxDays} days, no deposit.

## FAQ

${faq("en")}
`;
}
