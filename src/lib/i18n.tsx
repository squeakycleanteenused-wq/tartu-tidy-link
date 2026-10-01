import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "et" | "en";

export const et = {
  company: "Squeaky Clean Teenused OÜ",
  area: "Teenust osutatakse Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses.",
  nav: {
    services: "Teenused ja hinnad",
    shop: "E-pood",
    booking: "Aja broneerimine",
    terms: "Eeskirjad ja tingimused",
    contact: "Kontakt",
  },
  hero: {
    eyebrow: "Kodu- ja kontorikoristus Lõuna-Eestis",
    title: "Puhas kodu ilma vaevata",
    subtitle:
      "Hoolduskoristus, suurpuhastus ja aknapesu Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Läbipaistev hinnakiri ja selged tingimused.",
    cta: "Broneeri aeg",
    cta2: "Vaata hinnakirja",
    points: ["Läbipaistvad hinnad", "Selged tingimused", "Paindlikud ajad"],
  },
  services: {
    title: "Teenused ja hinnakiri",
    subtitle: "Ettevõte ei ole käibemaksukohustuslane, hindadele käibemaksu ei lisandu.",
    includes: "Sisaldab",
    book: "Broneeri see teenus",
    note: "Ettevõte ei ole käibemaksukohustuslane, hindadele käibemaksu ei lisandu. Minimaalne väljakutsetasu on 30 € (2 töötundi).",
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
        name: "Suurpuhastus / süvapesu",
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
        price: "alates 3,50 €/tk",
        meta: "Hind sõltub akna tüübist",
        desc: "Sise- ja välispindade pesu koos raamide ja pakkudega.",
        list: [
          "Tavaline korteriaken: 3,50 kuni 4,00 €/tk",
          "Suur maast laeni aken / rõduuks: 4,00 kuni 5,50 €/tk",
          "Vanad puitaknad (topeltraamid): 5,00 kuni 8,00 €/tk",
        ],
      },
      {
        name: "Lisatööd (tunnihind)",
        price: "15 €/tund",
        meta: "Erisoovid ja lisategevused",
        desc: "Tellitav lisaks põhiteenusele.",
        list: ["Kappide sisemus", "Kodumasinate sisepesu", "Muud erisoovid"],
      },
    ],
  },
  booking: {
    title: "Broneeri / telli",
    subtitle: "Täida vorm ühe korraga – kogume kõik vajalikud kontakt- ja arveandmed.",
    service: "Teenuse valik",
    servicePlaceholder: "Vali teenus",
    serviceOptions: ["Hoolduskoristus", "Suurpuhastus", "Aknapesu", "Lisatööd"],
    clientType: "Kliendi tüüp",
    person: "Eraisik",
    companyType: "Ettevõte",
    name: "Ees- ja perekonnanimi / ettevõtte nimi",
    code: "Isikukood / registrikood",
    billingAddress: "Arveaadress",
    objectAddress: "Koristusobjekti aadress",
    sameAddress: "Sama mis arveaadress",
    city: "Objekti asukoht / linn",
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
    success: "Aitäh! Broneering on saadetud – võtame sinuga peagi ühendust.",
    error: "Broneeringu saatmine ebaõnnestus. Palun proovi uuesti või kirjuta meile.",
    confirmTitle: "Broneering saadetud!",
    confirmText:
      "Aitäh, {name}! Saatsime kinnituse aadressile {email}. Võtame sinuga broneeringu kinnitamiseks ühendust.",
    confirmSummary: "Broneeringu kokkuvõte",
    close: "Sulge",
  },
  calendar: {
    title: "Aja broneerimine",
    subtitle: "Vali sobiv päev ja vaata vabu aegu Tartu ja Põlva linnas ning kokkuleppel ka lähiümbruses.",
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
      "Squeaky Cleani e-pood avaneb peagi! Varsti leiad siit meie soovitatud puhastusvahendid ja kingikomplektid.",
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
    phone: "Telefon",
    address: "Asukoha aadress",
    areaLabel: "Tegevuspiirkond",
    areaValue: "Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses",
  },
  terms: {
    link: "Eeskirjad ja tingimused",
    title: "Hinnakiri ja teenuseosutamise tingimused",
    intro: "Kehtivad alates 01.10.2026. Tingimused kehtivad hinnakalkulaatori kaudu tellitud teenustele ja tekstiilipuhastaja üürile.",
    back: "Tagasi avalehele",
    prices: "Hinnakiri",
    pricesNote: "Hinnad on käibemaksuta (ettevõte ei ole käibemaksukohustuslane). Hinnakalkulaator annab orienteeruva hinna; siduv kindel hind on kirjas pakkumises, mille saadame enne lepingu sõlmimist.",
    conditions: "Tingimused",
    withdrawForm: "Taganemisavalduse vorm ja tüüpvorm",
  },
  footer: {
    rights: "Kõik õigused kaitstud.",
    privacy: "Privaatsuspoliitika",
    withdraw: "Taganen lepingust",
  },
};

