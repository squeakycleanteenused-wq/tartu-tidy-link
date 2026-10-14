import type { Lang } from "@/lib/i18n";

/* Korduma kippuvad küsimused. Vastused peavad olema kooskõlas tingimustega (src/lib/legal.ts)
   ja hinnakirjaga (src/lib/i18n.tsx). Kasutatakse avalehel ja Google'i FAQ struktureeritud andmetes. */
export const FAQ: Record<Lang, [string, string][]> = {
  et: [
    ["Kui palju koristus maksab?", "Hoolduskoristus maksab 60–70 € kuni 70 m² eluruumi kohta ja suurpuhastus 80–100 €; suurema pinna eest lisandub tasu proportsionaalselt. Aknapesu alates 3,50 €/tk, lisatööd 15 €/h, minimaalne väljakutsetasu 30 €. Hinnakalkulaatoriga näed orienteeruva hinna kohe ja pakkumises saad kindla hinna."],
    ["Kas pean sõlmima püsilepingu?", "Ei. Iga koristus on ühekordne teenus ja eraldi tellimus. Püsilepingut, kuutasu ega minimaalset perioodi ei ole. Korduva koristuse soovi korral teeme igaks korraks eraldi pakkumise."],
    ["Kuidas tellimine käib?", "Arvuta hind kalkulaatoriga ja saada päring. Saadame sulle e-kirjaga pakkumise kindla hinna ja ajaga. Leping sõlmitakse alles siis, kui sa pakkumise kinnitad; päringu saatmine ei too kaasa maksekohustust."],
    ["Mida pean enne koristust tegema?", "Taga kokkulepitud ajal ligipääs, töötav elekter ning soe ja külm vesi. Eemalda või lukusta sularaha, väärisasjad, dokumendid ja kergesti purunevad esemed ning anna ette teada erihooldust vajavatest pindadest (nt õlitatud põrandad, looduskivi)."],
    ["Kas koristaja võtab tolmuimeja kaasa?", "Kui koristaja saab kasutada sinu töökorras tolmuimejat, kasutab ta seda. Kui ei, võtab koristaja oma tolmuimeja kaasa ja lisatasu lepime kokku eraldi. Selle saad valida hinnakalkulaatoris."],
    ["Kuidas saan maksta?", "Arve alusel pangaülekandega, maksetähtaeg on üldjuhul 7 päeva. Sularahas maksta ei saa. Suuremate tööde ja esmatellimuste puhul võime küsida ettemaksu, see lepitakse kokku pakkumises. Käibemaksu hinnale ei lisandu."],
    ["Kas saan tellimuse tühistada?", "Jah. Tasuta tühistamine kuni 24 h enne töö algust. Eraisikul on lisaks 14-päevane taganemisõigus: taganeda saab lehe ülamenüüs nupuga „Taganen lepingust“. Ettevõttest tellija tasub hilisema tühistamise korral 30 €."],
    ["Mis siis, kui ma ei ole tulemusega rahul?", "Anna puudusest teada kohe kohapeal või fotodega mõistliku aja jooksul. Puuduse korral teeme tasuta parandustöö."],
    ["Kus te koristate?", "Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses."],
    ["Kas saab tellida regulaarset koristust?", "Jah. Käime soovi korral regulaarselt, näiteks kord nädalas või kord kuus, nii kodudes kui ka ettevõtetes. Iga külastus on eraldi tellimus, mille kohta saadame pakkumise; püsilepingut ega kuutasu ei ole ja võid igal ajal lõpetada."],
    ["Kas teete kolimiskoristust?", "Jah. Kolimiskoristuseks sobib suurpuhastus (80–100 € kuni 70 m², suurema pinna eest proportsionaalselt), mis sisaldab kogu hoolduskoristuse mahtu ning lisaks köögipindade rasva eemaldamist, katlakivi ja vuukide pesu ning liistude, uste ja lülitite puhastust. Akende pesu saab lisada eraldi."],
    ["Kas puhastate diivaneid ja vaipu?", "Pehme mööbli, vaipade ja madratsite puhastamiseks saad meilt üürida tekstiilipuhastusmasina ja puhastada need ise. Masina saab valida hinnakalkulaatoris."],
    ["Kas koristate ka ettevõtetele?", "Jah. Ettevõttena tellides märgi hinnakalkulaatoris tellija tüübiks „Ettevõte“ ning lisa ettevõtte nimi ja registrikood, siis koostame arve ettevõttele."],
  ],
  en: [
    ["How much does cleaning cost?", "Maintenance cleaning costs 60–70 € for a home of up to 70 m² and deep cleaning 80–100 €; larger areas are charged proportionally. Window washing from 3.50 €/pc, extra work 15 €/h, minimum call-out fee 30 €. The price calculator shows an estimate right away and the offer gives you a fixed price."],
    ["Do I need an ongoing contract?", "No. Each cleaning is a one-time service and a separate order. There is no ongoing contract, monthly fee or minimum period. For regular cleaning we make a separate offer for each visit."],
    ["How does ordering work?", "Calculate the price and send a request. We email you an offer with a fixed price and time. The contract is concluded only when you confirm the offer; sending a request creates no obligation to pay."],
    ["What do I need to do before the cleaning?", "Ensure access at the agreed time, working electricity and hot and cold water. Remove or lock away cash, valuables, documents and fragile items, and tell us in advance about surfaces needing special care (e.g. oiled floors, natural stone)."],
    ["Does the cleaner bring a vacuum cleaner?", "If the cleaner can use your working vacuum cleaner, they will use it. If not, the cleaner brings their own and the extra fee is agreed separately. You can choose this in the price calculator."],
    ["How can I pay?", "By bank transfer against an invoice, generally within 7 days. Cash is not accepted. For larger jobs and first orders we may ask for a prepayment, agreed in the offer. No VAT is added to the price."],
    ["Can I cancel my order?", "Yes. Free cancellation up to 24 h before the start. Private customers also have a 14-day right of withdrawal: use the “Withdraw from a contract” button in the top menu. Business customers pay 30 € for later cancellation."],
    ["What if I am not happy with the result?", "Tell us about the defect immediately on site or with photos within a reasonable time. We will fix defects free of charge."],
    ["Where do you clean?", "In the cities of Tartu and Põlva and, by agreement, their surroundings."],
    ["Can I order regular cleaning?", "Yes. We can come regularly, for example weekly or monthly, for homes and companies. Each visit is a separate order with its own offer; there is no ongoing contract or monthly fee and you can stop at any time."],
    ["Do you do move-out cleaning?", "Yes. Deep cleaning (80–100 € up to 70 m², larger areas proportionally) is suitable for move-in or move-out cleaning. It includes everything in maintenance cleaning plus degreasing kitchen surfaces, limescale and grout cleaning, and cleaning skirting boards, doors and switches. Window washing can be added separately."],
    ["Do you clean sofas and carpets?", "To clean upholstery, carpets and mattresses you can rent an upholstery cleaning machine from us and clean them yourself. You can choose the machine in the price calculator."],
    ["Do you clean for companies too?", "Yes. When ordering as a company, choose “Company” as the customer type in the price calculator and add the company name and registry code, and we will invoice the company."],
  ],
};

/* Google FAQPage struktureeritud andmed (eesti keeles, nagu lehe vaikimisi keel). */
export const faqJsonLd = {
  type: "application/ld+json",
  children: JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.et.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  }),
};
