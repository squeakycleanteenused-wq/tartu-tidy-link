import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { activeCampaigns, type Campaign } from "@/lib/campaigns";
// Taustafoto: ettevõtte omaniku antud pilt (luksuslik elutuba tumerohelise diivaniga).
import heroBg from "@/assets/hero-living-room.webp";

/* Avalehe ülaosa Figma malli ("Interactive Website", Planto) põhjal:
   arvutis täislaiuses foto taustaks ja selle peal hõljuvad klaasjad kastid;
   mobiilis/tahvlis on foto ülal tervikuna näha (välja suumitud) ja sisu tuleb selle alla.
   Esimene slaid on alati elutuba, järgmised on kampaaniad (src/lib/campaigns.ts). */

const glass =
  "border border-white/20 bg-white/10 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] backdrop-blur-xl";
const goldBtn =
  "inline-flex h-14 items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white";
const SLIDE_MS = 7000;

function Slide({
  image,
  imagePos,
  alt,
  top,
  bottom,
  aiNote,
}: {
  image: string;
  imagePos: string;
  alt: string;
  aiNote?: string | undefined;
  top: ReactNode;
  bottom: ReactNode;
}) {
  return (
    <>
      {/* Mobiil ja tahvel: kogu foto nähtaval, alumine serv sulandub tumedasse taustasse */}
      <div className="relative lg:hidden">
        <img src={image} alt={alt} className="aspect-[16/9] w-full object-cover" style={{ objectPosition: imagePos }} />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent" />
        {aiNote && (
          <span className="absolute right-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] text-white/85 backdrop-blur-sm">
            {aiNote}
          </span>
        )}
      </div>
      {aiNote && (
        <span className="absolute right-6 top-6 z-10 hidden rounded-full bg-black/50 px-3 py-1 text-[11px] text-white/85 backdrop-blur-sm lg:block">
          {aiNote}
        </span>
      )}

      {/* Arvuti: foto taustaks kogu ploki ulatuses */}
      <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 hidden h-full w-full object-cover lg:block"
        style={{ objectPosition: imagePos }}
      />
      {/* Vasakult tumendus teksti loetavuseks, all üleminek järgmisesse plokki */}
      <div className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-ink/90 via-ink/55 to-ink/5 lg:block" />
      <div className="absolute inset-x-0 bottom-0 -z-10 hidden h-40 bg-gradient-to-t from-ink/70 to-transparent lg:block" />

      <div className="relative mx-auto -mt-10 flex max-w-6xl flex-col justify-between gap-12 px-6 pb-16 sm:-mt-16 lg:mt-0 lg:min-h-[calc(100svh-6rem)] lg:py-24">
        <div className="hero-rise max-w-2xl">{top}</div>
        <div className="hero-rise flex flex-col gap-5 [animation-delay:150ms] sm:flex-row sm:items-end sm:justify-between">
          {bottom}
        </div>
      </div>
    </>
  );
}

function Facts({ items }: { items: [string, string][] }) {
  return (
    <dl className={`grid grid-cols-3 divide-x divide-white/15 rounded-[28px] px-2 py-5 sm:max-w-lg ${glass}`}>
      {items.map(([a, b]) => (
        <div key={a} className="px-4">
          <dt className="font-display text-base text-white sm:text-lg">{a}</dt>
          <dd className="mt-1 text-xs text-white/60 sm:text-sm">{b}</dd>
        </div>
      ))}
    </dl>
  );
}

function PhoneLink() {
  const tel = `tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`;
  return (
    <a href={tel} className="group inline-flex items-center gap-4 text-white/80 transition-colors hover:text-white">
      <span className="grid size-12 place-items-center rounded-full border border-white/40 backdrop-blur-sm transition-colors group-hover:border-gold group-hover:text-gold">
        <Phone className="size-4" />
      </span>
      <span className="text-sm tracking-wide">{RENTAL_COMPANY.phone}</span>
    </a>
  );
}