export type Dict = typeof et;

export const en: Dict = {
  company: "Squeaky Clean Teenused OÜ",
  area: "Services are provided in the cities of Tartu and Põlva and, by agreement, in their surrounding areas.",
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
      "Maintenance cleaning, deep cleaning and window washing in the cities of Tartu and Põlva and, by agreement, in their surrounding areas. Transparent pricing and clear terms.",
    cta: "Book a time",
    cta2: "See pricing",
    points: ["Transparent pricing", "Clear terms", "Flexible times"],
  },
  services: {
    title: "Services and pricing",
    subtitle: "The company is not VAT-registered; VAT is not added to prices.",
    includes: "Includes",
    book: "Book this service",
    note: "The company is not VAT-registered; VAT is not added to prices. The minimum call-out fee is 30 € (2 working hours).",
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
          "Cleaning of skirting boards, doors and switches",
        ],
      },
      {
        name: "Window washing",
        price: "from 3.50 €/pc",
        meta: "Price depends on the window type",
        desc: "Washing of inner and outer surfaces including frames and sills.",
        list: [
          "Standard apartment window: 3.50 to 4.00 €/pc",
          "Large floor-to-ceiling window / balcony door: 4.00 to 5.50 €/pc",
          "Old wooden windows (double frames): 5.00 to 8.00 €/pc",
        ],
      },
      {
        name: "Extra work (hourly rate)",
        price: "15 €/hour",
        meta: "Special requests and additional tasks",
        desc: "Ordered in addition to the main service.",
        list: ["Inside of cabinets", "Interior cleaning of appliances", "Other special requests"],
      },
    ],
  },
  booking: {
    title: "Book / Order",
    subtitle: "Fill in the form once – we collect all required contact and invoicing details.",
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
      "I confirm that I have read and agree to the service terms and privacy policy of Squeaky Clean Teenused OÜ.",
    consent2:
      "I request the service to be performed before the end of the 14-day withdrawal period and I am aware that once the service is fully performed I lose the statutory right of withdrawal (LOA § 53 (4)).",
    submit: "Send booking",
    required: "Please fill in all required fields and confirm both consents.",
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
    subtitle: "Pick a day and see available slots in the cities of Tartu and Põlva and, by agreement, in nearby areas.",
    free: "Available slots",
    none: "No free slots on this day. Please choose another day.",
    select: "Select a day from the calendar.",
    choose: "Choose this slot",
    chosen: "Slot selected – please fill in the booking form.",
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
    phone: "Phone",
    address: "Registered address",
    areaLabel: "Service area",
    areaValue: "Cities of Tartu and Põlva and, by agreement, their surrounding areas",
  },
  terms: {
    link: "Terms & Conditions",
    title: "Pricing and terms of service",
    intro: "Valid from 1 October 2026. These terms apply to services ordered via the price calculator and to the upholstery cleaner rental.",
    back: "Back to home",
    prices: "Price list",
    pricesNote: "Prices exclude VAT (the company is not VAT-registered). The price calculator gives an estimate; the binding fixed price is stated in the offer we send before the contract is concluded.",
    conditions: "Terms",
    withdrawForm: "Withdrawal form and standard form",
  },
  footer: {
    rights: "All rights reserved.",
    privacy: "Privacy policy",
    withdraw: "Withdraw from a contract",
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