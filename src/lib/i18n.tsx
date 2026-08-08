import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "et" | "en";

export const et = {
  company: "Squeaky Clean Teenused OÜ",
  area: "Tegevuspiirkond: Tartu linn, Põlva linn ja lähiümbrus",
  nav: {
    services: "Teenused & Hinnad",
    shop: "E-pood",
    booking: "Aja broneerimine",
    terms: "Eeskirjad & Tingimused",
    contact: "Kontakt",
  },
  hero: {
    eyebrow: "Kodu- ja kontorikoristus Lõuna-Eestis",
    title: "Puhas kodu ilma vaevata",
    subtitle:
      "Hoolduskoristus, suurpuhastus ja aknapesu Tartus, Põlvas ja lähiümbruses. Läbipaistev hinnakiri, kindlustatud teenus ja mugav broneerimine.",
    cta: "Broneeri aeg",
    cta2: "Vaata hinnakirja",
    points: ["Vastutuskindlustus", "Läbipaistvad hinnad", "Paindlikud ajad"],
  },
  services: {
    title: "Teenused ja hinnakiri",
    subtitle: "Ettevõte pole KM kohustlane, KM hindadele ei lisandu.",
    includes: "Sisaldab",
    book: "Broneeri see teenus",
    note: "Ettevõte pole KM kohustlane, KM hindadele ei lisandu. Minimaalne väljakutsetasu on 30 € (2 töötundi).",
    items: [
      {
        name: "Hoolduskoristus (kerge koristus)",
        price: "60 € kuni 70 €",
        meta: "Orienteeruv ajakulu: 4 kuni 5 tundi, kuni 70 m²",
        desc: "Mõeldud regulaarselt hooldatud kodule.",
        list: [
          "Tolmu võtmine",
          "Põrandate pesu",
          "Peegelpindade puhastus",
          "Vannitoa / WC kerge puhastus",
          "Olmeprügi väljaviimine",
        ],
      },
      {
        name: "Suurpuhastus / Süvapesu",
        price: "80 € kuni 100 €",
        meta: "Lõplik hind oleneb pinna suurusest ja seisukorrast",
        desc: "Põhjalik süvapuhastus enne/pärast kolimist või pikemat pausi.",
        list: [
          "Kogu hoolduskoristuse maht",
          "Köögipindade rasva eemaldamine",
          "Katlakivi ja vuukide pesu",
          "Liistude, uste ja lülitite puhastus",
        ],
      },
      {
        name: "Aknapesu",
        price: "alates 3.50 €/tk",
        meta: "Hind sõltub akna tüübist",
        desc: "Sise- ja välispindade pesu koos raamide ja pakkudega.",
        list: [
          "Tavaline korteriaken: 3.50 kuni 4.00 € / tk",
          "Suur maast laeni aken / rõduuks: 4.00 kuni 5.50 € / tk",
          "Vanad puitaknad (topeltraamid): 5.00 kuni 8.00 € / tk",
        ],
      },
      {
        name: "Lisatööd (tunnihind)",
        price: "15 € / tund",
        meta: "Erisoovid ja lisategevused",
        desc: "Tellitav lisaks põhiteenusele.",
        list: ["Kappide sisemus", "Kodumasinate sisepesu", "Muud erisoovid"],
      },
    ],
  },
  booking: {
    title: "Broneeri / Telli",
    subtitle: "Täida vorm ühe korraga – kogume kõik vajalikud kontakt- ja arveandmed.",
    service: "Teenuse valik",
    servicePlaceholder: "Vali teenus",
    serviceOptions: ["Hoolduskoristus", "Suurpuhastus", "Aknapesu", "Lisatööd"],
    clientType: "Kliendi tüüp",
    person: "Eraisik",
    companyType: "Ettevõte",
    name: "Ees- ja perekonnanimi / Ettevõtte nimi",
    code: "Isikukood / Registrikood",
    billingAddress: "Arve aadress",
    objectAddress: "Koristusobjekti aadress",
    sameAddress: "Sama mis arve aadress",
    city: "Objekti asukoht / Linn",
    cityOptions: ["Tartu linn", "Põlva linn", "Lähiümbrus"],
    email: "E-posti aadress",
    phone: "Telefoninumber",
    date: "Soovitud kuupäev",
    pickDate: "Vali kuupäev",
    time: "Kellaaeg",
    morning: "Hommik (08:00–12:00)",
    afternoon: "Pärastlõuna (12:00–17:00)",
    extra: "Lisainfo objektist",
    extraPlaceholder: "m², ruumide arv, erisoovid, spetsiifilised pinnad…",
    consent1:
      "Kinnitan, et olen tutvunud ja nõustun Squeaky Clean Teenused OÜ teenuseosutamise tingimuste ja privaatsuspoliitikaga.",
    consent2:
      "Soovin teenuse osutamist enne 14-päevase taganemistähtaja lõppu ning olen teadlik, et teenuse täielikul osutamisel kaotan seadusjärgse taganemisõiguse (VÕS § 53 lg 4).",
    submit: "Saada broneering",
    required: "Palun täida kõik kohustuslikud väljad ja kinnita mõlemad nõusolekud.",
    success: "Aitäh! Broneering on saadetud – võtame teiega peagi ühendust.",
    error: "Broneeringu saatmine ebaõnnestus. Palun proovi uuesti või kirjuta meile.",
    confirmTitle: "Broneering saadetud!",
    confirmText:
      "Aitäh, {name}! Saatsime kinnituse aadressile {email}. Võtame teiega ühendust broneeringu kinnitamiseks.",
    confirmSummary: "Broneeringu kokkuvõte",
    close: "Sulge",
  },
  calendar: {
    title: "Aja broneerimine",
    subtitle: "Vali sobiv päev ja vaata vabu aegu Tartu ja Põlva piirkonnas.",
    free: "Vabad ajad",
    none: "Sel päeval vabu aegu ei ole. Palun vali teine päev.",
    select: "Vali päev kalendrist.",
    choose: "Vali see aeg",
    chosen: "Aeg valitud – täida broneerimisvorm.",
    region: "Piirkond",
  },
  shop: {
    title: "E-pood",
    soonBadge: "Tulekul",
    soonText:
      "Squeaky Clean E-pood avaneb peagi! Peagi leiad siit meie soovitatud puhastusvahendid ja kingikomplektid.",
    notifyTitle: "Soovid teavitust, kui e-pood avaneb?",
    notifyMe: "Teavita mind",
    notifyNote: "Kasutame sinu e-posti ainult e-poe avamise teavituseks.",
    orderEmail: "E-post",
    subscribed: "Aitäh! Anname e-poe avamisest teada.",
    subscribeError: "Liitumine ebaõnnestus. Palun proovi uuesti.",
    invalidEmail: "Palun sisesta korrektne e-posti aadress.",
  },
  contact: {
    title: "Kontakt",
    subtitle: "Küsimused ja pakkumised",
    email: "E-post",
    reg: "Registrikood",
    areaLabel: "Tegevuspiirkond",
    areaValue: "Tartu linn, Põlva linn ja lähiümbrus",
  },
  terms: {
    link: "Eeskirjad & Tingimused",
    title: "Hinnakiri ja teenuseosutamise tingimused",
    intro:
      "Kehtivad alates: mai 2026. Registrikood: 16288747, E-post: squeakycleanteenused@gmail.com, Tegevuspiirkond: Tartu linn, Põlva linn ja lähiümbrus.",
    back: "Tagasi avalehele",
    sections: [
      {
        h: "1. Teenuse osutamise alused ja maht",
        p: "Teenust osutatakse Kliendi esitatud andmete alusel. Minimaalne väljakutsetasu on 30 € (2 töötundi). Detaile või mustuseastet korrigeeritakse enne töö algust kohapeal.",
      },
      {
        h: "2. Kliendi kohustused ja ettevalmistus",
        p: "Klient tagab ligipääsu, vee ja elektri. Väärisasjad, sularaha ja konfidentsiaalsed dokumendid tuleb lukustada. Teenuseosutaja isiklikke asju ei tõsta ega sorteeri. Spetsiifilistest pindadest tuleb eelnevalt teavitada.",
      },
      {
        h: "3. Tarbija taganemisõigus (VÕS § 56)",
        p: "Eraisikust Kliendil on sidevahendi teel sõlmitud lepingust 14 päeva jooksul õigus taganeda. Teenuse osutamisel enne 14 päeva möödumist nõustub Klient ooteaja lühendamisega ning teenuse täielikul osutamisel taganemisõigus kaob.",
      },
      {
        h: "4. Tühistamine ja ooteaeg",
        p: "Tasuta tühistamine kuni 24h enne töö algust. Hilisema tühistamise või sissepääsu mittetagamise korral (ooteaeg uksel max 30 min) on tühistamistasu 30 € (minimaalne väljakutsetasu).",
      },
      {
        h: "5. Arveldamine",
        p: "Tasumine toimub arve alusel pangaülekandega (maksetähtaeg 7 päeva). Sularahamakseid ei aktsepteerita.",
      },
      {
        h: "6. Vastutus ja kindlustus",
        p: "Teenuseosutajal on tegevuse vastutuskindlustus. Vastutus ei laiene pindade eelnevale kulumisele, varjatud puudustele ega teavitamata erimaterjalide kahjustustele.",
      },
      {
        h: "7. Tööde vastuvõtmine ja pretensioonid",
        p: "Tööd vaadatakse üle koheselt kohapeal või esitatakse teade fotodega mõistliku aja jooksul (äriklientidel 24h jooksul). Puuduste ilmnemisel teostab Teenuseosutaja tasuta paranduse (VÕS § 646). Tarbijal on õigus pöörduda Tarbijavaidluste komisjoni poole (TTJA).",
      },
      {
        h: "8. Isikuandmed (GDPR)",
        p: "Andmeid töödeldakse lepingu täitmiseks. Teenuseosutajal on õigus teha kvaliteedikontrolliks 'enne ja pärast' fotosid ilma isikuandmeid või privaatseid detaile jäädvustamata.",
      },
    ],
  },
  footer: {
    rights: "Kõik õigused kaitstud.",
  },
};

