import { RENTAL_COMPANY } from "@/lib/rental-contract";

/* KINKEKAARTIDE SEADED. Muuda siin summasid, lisatasu, kehtivust ja tagakülje hinnakirja.
   Seda faili kasutavad nii leht (eelvaade) kui ka server (hinna arvutus, PDF), seega pole siin saladusi. */

/** Valitavad summad eurodes (ripp-menüü). */
export const AMOUNTS = [50, 60, 75, 100, 150, 200] as const;
export const DEFAULT_AMOUNT = 100;
/** "Muu summa" piirid (täisarv eurodes). */
export const MIN_AMOUNT = 10;
export const MAX_AMOUNT = 2000;

/** Prinditud kaart ümbrikus: lisatasu eurodes (sisaldab postikulu). */
export const PRINT_FEE = 5;
export const SHIPPING_TEXT = "Postitame 2 tööpäeva jooksul.";

/** Mitu kaarti igast kujundusest on müügil (kokku, kõigi aegade jooksul). null = piiramatu.
   Tühistatud kaarte ei arvestata. Juurde lisamiseks suurenda numbrit. */
export const STOCK: Record<string, number | null> = {
  majahaldjas: 3,
  roosa: 3,
  mustkuld: 3,
  joulud: 3,
  sunnipaev: 3,
  tartu: 3,
};
/** Kui kaua hoitakse kaarti makse ajal ostjale reserveeritud (Stripe'i makseleht aegub sama ajaga). */
export const RESERVE_MINUTES = 31;

/** Kaardi kehtivus väljastamisest (kuudes). */
export const VALIDITY_MONTHS = 12;
/** PDF-i allalaadimislingi kehtivus (päevades). */
export const DOWNLOAD_LINK_DAYS = 30;

/** Tagakülje hinnakiri. Uuenda koos kodulehe hinnakirjaga (src/lib/i18n.tsx ja hinnakalkulaator). */
export const PRICES: [string, string][] = [
  ["Hoolduskoristus (kuni 70 m²)", "60–70 €"],
  ["Suurpuhastus, kolimiskoristus", "80–100 €"],
  ["Aknapesu", "alates 3,50 €/tk"],
  ["Lisatööd", "15 €/h"],
];
export const PRICE_NOTE =
  "Hinnad km-ta, seisuga november 2026. Kehtiv hinnakiri: squeakycleanteenused.ee. Kaart ei ole rahaks vahetatav.";

/** Kaardil ja e-kirjades kasutatav ettevõtte nimi ja veebiaadress. */
export const COMPANY = RENTAL_COMPANY.name;
export const SITE = "squeakycleanteenused.ee";

/** Kaart on ühekordne: jääki ei tagastata ega kanta üle. Näidatakse enne ostu (summa juures ja makse kastis). */
export const SINGLE_USE_TEXT =
  "Kaarti saab kasutada ühe korra. Kui teenus maksab vähem kui kaardi summa, jääki ei tagastata ega kanta üle. Kui teenus maksab rohkem, tasub saaja vahe arvega.";

/** Summa all näidatav vihje. */
export function amountHint(a: number | null) {
  if (!a) return `Sisesta summa ${MIN_AMOUNT} ja ${MAX_AMOUNT} euro vahel (täisarv).`;
  if (a < 60) return "Katab osa hoolduskoristusest või aknapesu.";
  if (a < 80) return "Piisab ühest hoolduskoristusest (kuni 70 m²).";
  if (a < 120) return "Piisab suurpuhastusest või hoolduskoristusest koos lisatöödega.";
  return "Piisab mitmeks koristuseks.";
}

/** Kujundused. Pealkirjad on pildil, ülejäänu joonistab src/lib/giftcard-draw.ts. */
export const DESIGNS = [
  { id: "majahaldjas", name: "Majahaldjas", w: 1748, h: 1240, border: "#0a122c", accent: "#e2ba68", price: "#0a122c", fill: "#fcf6e8", font: "800|Playfair Display" },
  { id: "roosa", name: "Roosa siid", w: 2000, h: 1294, border: "#601c3a", accent: "#be8e4a", price: "#601c3a", fill: "#fff8f6", font: "800|Playfair Display" },
  { id: "mustkuld", name: "Must-kuld", w: 2000, h: 1294, border: "#11161e", accent: "#d6ac62", price: "#966c28", fill: "#faf4e6", font: "700|Cinzel" },
  { id: "joulud", name: "Jõulud", w: 2000, h: 1294, border: "#101a3a", accent: "#deb460", price: "#961820", fill: "#fdf5e4", font: "800|Playfair Display" },
  { id: "sunnipaev", name: "Sünnipäev", w: 2000, h: 1294, border: "#247a8c", accent: "#e86056", price: "#e86056", fill: "#ffffff", font: "700|Oswald" },
  { id: "tartu", name: "Tartu", w: 2000, h: 1294, border: "#184282", accent: "#e8b63c", price: "#184282", fill: "#ffffff", font: "800|Playfair Display" },
] as const;

export type Design = (typeof DESIGNS)[number];
export type DesignId = Design["id"];
export const DESIGN_IDS = DESIGNS.map((d) => d.id) as [DesignId, ...DesignId[]];
export const designById = (id: string) => DESIGNS.find((d) => d.id === id);

/** Trükimõõt millimeetrites (laius alati 148 mm). */
export const cardSizeMm = (d: Design) => ({ w: 148, h: Math.round((148 * d.h) / d.w * 10) / 10 });

/** Kontrollib summat: valikust või "muu summa" piirides täisarv. */
export function validAmount(a: unknown): number | null {
  const n = typeof a === "number" ? a : Number(a);
  return Number.isInteger(n) && n >= MIN_AMOUNT && n <= MAX_AMOUNT ? n : null;
}

/** Kehtivuse lõpp: väljastamise kuupäev + VALIDITY_MONTHS (Eesti aja järgi), kujul AAAA-KK-PP. */
export function validUntilFrom(issued: Date, months = VALIDITY_MONTHS) {
  const [y, m, d] = issued.toLocaleDateString("sv-SE", { timeZone: "Europe/Tallinn" }).split("-").map(Number) as [number, number, number];
  const v = new Date(Date.UTC(y, m - 1 + months, d));
  return v.toISOString().slice(0, 10);
}

/** AAAA-KK-PP -> PP.KK.AAAA */
export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};
