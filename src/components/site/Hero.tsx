import { ArrowRight, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
// Taustafoto: ettevõtte omaniku antud pilt (luksuslik elutuba tumerohelise diivaniga).
import heroBg from "@/assets/hero-living-room.webp";

/* Avalehe ülaosa Figma malli ("Interactive Website", Planto) põhjal:
   arvutis täislaiuses foto taustaks ja selle peal hõljuvad klaasjad kastid;
   mobiilis/tahvlis on foto ülal tervikuna näha (välja suumitud) ja sisu tuleb selle alla. */

const glass =
  "border border-white/20 bg-white/10 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl";

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
      {/* Mobiil ja tahvel: kogu foto nähtaval, alumine serv sulandub tumedasse taustasse */}
      <div className="relative lg:hidden">
        <img
          src={heroBg}
          alt={et ? "Luksuslik elutuba tumerohelise diivaniga" : "Luxurious living room with a dark green sofa"}
          width={1680}
          height={944}
          className="aspect-[16/9] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
      </div>

      {/* Arvuti: foto taustaks kogu ploki ulatuses */}
      <img
        src={heroBg}
        alt=""
        aria-hidden="true"
        width={1680}
        height={944}
        className="absolute inset-0 -z-20 hidden h-full w-full object-cover object-[30%_55%] lg:block"
      />
      {/* Vasakult tumendus teksti loetavuseks, all üleminek järgmisesse plokki */}
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-ink/90 via-ink/55 to-ink/5 lg:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-gradient-to-t from-ink/70 to-transparent lg:block" />

      <div className="relative mx-auto -mt-10 flex max-w-6xl flex-col justify-between gap-12 px-6 pb-16 sm:-mt-16 lg:mt-0 lg:min-h-[calc(100svh-6rem)] lg:py-24">
        <div className="hero-rise max-w-2xl">
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {et ? "Kodukoristus" : "Home cleaning"}
            <span className="block italic text-gold">{et ? "Tartus ja Põlvas" : "in Tartu & Põlva"}</span>
          </h1>
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-white/80 sm:text-lg">
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
            <a href={tel} className="group inline-flex items-center gap-4 text-white/80 transition-colors hover:text-white">
              <span className="grid size-12 place-items-center rounded-full border border-white/40 backdrop-blur-sm transition-colors group-hover:border-gold group-hover:text-gold">
                <Phone className="size-4" />
              </span>
              <span className="text-sm tracking-wide">{RENTAL_COMPANY.phone}</span>
            </a>
          </div>
        </div>

        {/* Hõljuvad klaaskastid foto peal */}
        <div className="hero-rise flex flex-col gap-5 [animation-delay:150ms] sm:flex-row sm:items-end sm:justify-between">
          <dl className={`grid grid-cols-3 divide-x divide-white/15 rounded-[28px] px-2 py-5 sm:max-w-lg ${glass}`}>
            {facts.map(([a, b]) => (
              <div key={a} className="px-4">
                <dt className="font-display text-base text-white sm:text-lg">{a}</dt>
                <dd className="mt-1 text-xs text-white/60 sm:text-sm">{b}</dd>
              </div>
            ))}
          </dl>

          <a
            href="#hinnakalkulaator"
            className={`group flex items-center justify-between gap-8 rounded-[28px] px-7 py-6 transition-colors hover:bg-white/15 sm:min-w-80 ${glass}`}
          >
            <span>
              <span className="block text-[11px] uppercase tracking-[0.25em] text-gold">{et ? "Populaarseim" : "Most popular"}</span>
              <span className="mt-2 block font-display text-2xl font-light text-white">
                {featured.name.replace(/\s*\(.*\)$/, "")}
              </span>
              <span className="mt-1 block text-sm text-white/65">{featured.price}</span>
            </span>
            <span className="grid size-12 shrink-0 place-items-center rounded-full border border-white/40 text-white/85 transition-colors group-hover:border-gold group-hover:text-gold">
              <ArrowRight className="size-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
