import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import thumb from "@/assets/giftcards/mustkuld-thumb.webp";

/* Avalehe viide kinkekaartidele. */
export function GiftCardTeaser() {
  const { lang } = useLang();
  const et = lang === "et";
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Link
          to="/kinkekaardid"
          className="group grid items-center gap-8 rounded-[28px] border border-gold/50 p-6 transition-colors hover:border-gold sm:grid-cols-[220px_1fr_auto] sm:p-8"
        >
          <img src={thumb} alt="" className="w-full rounded-lg shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)] sm:w-[220px]" loading="lazy" />
          <span>
            <span className="block text-[11px] font-medium uppercase tracking-[0.3em] text-accent">{et ? "Kinkekaardid" : "Gift cards"}</span>
            <span className="mt-3 block font-display text-3xl font-light sm:text-4xl">
              {et ? "Kingi aega," : "Give time,"} <span className="italic text-accent">{et ? "mitte asju" : "not things"}</span>
            </span>
            <span className="mt-3 block text-base font-light text-muted-foreground">
              {et
                ? "Kodukoristuse kinkekaart seitsme kujundusega. Maksad kohe ja saad kaardi PDF-ina või prinditult ümbrikus."
                : "A home cleaning gift card in seven designs. Pay online and get the card as a PDF or printed in an envelope."}
            </span>
          </span>
          <span className="grid size-12 place-items-center rounded-full border border-border transition-colors group-hover:border-gold group-hover:text-accent">
            <ArrowRight className="size-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}
