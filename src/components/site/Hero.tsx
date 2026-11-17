import { Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import heroImage from "@/assets/hero-clean-home.jpg";

/* Avalehe ülaosa Figma malli ("Interactive Website", Planto) stiilis:
   tume roheline taust, suur hele pealkiri, kontuurnupud ja klaasjad kaardid
   (valge 5% täide, hajuv valge kontuur, hägune taust). */

const glass =
  "border-2 border-white/15 bg-white/5 shadow-[0_18px_40px_-12px_rgb(0_0_0/0.45)] backdrop-blur-lg";
const outlineBtn =
  "inline-flex h-14 items-center justify-center rounded-[12px] border-2 border-white/75 px-8 text-lg text-white/90 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold";

export function Hero() {
  const { t, lang } = useLang();
  const et = lang === "et";
  const featured = t.services.items[0]!;
  const tel = `tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`;

  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      {/* Taustapilt tumendatuna, nagu mallis */}
      <img
        src={heroImage}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-25 blur-sm"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,rgb(16_41_30/0.55),rgb(16_41_30/0.95)_70%)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.35fr_1fr] lg:py-24">
        <div className="hero-rise">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">{t.hero.eyebrow}</p>
          <h1 className="mt-4 font-sans text-5xl font-semibold leading-[1.05] tracking-tight text-white/90 sm:text-6xl lg:text-7xl">
            {t.hero.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
            {et
              ? "Puhas kodu ilma vaevata: koristame kortereid ja maju Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Arvuta hind veebis ja saada päring."
              : "A spotless home, effortlessly: we clean apartments and houses in Tartu and Põlva and, by agreement, their surroundings. Calculate the price online and send a request."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a href="#hinnakalkulaator" className={outlineBtn}>
              {et ? "Arvuta hind" : "Calculate price"}
            </a>
            <a href={tel} className="group inline-flex items-center gap-3 text-white/75 hover:text-white">
              <span className="grid size-14 place-items-center rounded-full border-2 border-white/75 transition-colors group-hover:bg-white/10">
                <Phone className="size-5" />
              </span>
              <span className="text-base">
                {et ? "Helista" : "Call"}
                <span className="block font-semibold text-white/90">{RENTAL_COMPANY.phone}</span>
              </span>
            </a>
          </div>

          <div className={`mt-12 max-w-sm rounded-[28px] p-6 ${glass}`}>
            <p className="font-semibold text-white/90">
              {et ? "Ühekordne või regulaarne" : "One-time or regular"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              {et
                ? "Iga koristus on eraldi tellimus – püsilepingut ega kuutasu pole. Hind on teada enne tööd."
                : "Each cleaning is a separate order – no ongoing contract or monthly fee. You know the price before the work."}
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/80">
              {t.hero.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`hero-rise rounded-[40px] p-5 [animation-delay:120ms] ${glass}`}>
          <img
            src={heroImage}
            alt={et ? "Puhtaks koristatud valgusküllane elutuba – kodukoristus Tartus ja Põlvas" : "A freshly cleaned bright living room – home cleaning in Tartu and Põlva"}
            width={1280}
            height={960}
            className="aspect-[4/3] w-full rounded-[28px] object-cover"
          />
          <div className="px-3 pb-3 pt-6">
            <p className="text-sm text-gold">{et ? "Populaarseim teenus" : "Most popular service"}</p>
            <p className="mt-1 text-2xl font-semibold text-white/90">{featured.name}</p>
            <p className="mt-1 text-sm text-white/70">
              {featured.price} · {featured.meta}
            </p>
            <a href="#hinnakalkulaator" className={`${outlineBtn} mt-5`}>
              {et ? "Arvuta hind" : "Calculate price"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
