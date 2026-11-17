import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";
import { FAQ } from "@/lib/faq";

export function Faq() {
  const { lang } = useLang();
  const items = FAQ[lang];
  return (
    <section id="kkk" className="scroll-mt-28 bg-secondary py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-6">
        <SectionHeading
          center
          eyebrow="KKK"
          title={lang === "et" ? "Korduma kippuvad" : "Frequently asked"}
          accent={lang === "et" ? "küsimused" : "questions"}
        />
        <div className="mt-14 divide-y divide-gold/40 border-y border-gold/40">
          {items.map(([q, a]) => (
            <details key={q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-lg font-light sm:text-xl [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span aria-hidden="true" className="mt-0.5 shrink-0 font-display text-lg leading-none text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-base font-light leading-relaxed text-secondary-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
