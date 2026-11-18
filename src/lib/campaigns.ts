import ruumKorda from "@/assets/kampaania-ruum-korda.webp";
import tekstiilipuhasti from "@/assets/kampaania-tekstiilipuhasti.webp";
import { RENTAL } from "@/lib/rental-contract";

/* Käimasolevad kampaaniad avalehe ülaosa slaididel (esimene slaid on alati elutoa foto).
   Kampaania kaob lehelt ise pärast kuupäeva "until". Uue lisamiseks kopeeri üks plokk. */
export type Campaign = {
  id: string;
  until?: string; // viimane kehtiv päev, AAAA-KK-PP (puudub = kehtib kuni eemaldamiseni)
  href?: string; // kuhu nupp viib (vaikimisi e-kiri kampaania nimega)
  termsHref?: string; // link tingimustele (näidatakse nupu all)
  image: string;
  imagePos: string; // millist pildi osa näidata (CSS object-position)
  aiImage?: boolean; // tehisintellektiga loodud pilt: lehel kuvatakse märge (EL tehisintellekti määrus, art 50)
  et: CampaignText;
  en: CampaignText;
};

type CampaignText = {
  label?: string; // väike silt pealkirja kohal (vaikimisi "Kampaania")
  name: string;
  price: string;
  text: string;
  details: [string, string][];
  cta: string;
  termsLabel?: string;
  alt: string;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "ruum-korda",
    until: "2026-12-31",
    image: ruumKorda,
    imagePos: "50% 45%",
    aiImage: true,
    et: {
      name: "Ruum korda",
      price: "200 €",
      text: "Korrastame ühe ruumi, näiteks garderoobi, panipaiga või lastetoa: sorteerime, voldime ja paigutame asjad läbipaistvatesse hoiukastidesse. Kastid on hinnas.",
      details: [
        ["Üks ruum", "korrastus"],
        ["Kastid hinnas", "IKEA SAMLA 5–22\u00a0l"],
        ["Kehtib", "kuni 31.12.2026"],
      ],
      cta: "Broneeri",
      alt: "Tehisintellektiga loodud illustratsioon: korrastatud garderoob läbipaistvate hoiukastidega",
    },
    en: {
      name: "Room in order",
      price: "200 €",
      text: "We organise one room, such as a walk-in closet, storage room or children's room: we sort, fold and place your things in clear storage boxes. The boxes are included.",
      details: [
        ["One room", "organised"],
        ["Boxes included", "IKEA SAMLA 5–22\u00a0l"],
        ["Valid", "until 31 Dec 2026"],
      ],
      cta: "Book",
      alt: "AI-generated illustration: organised walk-in closet with clear storage boxes",
    },
  },
  {
    id: "tekstiilipuhasti",
    image: tekstiilipuhasti,
    imagePos: "70% 50%",
    aiImage: true,
    href: "#hinnakalkulaator",
    termsHref: "/renditingimused",
    et: {
      label: "Rent",
      name: "Tekstiilipuhasti",
      price: `${RENTAL.pricePerDay} € / ööpäev`,
      text: "Bissell SpotClean Pro diivanite, tugitoolide, vaipade, madratsite ja autoistmete puhastamiseks. Kasutusjuhend ja puhastustablett on kaasas.",
      details: [
        ["Tagatisraha", "ei võeta"],
        ["Kuni", `${RENTAL.maxDays} päeva`],
        ["Tartu ja Põlva", "tagastus kokkuleppel"],
      ],
      cta: "Rendi masin",
      termsLabel: "Renditingimused",
      alt: "Tehisintellektiga loodud illustratsioon: Bissell SpotClean Pro tekstiilipuhastusmasin vaibal",
    },
    en: {
      label: "Rental",
      name: "Upholstery cleaner",
      price: `${RENTAL.pricePerDay} € / day`,
      text: "Bissell SpotClean Pro for cleaning sofas, armchairs, carpets, mattresses and car seats. User manual and a cleaning tablet included.",
      details: [
        ["No deposit", "required"],
        ["Up to", `${RENTAL.maxDays} days`],
        ["Tartu & Põlva", "return by agreement"],
      ],
      cta: "Rent the machine",
      termsLabel: "Rental terms",
      alt: "AI-generated illustration: Bissell SpotClean Pro upholstery cleaning machine on a carpet",
    },
  },
];

/* Kehtivad kampaaniad tänase kuupäeva järgi (Eesti aeg). */
export function activeCampaigns(now = new Date()): Campaign[] {
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" });
  return CAMPAIGNS.filter((c) => !c.until || c.until >= today);
}
