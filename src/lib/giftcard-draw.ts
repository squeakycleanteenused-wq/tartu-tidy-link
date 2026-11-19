import qrcode from "qrcode-generator";
import { COMPANY, PRICE_NOTE, PRICES, SITE, type Design } from "@/lib/giftcards.config";

/* Kinkekaardi joonistamine canvas'ele. Sama kood töötab brauseris (eelvaade) ja serveris (PDF, @napi-rs/canvas),
   seega näeb PDF välja täpselt nagu eelvaade. Aluseks on omaniku kaardigeneraator (kinkekaart-generaator.html):
   mõõdud, värvid ja paigutus on sealt üle võetud, ära neid muuda ilma kujundust üle vaatamata. */

// Brauseri ja @napi-rs/canvas'e kontekstid on ühilduvad; tüübiks kasutame brauseri oma.
type Ctx = CanvasRenderingContext2D;

export type CardData = {
  amount: number | null;
  recipient: string;
  validUntil: string; // PP.KK.AAAA
  nr: string;
};

const INK = "#141f38";
const PANEL_MARGIN = 92; // kaugus paremast ja alumisest servast 2000-ühikulisel võrgustikul (umbes 7 mm)
const euro = (n: number) => `${n} €`;
const priceFont = (d: Design, size: number) => {
  const [w, fam] = d.font.split("|");
  return `${w} ${size}px "${fam}"`;
};

function tracked(ctx: Ctx, text: string, x: number, y: number, track: number, align: "left" | "right" | "center" = "left") {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + track * (text.length - 1);
  let cx = align === "right" ? x - total : align === "center" ? x - total / 2 : x;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i]! + track;
  });
  return total;
}

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawBrand(ctx: Ctx, d: Design, x: number, baseY: number, p: (v: number) => number) {
  const t1 = "SQUEAKYCLEAN TEENUSED OÜ", t2 = "KINKEKAART", tr = p(5), gap = p(40), size = p(28);
  ctx.fillStyle = d.fill;
  ctx.font = `600 ${size}px "Oswald"`;
  const w1 = tracked(ctx, t1, x, baseY, tr);
  ctx.fillStyle = d.accent;
  ctx.beginPath();
  ctx.arc(x + w1 + gap / 2, baseY - size * 0.36, p(5), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = d.fill;
  ctx.font = `400 ${size}px "Oswald"`;
  tracked(ctx, t2, x + w1 + gap, baseY, tr);
}

export function drawFront(ctx: Ctx, d: Design, image: CanvasImageSource, data: CardData) {
  const W = d.w, H = d.h, s = W / 2000, p = (v: number) => v * s;
  ctx.drawImage(image, 0, 0, W, H);
  const w = 960, h = 300, gridH = (2000 * H) / W;
  const px = 2000 - PANEL_MARGIN - w, py = gridH - PANEL_MARGIN - h;
  const X0 = p(px), Y0 = p(py), X1 = p(px + w), Y1 = p(py + h), HEAD = p(46);

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,.35)";
  ctx.shadowBlur = p(28);
  ctx.shadowOffsetX = p(6);
  ctx.shadowOffsetY = p(12);
  ctx.fillStyle = d.border;
  rr(ctx, X0, Y0 - HEAD, X1 - X0, Y1 - Y0 + HEAD, p(24));
  ctx.fill();
  ctx.restore();
  drawBrand(ctx, d, X0 + p(36), Y0 - p(2), p);
  const b = p(12);
  ctx.fillStyle = d.fill;
  rr(ctx, X0 + b, Y0 + b, X1 - X0 - 2 * b, Y1 - Y0 - 2 * b, p(16));
  ctx.fill();
  ctx.strokeStyle = d.accent;
  ctx.lineWidth = Math.max(2, p(3));
  ctx.stroke();

  const div = w * 0.37;
  const priceTxt = data.amount ? euro(data.amount) : "— €";
  let size = 108;
  ctx.font = priceFont(d, p(size));
  while (size > 50 && ctx.measureText(priceTxt).width > p(div - 70)) {
    size -= 2;
    ctx.font = priceFont(d, p(size));
  }
  ctx.fillStyle = d.price;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillText(priceTxt, X0 + p(40), Y0 + p(162));
  ctx.font = `600 ${p(28)}px "Oswald"`;
  ctx.fillStyle = INK;
  tracked(ctx, "KINKEKAART", X0 + p(42), Y0 + p(212), p(5));
  ctx.font = `500 ${p(24)}px "Oswald"`;
  ctx.fillStyle = INK;
  tracked(ctx, "KÕIGILE TEENUSTELE", X0 + p(42), Y0 + p(248), p(2));

  const dx = X0 + p(div);
  ctx.strokeStyle = d.accent;
  ctx.lineWidth = Math.max(2, p(3));
  for (let y = Y0 + p(40); y < Y1 - p(40); y += p(20)) {
    ctx.beginPath();
    ctx.moveTo(dx, y);
    ctx.lineTo(dx, y + p(10));
    ctx.stroke();
  }

  const fx0 = dx + p(30), fx1 = X1 - p(38);
  ctx.font = `400 ${p(34)}px "Inter"`;
  const labels = ["Kellele", "Kehtib kuni", "Kaardi nr"];
  const lx = fx0 + Math.max(...labels.map((l) => ctx.measureText(l).width)) + p(16);
  const values = [data.recipient.trim(), data.validUntil, data.nr];
  labels.forEach((label, i) => {
    const y = Y0 + p(76 + i * 60);
    ctx.font = `400 ${p(34)}px "Inter"`;
    ctx.fillStyle = INK;
    ctx.textAlign = "left";
    ctx.fillText(label, fx0, y);
    ctx.strokeStyle = "rgba(20,31,56,.55)";
    ctx.lineWidth = Math.max(2, p(3));
    ctx.beginPath();
    ctx.moveTo(lx, y + p(5));
    ctx.lineTo(fx1, y + p(5));
    ctx.stroke();
    const v = values[i];
    if (v) {
      let vs = 36;
      ctx.font = `600 ${p(vs)}px "Inter"`;
      while (vs > 22 && ctx.measureText(v).width > fx1 - lx - p(10)) {
        vs -= 1;
        ctx.font = `600 ${p(vs)}px "Inter"`;
      }
      ctx.fillStyle = d.price;
      ctx.fillText(v, lx + p(8), y - p(2));
    }
  });
  let ws = 34;
  ctx.font = `600 ${p(ws)}px "Inter"`;
  while (ws > 24 && ctx.measureText(SITE).width > fx1 - fx0) {
    ws -= 1;
    ctx.font = `600 ${p(ws)}px "Inter"`;
  }
  ctx.fillStyle = d.price;
  ctx.fillText(SITE, fx0, Y1 - p(34));
}

