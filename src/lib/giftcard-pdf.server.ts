/* Kinkekaardi PDF serveris. Joonistab sama koodiga mis eelvaade (giftcard-draw.ts) ja paneb tulemuse PDF-i.
   Pildid ja fondid on serveri paketi sees (?inline), seega ei sõltu PDF võrgust ega lehe aadressist. */
import { createCanvas, GlobalFonts, loadImage, type Canvas, type Image } from "@napi-rs/canvas";
import { jsPDF } from "jspdf";
import { CARD_FONTS, drawBack, drawFront } from "@/lib/giftcard-draw";
import { cardSizeMm, designById, fmtDate } from "@/lib/giftcards.config";
import type { Card } from "@/lib/giftcards.server";

import imgMajahaldjas from "@/assets/giftcards/majahaldjas.jpg?inline";
import imgRoosa from "@/assets/giftcards/roosa.jpg?inline";
import imgMustkuld from "@/assets/giftcards/mustkuld.jpg?inline";
import imgJoulud from "@/assets/giftcards/joulud.jpg?inline";
import imgSunnipaev from "@/assets/giftcards/sunnipaev.jpg?inline";
import imgTartu from "@/assets/giftcards/tartu.jpg?inline";
import fPlayfair700 from "@/assets/giftcards/fonts/playfair-display-700.ttf?inline";
import fPlayfair800 from "@/assets/giftcards/fonts/playfair-display-800.ttf?inline";
import fCinzel700 from "@/assets/giftcards/fonts/cinzel-700.ttf?inline";
import fOswald400 from "@/assets/giftcards/fonts/oswald-400.ttf?inline";
import fOswald500 from "@/assets/giftcards/fonts/oswald-500.ttf?inline";
import fOswald600 from "@/assets/giftcards/fonts/oswald-600.ttf?inline";
import fOswald700 from "@/assets/giftcards/fonts/oswald-700.ttf?inline";
import fInter400 from "@/assets/giftcards/fonts/inter-400.ttf?inline";
import fInter600 from "@/assets/giftcards/fonts/inter-600.ttf?inline";

const IMAGES: Record<string, string> = {
  majahaldjas: imgMajahaldjas,
  roosa: imgRoosa,
  mustkuld: imgMustkuld,
  joulud: imgJoulud,
  sunnipaev: imgSunnipaev,
  tartu: imgTartu,
};
const FONT_DATA: Record<string, string> = {
  "playfair-display-700": fPlayfair700,
  "playfair-display-800": fPlayfair800,
  "cinzel-700": fCinzel700,
  "oswald-400": fOswald400,
  "oswald-500": fOswald500,
  "oswald-600": fOswald600,
  "oswald-700": fOswald700,
  "inter-400": fInter400,
  "inter-600": fInter600,
};

const fromDataUrl = (u: string) => Buffer.from(u.slice(u.indexOf(",") + 1), "base64");

let fontsReady = false;
function ensureFonts() {
  if (fontsReady) return;
  for (const [family, , file] of CARD_FONTS) GlobalFonts.register(fromDataUrl(FONT_DATA[file]!), family);
  fontsReady = true;
}

const imageCache = new Map<string, Promise<Image>>();
function image(id: string) {
  let p = imageCache.get(id);
  if (!p) {
    p = loadImage(fromDataUrl(IMAGES[id]!));
    imageCache.set(id, p);
  }
  return p;
}

/** Lõikevaru: peegeldatud servad (nagu omaniku generaatori bleedCanvas). */
function bleedCanvas(src: Canvas, mm: number) {
  const b = Math.round(mm * (src.width / 148));
  const W = src.width, H = src.height;
  const c = createCanvas(W + 2 * b, H + 2 * b);
  const x = c.getContext("2d");
  x.drawImage(src, b, b);
  const strip = (sx: number, sy: number, sw: number, sh: number, dx: number, dy: number, fx: boolean, fy: boolean) => {
    x.save();
    x.translate(dx + (fx ? sw : 0), dy + (fy ? sh : 0));
    x.scale(fx ? -1 : 1, fy ? -1 : 1);
    x.drawImage(src, sx, sy, sw, sh, 0, 0, sw, sh);
    x.restore();
  };
  strip(0, 0, b, H, 0, b, true, false);
  strip(W - b, 0, b, H, W + b, b, true, false);
  const full = createCanvas(c.width, c.height);
  full.getContext("2d").drawImage(c, 0, 0);
  x.save();
  x.translate(0, b);
  x.scale(1, -1);
  x.drawImage(full, 0, b, c.width, b, 0, 0, c.width, b);
  x.restore();
  x.save();
  x.translate(0, H + 2 * b);
  x.scale(1, -1);
  x.drawImage(full, 0, H, c.width, b, 0, 0, c.width, b);
  x.restore();
  return c;
}

/** Esi- ja tagakülg PDF-ina. bleed: true = trükikoja fail 3 mm lõikevaruga igast servast. */
export async function renderCardPdf(card: Card, opts: { bleed: boolean }): Promise<Uint8Array<ArrayBuffer>> {
  ensureFonts();
  const d = designById(card.design);
  if (!d) throw new Error(`Tundmatu kujundus: ${card.design}`);
  const img = await image(d.id);
  const data = { amount: card.amount, recipient: card.recipient, validUntil: fmtDate(card.validUntil), nr: card.nr };
  const bleed = opts.bleed ? 3 : 0;
  const size = cardSizeMm(d);
  const wmm = size.w + 2 * bleed, hmm = (148 * d.h) / d.w + 2 * bleed;
  const doc = new jsPDF({ unit: "mm", format: [wmm, hmm], orientation: "landscape", compress: true });
  doc.setProperties({ title: `Kinkekaart ${card.nr}`, author: "Squeaky Clean Teenused OÜ" });
  for (const [i, side] of (["front", "back"] as const).entries()) {
    const c = createCanvas(d.w, d.h);
    const ctx = c.getContext("2d") as unknown as CanvasRenderingContext2D;
    if (side === "front") drawFront(ctx, d, img as unknown as CanvasImageSource, data);
    else drawBack(ctx, d, data);
    const out = bleed ? bleedCanvas(c, bleed) : c;
    const jpg = await out.encode("jpeg", 92);
    if (i) doc.addPage([wmm, hmm], "landscape");
    doc.addImage(new Uint8Array(jpg), "JPEG", 0, 0, wmm, hmm);
  }
  return new Uint8Array(doc.output("arraybuffer"));
}
