import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";
import heroImage from "@/assets/hero-clean-home.jpg";

export function Hero() {
  const { t } = useLang();
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
          <p className="mt-4 max-w-lg text-base text-muted-foreground">{t.hero.subtitle}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button size="lg" className="rounded-full px-6" asChild>
              <a href="#broneerimine">{t.hero.cta}</a>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-6 bg-card" asChild>
              <a href="#teenused">{t.hero.cta2}</a>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {t.hero.points.map((p) => (
              <li key={p} className="flex items-center gap-2 text-sm text-secondary-foreground">
                <CheckCircle2 className="size-4 shrink-0 text-primary" />
                {p}
              </li>
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