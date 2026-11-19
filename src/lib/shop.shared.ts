/* E-poe abifunktsioonid, mida kasutavad nii leht kui ka server. */
export const euro = (cents: number) =>
  `${(cents / 100).toLocaleString("et-EE", { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })} €`;

export const DIGITAL_CONSENT_TEXT =
  "Nõustun, et digitaalne sisu tehakse mulle kättesaadavaks kohe pärast makset, ja olen teadlik, et sellega kaotan 14-päevase taganemisõiguse.";

/** Komplektisoodustus: mida rohkem erinevaid tooteid korraga, seda suurem allahindlus. */
export const BUNDLE_TIERS = [
  { min: 2, pct: 10 },
  { min: 3, pct: 15 },
  { min: 4, pct: 20 },
] as const;
export const MAX_CART = 20;

export const bundlePct = (count: number) => BUNDLE_TIERS.reduce((pct, t) => (count >= t.min ? t.pct : pct), 0 as number);

/** Ostukorvi hind. Allahindlus jagatakse iga toote hinnale (Stripe'i makseridadel sama summa). */
export function priceCart(prices: number[]) {
  const pct = bundlePct(prices.length);
  const lines = prices.map((c) => Math.round((c * (100 - pct)) / 100));
  const subtotal = prices.reduce((a, b) => a + b, 0);
  const total = lines.reduce((a, b) => a + b, 0);
  const next = BUNDLE_TIERS.find((t) => t.min > prices.length);
  return { pct, lines, subtotal, total, discount: subtotal - total, next: next ? { add: next.min - prices.length, pct: next.pct } : null };
}

export const BUNDLE_TEXT = "Komplekt: 2 toodet −10%, 3 toodet −15%, 4 või rohkem −20%.";
export const AI_PRODUCT_NOTE = "Kujundus on loodud tehisintellekti abil.";
