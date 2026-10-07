import type { Lang } from "@/lib/i18n";
import { RENTAL, RENTAL_COMPANY, companyContact } from "@/lib/rental-contract";

/* ------------------------------------------------------------------ */
/* TEENUSEOSUTAMISE TINGIMUSED: üks allikas kalkulaatorile ja          */
/* tingimuste lehele (/tingimused). Muuda tingimusi ainult siin.       */
/* ------------------------------------------------------------------ */

export const TERMS_VALID_FROM = { et: "01.10.2026", en: "1 October 2026" };

const provider = (lang: Lang) => `${RENTAL_COMPANY.name}, ${companyContact(lang)}.`;

const ET = {
  items: [
    ["Teenuseosutaja", "__PROVIDER__ Tegevuspiirkond: Tartu ja Põlva linn ning kokkuleppel nende lähiümbrus. Kaebused ja küsimused palume saata ülaltoodud aadressile või e-postile."],
    ["Lepingu sõlmimine", "Hinnakalkulaator ja päring ei ole siduv pakkumine ega leping ning päringu saatmine ei too kaasa maksekohustust. Pärast päringut saadame sulle e-kirjaga pakkumise, milles on lõplik kindel hind, aeg, tingimused ning taganemisinfo ja tüüpvorm. Leping sõlmitakse, kui vastad pakkumisele e-kirjaga ja kinnitad selle. Kuni kinnitamiseni ei ole sul mingeid kohustusi. Lepingu sõlmimise keel on eesti keel (soovi korral suhtleme ka inglise keeles). Pakkumise ja sinu kinnituse e-kirjad jäävad mõlemale poolele alles."],
    ["Hind ja käibemaks", "Ettevõte ei ole käibemaksukohustuslane, käibemaksu hinnale ei lisandu. Kalkulaatori hind on orienteeruv; siduv on pakkumises märgitud kindel hind. Minimaalne väljakutsetasu on 30 € (2 töötundi). Kui mustuse aste või töömaht erineb oluliselt kirjeldatust, võime hinda enne töö algust korrigeerida või tööaega pikendada (lisatööde tunnihind 15 €/h). Enne töö algust küsime sinu nõusolekut uue hinnaga. Kui sa ei nõustu, võid tööst loobuda ja tasud ainult minimaalse väljakutsetasu (30 €)."],
    ["Arveldamine", "Tasumine toimub arve alusel pangaülekandega (maksetähtaeg üldjuhul 7 päeva). Sularahamakseid ei aktsepteerita. Maksmisega viivitamisel on viivis seadusjärgses määras (võlaõigusseaduse § 113). Teenuseosutajal on õigus nõuda mõistlikku ettemaksu, eriti suuremate tööde ja esmatellimuste puhul; see lepitakse kokku pakkumises."],
    ["Kliendi kohustused", "Klient tagab kokkulepitud ajal takistusteta ligipääsu, töötava elektri, sooja ja külma vee ning võimaluse kasutada töökorras tolmuimejat (vastasel juhul toome lisatasu eest kaasa oma tolmuimeja). Erihooldust vajavatest pindadest (nt õlitatud põrandad, looduskivi) tuleb ette teatada. Sularaha, väärisasjad, dokumendid ja kergesti purunevad esemed tuleb enne eemaldada või lukustada. Isiklikke asju me ei tõsta ega korrasta."],
    ["Tühistamine", "Tasuta tühistamine kuni 24 h enne töö algust. Hilisema tühistamise või sissepääsu mittetagamise korral (ooteaeg uksel kuni 30 min) on tasu 30 €."],
    ["Vastutus", "Teenuseosutaja vastutab töö käigus tekitatud otsese ja tõendatud varakahju eest seaduses sätestatud korras. Vastutus ei laiene pindade eelnevale kulumisele, varjatud puudustele ega teavitamata erimaterjalide kahjustustele. See ei piira tarbija seadusest tulenevaid õigusi ega meie vastutust tahtluse ja raske hooletuse eest."],
    ["Pretensioonid", "Puudustest teavita kohe kohapeal või fotodega mõistliku aja jooksul (ettevõttest tellijal 24 h jooksul). Puuduse korral teeme tasuta parandustöö. See ei lühenda tarbija seadusest tulenevaid tähtaegu ega õiguskaitsevahendeid. Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole (Tarbijakaitse ja Tehnilise Järelevalve Amet, www.ttja.ee)."],
    ["Tekstiilipuhastaja üür", `Üüritakse ${RENTAL.device} polstermööbli, vaipade ja madratsite puhastamiseks. Üür on ${RENTAL.pricePerDay == null ? "kokkuleppel" : `${RENTAL.pricePerDay} € päevas`} (käibemaksuta), üüriperiood kuni ${RENTAL.maxDays} päeva. Tagatisraha ei võeta. Kui masin saab Üürniku süül kahjustada, lepitakse hüvitis kokku; kokkuleppe puudumisel on hüvitis põhjendatud remondikulu, kuid mitte üle masina turuväärtuse. Tavapärast kulumist ei hüvitata. Eraisikust Üürniku puhul kasutatakse isikukoodi tuvastamiseks võimaliku kahjunõude korral. Masin antakse üle ja tagastatakse kokkulepitud kohas puhtana; tagastamise otsesed kulud kannab Üürnik, kui pooled ei lepi kokku teisiti. Üüri täistingimused on üürilepingus, mille näed hinnakalkulaatoris enne päringu saatmist.`],
    ["Isikuandmed", "Vastutav töötleja on Squeaky Clean Teenused OÜ. Töötleme sinu andmeid pakkumise koostamiseks ja lepingu täitmiseks. Täpsem teave, sh andmete saajad, säilitamise tähtajad ja sinu õigused, on privaatsuspoliitikas (/privaatsus). Kvaliteedikontrolliks võime teha „enne ja pärast“ fotosid ilma isikuandmeid jäädvustamata."],
  ] as [string, string][],
  withdrawalPerson: [
    "Taganemisõigus (eraisik)",
    "Sul on õigus sidevahendi teel sõlmitud lepingust 14 päeva jooksul põhjust avaldamata taganeda. Tähtaeg algab lepingu sõlmimisest ehk päevast, mil kinnitasid meie pakkumise. Taganemiseks kasuta lehe ülamenüüs olevat nuppu „Taganen lepingust“ (vorm on lehe allosas jaotises „Taganen lepingust“) või saada meile e-postiga ühemõtteline avaldus; võid kasutada taganemisavalduse tüüpvormi. Tähtaja pidamiseks piisab avalduse ärasaatmisest. Kui soovid teenust alustada enne selle tähtaja lõppu, tasud taganemisel juba osutatud teenuse eest proportsionaalselt ning teenuse täielikul osutamisel taganemisõigus kaob.",
  ] as [string, string],
  withdrawalCompany: ["Taganemisõigus", "Ettevõttest tellijale tarbija taganemisõigus ei kohaldu."] as [string, string],
};