export function drawBack(ctx: Ctx, d: Design, data: CardData) {
  const W = d.w, H = d.h, s = W / 2000, p = (v: number) => v * s, oy = (H - p(1294)) / 2, Y = (v: number) => p(v) + oy;
  const GOLD = "#deb468", CREAM = "#f6ecd6";
  ctx.fillStyle = "#101a32";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(2, p(4));
  rr(ctx, p(70), p(70), W - p(140), H - p(140), p(26));
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.45;
  rr(ctx, p(84), p(84), W - p(168), H - p(168), p(18));
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";

  ctx.fillStyle = CREAM;
  ctx.font = `700 ${p(50)}px "Cinzel"`;
  tracked(ctx, "KODUNINJA", p(140), Y(185), p(8));
  ctx.fillStyle = GOLD;
  ctx.font = `400 ${p(28)}px "Oswald"`;
  tracked(ctx, "KODUKORISTUSE KINKEKAART", p(142), Y(232), p(6));

  ctx.fillStyle = GOLD;
  ctx.font = `700 ${p(54)}px "Playfair Display"`;
  ctx.fillText("Kuidas kasutada?", p(140), Y(330));
  const steps = [
    ["Skanni QR-kood", "või ava " + SITE],
    ["Vali sobiv aeg", "ja sisesta broneerimisel kaardi number"],
    ["Naudi puhast kodu", "kinkesumma arvestatakse arvelt maha"],
  ];
  steps.forEach(([a, b], i) => {
    const y = Y(400 + i * 104);
    ctx.fillStyle = GOLD;
    ctx.beginPath();
    ctx.arc(p(168), y + p(22), p(26), 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#101a32";
    ctx.font = `700 ${p(32)}px "Oswald"`;
    ctx.textAlign = "center";
    ctx.fillText(String(i + 1), p(168), y + p(34));
    ctx.textAlign = "left";
    ctx.fillStyle = CREAM;
    ctx.font = `600 ${p(36)}px "Inter"`;
    ctx.fillText(a!, p(220), y + p(20));
    ctx.font = `400 ${p(28)}px "Inter"`;
    ctx.globalAlpha = 0.85;
    ctx.fillText(b!, p(220), y + p(60));
    ctx.globalAlpha = 1;
  });

  ctx.fillStyle = GOLD;
  ctx.font = `700 ${p(44)}px "Playfair Display"`;
  ctx.fillText("Hinnakiri", p(140), Y(770));
  const cx1 = p(1180);
  PRICES.forEach(([name, val], i) => {
    const y = Y(830 + i * 54);
    ctx.font = `400 ${p(31)}px "Inter"`;
    ctx.fillStyle = CREAM;
    ctx.textAlign = "left";
    ctx.fillText(name, p(140), y);
    const nw = ctx.measureText(name).width;
    ctx.font = `600 ${p(31)}px "Inter"`;
    const vw = ctx.measureText(val).width;
    ctx.textAlign = "right";
    ctx.fillStyle = GOLD;
    ctx.fillText(val, cx1, y);
    ctx.strokeStyle = "rgba(222,180,104,.45)";
    ctx.lineWidth = Math.max(1, p(2));
    ctx.setLineDash([p(3), p(9)]);
    ctx.beginPath();
    ctx.moveTo(p(140) + nw + p(14), y - p(8));
    ctx.lineTo(cx1 - vw - p(14), y - p(8));
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.textAlign = "left";
  });

  // Broneerimise QR-kood
  const qr = qrcode(0, "M");
  qr.addData("https://" + SITE);
  qr.make();
  const n = qr.getModuleCount(), qs = p(470), qx = W - p(140) - qs, qy = Y(260), cell = qs / (n + 4);
  ctx.fillStyle = "#ffffff";
  rr(ctx, qx - p(14), qy - p(14), qs + p(28), qs + p(28), p(20));
  ctx.fill();
  ctx.fillStyle = "#101a32";
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      if (qr.isDark(r, c)) ctx.fillRect(Math.floor(qx + (c + 2) * cell), Math.floor(qy + (r + 2) * cell), Math.ceil(cell), Math.ceil(cell));
  ctx.textAlign = "center";
  ctx.fillStyle = GOLD;
  ctx.font = `600 ${p(44)}px "Oswald"`;
  ctx.fillText("Broneeri aeg", qx + qs / 2, qy + qs + p(84));
  ctx.fillStyle = CREAM;
  ctx.font = `600 ${p(30)}px "Inter"`;
  ctx.fillText(SITE, qx + qs / 2, qy + qs + p(130));

  ctx.textAlign = "left";
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = Math.max(1, p(2));
  ctx.beginPath();
  ctx.moveTo(p(140), Y(1060));
  ctx.lineTo(W - p(140), Y(1060));
  ctx.stroke();
  ctx.fillStyle = CREAM;
  ctx.font = `400 ${p(29)}px "Inter"`;
  ctx.globalAlpha = 0.9;
  ctx.fillText(PRICE_NOTE, p(140), Y(1110));
  ctx.globalAlpha = 1;
  ctx.fillStyle = GOLD;
  ctx.font = `600 ${p(29)}px "Inter"`;
  ctx.fillText(`${COMPANY}  ·  kaardi nr ${data.nr}`, p(140), Y(1158));
}

/** Fondid, mida kaart kasutab (perekond, jämedus, failinimi src/assets/giftcards/fonts kaustas). */
export const CARD_FONTS = [
  ["Playfair Display", "700", "playfair-display-700"],
  ["Playfair Display", "800", "playfair-display-800"],
  ["Cinzel", "700", "cinzel-700"],
  ["Oswald", "400", "oswald-400"],
  ["Oswald", "500", "oswald-500"],
  ["Oswald", "600", "oswald-600"],
  ["Oswald", "700", "oswald-700"],
  ["Inter", "400", "inter-400"],
  ["Inter", "600", "inter-600"],
] as const;
