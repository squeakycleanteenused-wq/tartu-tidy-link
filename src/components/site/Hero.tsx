import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import heroImage from "@/assets/hero-clean-home.jpg";

export function Hero() {
  const { t, lang } = useLang();
  const et = lang === "et";
  return (
    <section className="hero-surface border-b border-border">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:py-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            {t.hero.eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl">
            {t.hero.title}
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            {et
              ? "Hoolduskoristus, suurpuhastus ja aknapesu Tartu ja Põlva linnas ning kokkuleppel nende lähiümbruses. Küsi hinda veebis. Hinnad ja tingimused on selged."
              : "Maintenance cleaning, deep cleaning and window washing in Tartu and Põlva and, by agreement, their surroundings. Request a price online. Prices and terms are clear."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6" asChild>
              <a href="#hinnakalkulaator">{et ? "Arvuta hind" : "Calculate price"}</a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 bg-card" asChild>
              <Link to="/tingimused">{et ? "Tingimused" : "Terms"}</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-secondary-foreground">
            {t.hero.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-3xl border border-border shadow-[var(--shadow-lift)]">
          <img
            src={heroImage}
            alt={t.hero.title}
            width={1280}
            height={960}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}