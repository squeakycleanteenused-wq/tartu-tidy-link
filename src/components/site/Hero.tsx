import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import heroImage from "@/assets/hero-clean-home.jpg";

export function Hero() {
  const { t, lang } = useLang();
  const et = lang === "et";
  return (
    <section className="border-b border-border bg-secondary">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div className="hero-rise">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.1] sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            {et
              ? "Puhas kodu ilma vaevata: koristame kortereid ja maju Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Iga koristus on eraldi ühekordne tellimus, püsilepingut ega kuutasu pole. Arvuta hind veebis ja saada päring."
              : "A spotless home, effortlessly: we clean apartments and houses in Tartu and Põlva and, by agreement, their surroundings. Each cleaning is a separate one-time order, with no ongoing contract or monthly fee. Calculate the price online and send a request."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="px-6" asChild>
              <a href="#hinnakalkulaator">{et ? "Arvuta hind" : "Calculate price"}</a>
            </Button>
            <Button size="lg" variant="outline" className="px-6 bg-card" asChild>
              <Link to="/tingimused">{et ? "Tingimused" : "Terms"}</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-secondary-foreground">
            {et ? "Küsimused? Helista " : "Questions? Call "}
            <a href={`tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`} className="font-semibold text-primary underline underline-offset-4">
              {RENTAL_COMPANY.phone}
            </a>
            {et ? " või kirjuta " : " or email "}
            <a href={`mailto:${RENTAL_COMPANY.email}`} className="font-semibold text-primary underline underline-offset-4">
              {RENTAL_COMPANY.email}
            </a>
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-secondary-foreground">
            {t.hero.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="hero-rise overflow-hidden rounded-md [animation-delay:120ms]">
          <img
            src={heroImage}
            alt={et ? "Puhtaks koristatud valgusküllane elutuba – kodukoristus Tartus ja Põlvas" : "A freshly cleaned bright living room – home cleaning in Tartu and Põlva"}
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}