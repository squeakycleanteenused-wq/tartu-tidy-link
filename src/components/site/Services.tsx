import { useLang } from "@/lib/i18n";

/* Teenused ja hinnad: iga teenuse hind, kirjeldus ja mis sisaldub. Hinnad tulevad i18n-ist (t.services). */
export function Services() {
  const { t } = useLang();
  return (
    <section id="teenused" className="scroll-mt-28 bg-secondary py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.services.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.services.subtitle}</p>

        <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {t.services.items.map((s) => (
            <article key={s.name} className="flex flex-col border-t-2 border-gold pt-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-xl font-bold">{s.name}</h3>
                <p className="font-display text-lg font-bold text-accent">{s.price}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{s.meta}</p>
              <p className="mt-3 text-sm">{s.desc}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t.services.includes}
              </p>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-secondary-foreground">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
              <a href="#hinnakalkulaator" className="mt-4 self-start text-sm font-medium text-primary underline underline-offset-4">
                {t.services.book}
              </a>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm text-secondary-foreground">{t.services.note}</p>
      </div>
    </section>
  );
}
