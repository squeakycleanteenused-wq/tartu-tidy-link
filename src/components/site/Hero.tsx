import { ArrowRight, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import heroImage from "@/assets/hero-clean-home.jpg";

/* Avalehe ülaosa Figma malli ("Interactive Website", Planto) põhjal: tume taust, klaasjas kaart.
   Kohandatud luksuslikumaks: kerge serifpealkiri kuldse kaldkirjaga, palju õhku, peened jooned. */

export function Hero() {
  const { t, lang } = useLang();
  const et = lang === "et";
  const featured = t.services.items[0]!;
  const tel = `tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`;
  const facts = et
    ? [
        ["Ühekordne", "või regulaarne"],
        ["Kindel hind", "enne tööd"],
        ["Tartu ja Põlva", "ja lähiümbrus"],
      ]
    : [
        ["One-time", "or regular"],
        ["Fixed price", "before the work"],
        ["Tartu & Põlva", "and surroundings"],
      ];

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-20 blur-md"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_20%_10%,rgb(16_41_30/0.5),rgb(16_41_30/0.96)_65%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.25fr_1fr] lg:gap-20 lg:py-32">
        <div className="hero-rise">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {et ? "Kodukoristus" : "Home cleaning"}
            <span className="block italic text-gold">{et ? "Tartus ja Põlvas" : "in Tartu & Põlva"}</span>
          </h1>
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-white/70 sm:text-lg">
            {et
              ? "Koristame kortereid ja maju nii, et sina saad aega muuks. Arvuta hind veebis ja saada päring."
              : "We clean apartments and houses so you have time for other things. Calculate the price online and send a request."}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
            <a
              href="#hinnakalkulaator"
              className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {et ? "Arvuta hind" : "Calculate price"}
            </a>
            <a href={tel} className="group inline-flex items-center gap-4 text-white/70 transition-colors hover:text-white">
              <span className="grid size-12 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-gold group-hover:text-gold">
                <Phone className="size-4" />
              </span>
              <span className="text-sm tracking-wide">{RENTAL_COMPANY.phone}</span>
            </a>
          </div>

          <dl className="mt-16 grid max-w-lg grid-cols-3 divide-x divide-white/15 border-t border-white/15 pt-6">
            {facts.map(([a, b]) => (
              <div key={a} className="px-4 first:pl-0">
                <dt className="font-display text-base text-white/90 sm:text-lg">{a}</dt>
                <dd className="mt-1 text-xs text-white/50 sm:text-sm">{b}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="hero-rise rounded-[36px] border border-white/10 bg-white/[0.04] p-3 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.5)] backdrop-blur-xl [animation-delay:120ms]">
          <img
            src={heroImage}
            alt={et ? "Puhtaks koristatud valgusküllane elutuba – kodukoristus Tartus ja Põlvas" : "A freshly cleaned bright living room – home cleaning in Tartu and Põlva"}
            width={1280}
            height={960}
            className="aspect-[4/3] w-full rounded-[28px] object-cover"
          />
          <div className="flex items-end justify-between gap-6 px-5 pb-5 pt-7">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold">{et ? "Populaarseim" : "Most popular"}</p>
              <p className="mt-2 font-display text-2xl font-light text-white">{featured.name.replace(/\s*\(.*\)$/, "")}</p>
              <p className="mt-1 text-sm text-white/55">{featured.price}</p>
            </div>
            <a
              href="#hinnakalkulaator"
              aria-label={et ? "Arvuta hind" : "Calculate price"}
              className="grid size-12 shrink-0 place-items-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-gold hover:text-gold"
            >
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
