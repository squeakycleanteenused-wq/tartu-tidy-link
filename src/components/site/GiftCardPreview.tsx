import { useEffect, useRef, useState } from "react";
import { CARD_FONTS, drawBack, drawFront, type CardData } from "@/lib/giftcard-draw";
import type { Design } from "@/lib/giftcards.config";

import imgMajahaldjas from "@/assets/giftcards/majahaldjas.jpg";
import imgRoosa from "@/assets/giftcards/roosa.jpg";
import imgMustkuld from "@/assets/giftcards/mustkuld.jpg";
import imgJoulud from "@/assets/giftcards/joulud.jpg";
import imgSunnipaev from "@/assets/giftcards/sunnipaev.jpg";
import imgTartu from "@/assets/giftcards/tartu.jpg";
import imgNinja from "@/assets/giftcards/ninja.jpg";
import thMajahaldjas from "@/assets/giftcards/majahaldjas-thumb.webp";
import thRoosa from "@/assets/giftcards/roosa-thumb.webp";
import thMustkuld from "@/assets/giftcards/mustkuld-thumb.webp";
import thJoulud from "@/assets/giftcards/joulud-thumb.webp";
import thSunnipaev from "@/assets/giftcards/sunnipaev-thumb.webp";
import thTartu from "@/assets/giftcards/tartu-thumb.webp";
import thNinja from "@/assets/giftcards/ninja-thumb.webp";

/* Kinkekaardi eelvaade brauseris. Joonistab sama koodiga mis serveri PDF (giftcard-draw.ts). */

const fontUrls = import.meta.glob("../../assets/giftcards/fonts/*.ttf", { eager: true, query: "?url", import: "default" }) as Record<
  string,
  string
>;

export const CARD_IMAGES: Record<string, string> = {
  majahaldjas: imgMajahaldjas,
  roosa: imgRoosa,
  mustkuld: imgMustkuld,
  joulud: imgJoulud,
  sunnipaev: imgSunnipaev,
  tartu: imgTartu,
  ninja: imgNinja,
};
export const CARD_THUMBS: Record<string, string> = {
  majahaldjas: thMajahaldjas,
  roosa: thRoosa,
  mustkuld: thMustkuld,
  joulud: thJoulud,
  sunnipaev: thSunnipaev,
  tartu: thTartu,
  ninja: thNinja,
};

let fontsPromise: Promise<unknown> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all(
    CARD_FONTS.map(async ([family, weight, file]) => {
      const url = Object.entries(fontUrls).find(([k]) => k.endsWith(`/${file}.ttf`))?.[1];
      if (!url) return;
      const f = new FontFace(family, `url(${url})`, { weight });
      document.fonts.add(await f.load());
    }),
  ).catch(() => undefined);
  return fontsPromise;
}

const images = new Map<string, Promise<HTMLImageElement>>();
function loadImage(id: string) {
  let p = images.get(id);
  if (!p) {
    p = new Promise((ok, bad) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = bad;
      i.src = CARD_IMAGES[id]!;
    });
    images.set(id, p);
  }
  return p;
}

export function GiftCardPreview({
  design,
  data,
  side,
  label,
}: {
  design: Design;
  data: CardData;
  side: "front" | "back";
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void Promise.all([loadFonts(), loadImage(design.id)]).then(([, img]) => {
      const c = ref.current;
      if (!alive || !c) return;
      c.width = design.w;
      c.height = design.h;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      if (side === "front") drawFront(ctx, design, img, data);
      else drawBack(ctx, design, data);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [design, data, side]);

  return (
    <div className="relative">
      <canvas
        ref={ref}
        role="img"
        aria-label={label}
        width={design.w}
        height={design.h}
        className={`h-auto w-full rounded-lg shadow-[0_20px_50px_-20px_rgb(0_0_0/0.45)] transition-opacity ${ready ? "opacity-100" : "opacity-0"}`}
      />
      {!ready && <div className="absolute inset-0 animate-pulse rounded-lg bg-secondary" />}
    </div>
  );
}