function HomeSlide() {
  const { t, lang } = useLang();
  const et = lang === "et";
  const featured = t.services.items[0]!;
  const facts: [string, string][] = et
    ? [
        ["Ühekordne", "või regulaarne"],
        ["Kindel hind", "enne tööd"],
        ["Tartu ja Põlva", "ning lähiümbrus"],
      ]
    : [
        ["One-time", "or regular"],
        ["Fixed price", "before the work"],
        ["Tartu & Põlva", "and surroundings"],
      ];
  return (
    <Slide
      image={heroBg}
      imagePos="30% 55%"
      aiNote={et ? "Illustratsioon, loodud tehisintellektiga" : "Illustration, AI-generated"}
      alt={et ? "Luksuslik elutuba tumerohelise diivaniga" : "Luxurious living room with a dark green sofa"}
      top={
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {et ? "Kodukoristus" : "Home cleaning"}
            <span className="block italic text-gold">{et ? "Tartus ja Põlvas" : "in Tartu & Põlva"}</span>
          </h1>
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-white/80 sm:text-lg">
            {et
              ? "Meie teeme kodu puhtaks, sinule jääb aeg muuks. Hinna näed kohe veebis."
              : "We clean apartments and houses so you have time for other things. Calculate the price online and send a request."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
            <a href="#hinnakalkulaator" className={goldBtn}>
              {et ? "Arvuta hind" : "Calculate price"}
            </a>
            <PhoneLink />
          </div>
        </>
      }
      bottom={
        <>
          <Facts items={facts} />
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
        </>
      }
    />
  );
}

function CampaignSlide({ campaign }: { campaign: Campaign }) {
  const { lang } = useLang();
  const c = campaign[lang];
  const mail = campaign.href ?? `mailto:${RENTAL_COMPANY.email}?subject=${encodeURIComponent(`${c.name} ${c.price}`)}`;
  return (
    <Slide
      image={campaign.image}
      imagePos={campaign.imagePos}
      alt={c.alt}
      aiNote={campaign.aiImage ? (lang === "et" ? "Illustratsioon, loodud tehisintellektiga" : "Illustration, AI-generated") : undefined}
      top={
        <>
          <p className="text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{c.label ?? (lang === "et" ? "Kampaania" : "Offer")}</p>
          <p className="mt-6 font-display text-5xl font-light leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
            {c.name}
            <span className="block italic text-gold">{c.price}</span>
          </p>
          <p className="mt-8 max-w-md text-base font-light leading-relaxed text-white/80 sm:text-lg">{c.text}</p>
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-5">
            <a href={mail} className={goldBtn}>
              {c.cta}
            </a>
            <PhoneLink />
          </div>
          {campaign.termsHref && (
            <a href={campaign.termsHref} className="mt-5 inline-block text-xs text-white/70 underline underline-offset-4 hover:text-white">
              {c.termsLabel ?? (lang === "et" ? "Tingimused" : "Terms")}
            </a>
          )}
        </>
      }
      bottom={<Facts items={c.details} />}
    />
  );
}

export function Hero() {
  const { lang } = useLang();
  const et = lang === "et";
  const campaigns = activeCampaigns();
  const count = 1 + campaigns.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Vahetab slaidi iseenesest, v.a kui külastaja hoiab hiirt peal või on liikumise välja lülitanud.
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, count]);

  const go = (i: number) => setIndex((i + count) % count);
  const current = index === 0 ? null : campaigns[index - 1];

  return (
    <section
      aria-roledescription={count > 1 ? "carousel" : undefined}
      aria-label={et ? "Avaleht ja kampaaniad" : "Home and offers"}
      className="relative isolate overflow-hidden bg-ink text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div key={index} className="hero-fade">
        {current ? <CampaignSlide campaign={current} /> : <HomeSlide />}
      </div>

      {count > 1 && (
        <div className="relative mx-auto flex max-w-6xl items-center gap-4 px-6 pb-10 lg:absolute lg:inset-x-0 lg:bottom-8 lg:justify-center lg:pb-0">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label={et ? "Eelmine" : "Previous"}
            className="grid size-9 place-items-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${et ? "Slaid" : "Slide"} ${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-8 bg-gold" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label={et ? "Järgmine" : "Next"}
            className="grid size-9 place-items-center rounded-full border border-white/30 text-white/80 transition-colors hover:border-gold hover:text-gold"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </section>
  );
}