export type Dict = typeof et;

export const en: Dict = {
  company: "Squeaky Clean Teenused OÜ",
  area: "Service area: city of Tartu, city of Põlva and nearby areas",
  nav: {
    services: "Services & Prices",
    shop: "Shop",
    booking: "Book a time",
    terms: "Terms & Conditions",
    contact: "Contact",
  },
  hero: {
    eyebrow: "Home and office cleaning in South Estonia",
    title: "A spotless home, effortlessly",
    subtitle:
      "Maintenance cleaning, deep cleaning and window washing in Tartu, Põlva and nearby areas. Transparent pricing, insured service and easy booking.",
    cta: "Book a time",
    cta2: "See pricing",
    points: ["Liability insurance", "Transparent pricing", "Flexible times"],
  },
  services: {
    title: "Services and pricing",
    subtitle: "The company is not VAT registered; VAT is not added to prices.",
    includes: "Includes",
    book: "Book this service",
    note: "The company is not VAT registered; VAT is not added to prices. The minimum call-out fee is 30 € (2 working hours).",
    items: [
      {
        name: "Maintenance cleaning (light cleaning)",
        price: "60 € to 70 €",
        meta: "Estimated time: 4 to 5 hours, up to 70 m²",
        desc: "Designed for regularly maintained homes.",
        list: [
          "Dusting",
          "Floor washing",
          "Cleaning of mirrored surfaces",
          "Light bathroom / WC cleaning",
          "Taking out household waste",
        ],
      },
      {
        name: "Deep cleaning",
        price: "80 € to 100 €",
        meta: "Final price depends on the size and condition of the space",
        desc: "Thorough deep cleaning before/after moving or a longer break.",
        list: [
          "Everything in maintenance cleaning",
          "Degreasing of kitchen surfaces",
          "Limescale and grout cleaning",
          "Cleaning of skirtings, doors and switches",
        ],
      },
      {
        name: "Window washing",
        price: "from 3.50 €/pc",
        meta: "Price depends on the window type",
        desc: "Washing of inner and outer surfaces including frames and sills.",
        list: [
          "Standard apartment window: 3.50 to 4.00 € / pc",
          "Large floor-to-ceiling window / balcony door: 4.00 to 5.50 € / pc",
          "Old wooden windows (double frames): 5.00 to 8.00 € / pc",
        ],
      },
      {
        name: "Extra work (hourly rate)",
        price: "15 € / hour",
        meta: "Special requests and additional tasks",
        desc: "Ordered in addition to the main service.",
        list: ["Inside of cabinets", "Interior cleaning of appliances", "Other special requests"],
      },
    ],
  },
  booking: {
    title: "Book / Order",
    subtitle: "Fill the form once – we collect all required contact and invoicing details.",
    service: "Service",
    servicePlaceholder: "Choose a service",
    serviceOptions: ["Maintenance cleaning", "Deep cleaning", "Window washing", "Extra work"],
    clientType: "Client type",
    person: "Private person",
    companyType: "Company",
    name: "First and last name / Company name",
    code: "Personal ID / Registry code",
    billingAddress: "Billing address",
    objectAddress: "Cleaning site address",
    sameAddress: "Same as billing address",
    city: "Site location / City",
    cityOptions: ["City of Tartu", "City of Põlva", "Nearby area"],
    email: "Email address",
    phone: "Phone number",
    date: "Preferred date",
    pickDate: "Pick a date",
    time: "Time of day",
    morning: "Morning (08:00–12:00)",
    afternoon: "Afternoon (12:00–17:00)",
    extra: "Additional information",
    extraPlaceholder: "m², number of rooms, special requests, specific surfaces…",
    consent1:
      "I confirm that I have read and agree with the service terms and privacy policy of Squeaky Clean Teenused OÜ.",
    consent2:
      "I request the service to be performed before the end of the 14-day withdrawal period and I am aware that once the service is fully performed I lose the statutory right of withdrawal (LOA § 53 (4)).",
    submit: "Send booking",
    required: "Please fill all required fields and confirm both consents.",
    success: "Thank you! Your booking has been sent – we will contact you shortly.",
    error: "Sending the booking failed. Please try again or email us.",
    confirmTitle: "Booking sent!",
    confirmText:
      "Thank you, {name}! We sent a confirmation to {email}. We will contact you to confirm the booking.",
    confirmSummary: "Booking summary",
    close: "Close",
  },
  calendar: {
    title: "Book a time",
    subtitle: "Pick a day and see available slots in the Tartu and Põlva regions.",
    free: "Available slots",
    none: "No free slots on this day. Please choose another day.",
    select: "Select a day from the calendar.",
    choose: "Choose this slot",
    chosen: "Slot selected – please fill the booking form.",
    region: "Region",
  },
  shop: {
    title: "Shop",
    soonBadge: "Coming soon",
    soonText:
      "The Squeaky Clean shop is opening soon! You'll soon find our recommended cleaning products and gift sets here.",
    notifyTitle: "Want to know when the shop opens?",
    notifyMe: "Notify me",
    notifyNote: "We use your email only to notify you about the shop opening.",
    orderEmail: "Email",
    subscribed: "Thank you! We'll let you know when the shop opens.",
    subscribeError: "Subscription failed. Please try again.",
    invalidEmail: "Please enter a valid email address.",
  },
  contact: {
    title: "Contact",
    subtitle: "Questions and quotes",
    email: "Email",
    reg: "Registry code",
    areaLabel: "Service area",
    areaValue: "City of Tartu, city of Põlva and nearby areas",
  },
  terms: {
    link: "Terms & Conditions",
    title: "Pricing and terms of service",
    intro:
      "Valid from: May 2026. Registry code: 16288747, Email: squeakycleanteenused@gmail.com, Service area: city of Tartu, city of Põlva and nearby areas.",
    back: "Back to home",
    sections: [
      {
        h: "1. Basis and scope of the service",
        p: "The service is provided based on the information submitted by the Client. The minimum call-out fee is 30 € (2 working hours). Details or the level of soiling are adjusted on site before work begins.",
      },
      {
        h: "2. Client obligations and preparation",
        p: "The Client ensures access, water and electricity. Valuables, cash and confidential documents must be locked away. The service provider does not move or sort personal belongings. Specific surfaces must be notified in advance.",
      },
      {
        h: "3. Consumer right of withdrawal (LOA § 56)",
        p: "A Client who is a private person has the right to withdraw from a distance contract within 14 days. By requesting the service before the 14 days have passed, the Client agrees to shorten the waiting period, and once the service is fully performed the right of withdrawal is lost.",
      },
      {
        h: "4. Cancellation and waiting time",
        p: "Free cancellation up to 24h before the start of work. In case of later cancellation or failure to provide access (waiting time at the door max 30 min), the cancellation fee is 30 € (the minimum call-out fee).",
      },
      {
        h: "5. Invoicing",
        p: "Payment is made by bank transfer against an invoice (payment term 7 days). Cash payments are not accepted.",
      },
      {
        h: "6. Liability and insurance",
        p: "The service provider holds operational liability insurance. Liability does not extend to pre-existing wear of surfaces, hidden defects or damage to special materials that were not notified.",
      },
      {
        h: "7. Acceptance of work and complaints",
        p: "Work is reviewed immediately on site or a notice with photos is submitted within a reasonable time (within 24h for business clients). If defects appear, the service provider carries out a free correction (LOA § 646). Consumers have the right to turn to the Consumer Disputes Committee (TTJA).",
      },
      {
        h: "8. Personal data (GDPR)",
        p: "Data is processed for performance of the contract. For quality control the service provider may take 'before and after' photos without capturing personal data or private details.",
      },
    ],
  },
  footer: {
    rights: "All rights reserved.",
  },
};

const dicts: Record<Lang, Dict> = { et, en };

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };
const LanguageContext = createContext<Ctx>({ lang: "et", setLang: () => {}, t: et });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("et");

  useEffect(() => {
    const stored = window.localStorage.getItem("sc-lang");
    if (stored === "en" || stored === "et") setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("sc-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: dicts[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);