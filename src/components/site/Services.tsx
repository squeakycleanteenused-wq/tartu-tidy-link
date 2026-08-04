import { Check, Info, Sparkles, SprayCan, PanelsTopLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

const icons = [Sparkles, SprayCan, PanelsTopLeft, Clock];

export function Services() {
  const { t } = useLang();
  return (
    <section id="teenused" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.services.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.services.subtitle}</p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {t.services.items.map((s, i) => {
            const Icon = icons[i] ?? Sparkles;
            return (
              <article key={s.name} className="surface-card flex flex-col p-6">
                <div className="flex items-start gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">{s.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{s.meta}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-accent px-3 py-1 text-sm font-bold text-accent-foreground">
                    {s.price}
                  </span>
                </div>
                <p className="mt-4 text-sm">{s.desc}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {t.services.includes}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {s.list.map((li) => (
                    <li key={li} className="flex gap-2 text-sm text-secondary-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {li}
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" className="mt-5 self-start px-0 text-primary" asChild>
                  <a href="#broneerimine">{t.services.book} →</a>
                </Button>
              </article>
            );
          })}
        </div>

        <p className="mt-8 flex gap-3 rounded-xl border border-border bg-secondary/70 p-4 text-sm text-secondary-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {t.services.note}
        </p>
      </div>
    </section>
  );
}