const EN: typeof ET = {
  items: [
    ["Service provider", "__PROVIDER__ Service area: Tartu and Põlva cities and, by agreement, their surroundings. Please send complaints and questions to the address or email above."],
    ["Conclusion of contract", "The price calculator and your request are not a binding offer or contract, and sending a request creates no obligation to pay. After your request we send you an offer by email with the final fixed price, time, terms, and the withdrawal information and standard form. The contract is concluded when you reply to the offer by email and confirm it. Until you confirm, you have no obligations. The contract language is Estonian (we can also communicate in English). The offer and your confirmation emails remain available to both parties."],
    ["Price and VAT", "The company is not VAT-registered; VAT is not added to prices. The calculator price is an estimate; the fixed price stated in the offer is binding. The minimum call-out fee is 30 € (2 working hours). If the level of dirt or the scope differs significantly from the description, we may adjust the price or extend the working time before starting (extra work 15 €/h). We ask for your consent to the new price before starting. If you do not agree, you may cancel the work and pay only the minimum call-out fee (30 €)."],
    ["Payment", "Payment is made against an invoice by bank transfer (payment term generally 7 days). Cash payments are not accepted. Late payment interest is charged at the statutory rate (Law of Obligations Act § 113). The provider may require a reasonable prepayment, especially for larger jobs and first orders; this is agreed in the offer."],
    ["Customer obligations", "The customer ensures unobstructed access at the agreed time, working electricity, hot and cold water, and the use of a working vacuum cleaner (otherwise we bring our own for an extra fee). Surfaces needing special care (e.g. oiled floors, natural stone) must be reported in advance. Cash, valuables, documents and fragile items must be removed or locked away. We do not move or organise personal belongings."],
    ["Cancellation", "Free cancellation up to 24 h before the start. For later cancellation or no access (waiting time at the door up to 30 min) a 30 € fee applies."],
    ["Liability", "The provider is liable for direct, proven property damage caused during the work as provided by law. Liability does not cover prior wear of surfaces, hidden defects or damage to special materials not disclosed in advance. This does not limit consumer rights under law or our liability for intent and gross negligence."],
    ["Complaints", "Report defects immediately on site or with photos within a reasonable time (business customers within 24 h). We will fix defects free of charge. This does not shorten the statutory periods or remedies available to consumers. Consumers may turn to the Consumer Disputes Committee (Consumer Protection and Technical Regulatory Authority, www.ttja.ee)."],
    ["Upholstery cleaner rental", `We rent out the ${RENTAL.deviceEn} for cleaning upholstery, carpets and mattresses. The rent is ${RENTAL.pricePerDay == null ? "agreed individually" : `${RENTAL.pricePerDay} € per day`} (no VAT), for up to ${RENTAL.maxDays} days. No deposit is taken. If the machine is damaged through the renter's fault, compensation is agreed; failing agreement, it is the reasonable repair cost, but not more than the market value of the machine. Normal wear is not compensated. For a private renter, the personal ID code is used for identification in case of a damage claim. The machine is handed over and returned clean at the agreed place; the renter bears the direct costs of returning it unless agreed otherwise. The full rental terms are in the rental agreement shown in the price calculator before you send your request.`],
    ["Personal data", "The controller is Squeaky Clean Teenused OÜ. We process your data to prepare the offer and perform the contract. More details, including recipients, retention periods and your rights, are in the privacy policy (/privaatsus). For quality control we may take before/after photos without capturing personal data."],
  ],
  withdrawalPerson: [
    "Right of withdrawal (private person)",
    "You have the right to withdraw from a contract concluded at a distance within 14 days without giving a reason. The period starts when the contract is concluded, i.e. on the day you confirm our offer. To withdraw, use the “Withdraw from a contract” button in the top menu of this site (the form is in the “Withdraw from a contract” section near the bottom of the page) or send us an unambiguous statement by email; you may use the standard withdrawal form. It is enough to send your notice before the period ends. If you ask us to start the service before this period ends, you pay proportionally for the service already provided if you withdraw, and the right of withdrawal is lost once the service has been fully performed.",
  ],
  withdrawalCompany: ["Right of withdrawal", "The consumer right of withdrawal does not apply to business customers."],
};

const LEGAL: Record<Lang, typeof ET> = { et: ET, en: EN };

/** Tingimused koos täidetud teenuseosutaja andmetega. Taganemispunkt on "Tühistamise" järel. */
export function legalTerms(lang: Lang, isCompany = false): [string, string][] {
  const l = LEGAL[lang];
  const items = l.items.map(([h, p]) => [h, p.replace("__PROVIDER__", provider(lang))] as [string, string]);
  const withdrawal = isCompany ? l.withdrawalCompany : l.withdrawalPerson;
  return [...items.slice(0, 6), withdrawal, ...items.slice(6)];
}
