import ruumKorda from "@/assets/kampaania-ruum-korda.webp";

/* Käimasolevad kampaaniad avalehe ülaosa slaididel (esimene slaid on alati elutoa foto).
   Kampaania kaob lehelt ise pärast kuupäeva "until". Uue lisamiseks kopeeri üks plokk. */
export type Campaign = {
  id: string;
  until: string; // viimane kehtiv päev, AAAA-KK-PP
  image: string;
  imagePos: string; // millist pildi osa näidata (CSS object-position)
  aiImage?: boolean; // tehisintellektiga loodud pilt: lehel kuvatakse märge (EL tehisintellekti määrus, art 50)
  et: CampaignText;
  en: CampaignText;
};

type CampaignText = {
  name: string;
  price: string;
  text: string;
  details: [string, string][];
  cta: string;
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
];

/* Kehtivad kampaaniad tänase kuupäeva järgi (Eesti aeg). */
export function activeCampaigns(now = new Date()): Campaign[] {
  const today = now.toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" });
  return CAMPAIGNS.filter((c) => c.until >= today);
}
