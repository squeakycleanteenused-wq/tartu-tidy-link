import { Plus } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";

/* Teenused ja hinnad restoranimenüü stiilis: nimi, punktiirjoon, hind.
   Mis hinna sisse kuulub, avaneb klõpsuga. Hinnad tulevad i18n-ist (t.services). */
export function Services() {
  const { t, lang } = useLang();
  const et = lang === "et";
  return (
    <section id="teenused" className="scroll-mt-28 bg-secondary py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6">
        <SectionHeading
          center
          eyebrow={et ? "Teenused" : "Services"}
          title={et ? "Koristusteenused ja hinnad" : "Cleaning services and prices"}
          accent={et ? "Tartus ja Põlvas" : "in Tartu and Põlva"}
        />

        <ul className="mt-16 border-t border-gold/60">
          {t.services.items.map((s, i) => {
            const m = s.name.match(/^(.*?)\s*\((.*)\)$/);
            const name = m ? m[1] : s.name;
            const note = m ? m[2] : null;
            return (
              <li key={s.name} className="border-b border-gold/60">
                <details className="group py-8">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    {i === 0 && (
                      <span className="mb-2 block text-[11px] font-medium uppercase tracking-[0.25em] text-accent">
                        {et ? "Populaarseim" : "Most popular"}
                      </span>
                    )}
                    <div className="flex items-baseline gap-4">
                      <h3 className="font-display text-2xl font-light sm:text-3xl">
                        {name}
                        {note && <span className="text-base italic text-muted-foreground"> {note}</span>}
                      </h3>
                      <span aria-hidden="true" className="hidden flex-1 translate-y-[-0.3em] border-b border-dotted border-gold/70 sm:block" />
                      <p className="ml-auto shrink-0 font-display text-xl italic text-accent sm:ml-0 sm:text-2xl">{s.price}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <p className="text-sm font-light text-muted-foreground">{s.meta}</p>
                      <span className="inline-flex shrink-0 items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-foreground">
                        <span className="hidden sm:inline">{t.services.includes}</span>
                        <Plus className="size-4 transition-transform group-open:rotate-45" />
                      </span>
                    </div>
                  </summary>
                  <div className="mt-6 grid gap-6 sm:grid-cols-[2fr_3fr]">
                    <p className="text-base font-light leading-relaxed">{s.desc}</p>
                    <ul className="space-y-2 text-sm text-secondary-foreground">
                      {s.list.map((li) => (
                        <li key={li} className="flex gap-3">
                          <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-gold" />
                          {li}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex flex-col items-center gap-6 text-center">
          <a
            href="#hinnakalkulaator"
            className="inline-flex h-14 items-center justify-center rounded-full bg-gold px-9 text-sm font-semibold uppercase tracking-[0.15em] text-ink transition-colors hover:bg-[#c9a24c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {et ? "Arvuta täpne hind" : "Calculate your price"}
          </a>
          <p className="max-w-xl text-sm font-light text-muted-foreground">{t.services.note}</p>
        </div>
      </div>
    </section>
  );
}
