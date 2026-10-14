import { useLang } from "@/lib/i18n";
import { FAQ } from "@/lib/faq";

export function Faq() {
  const { lang } = useLang();
  const items = FAQ[lang];
  return (
    <section id="kkk" className="scroll-mt-28 border-t border-border py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{lang === "et" ? "Korduma kippuvad küsimused" : "Frequently asked questions"}</h2>
        <div className="mt-8 divide-y divide-border border-y border-border">
          {items.map(([q, a]) => (
            <details key={q} className="group py-4">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                <span>{q}</span>
                <span aria-hidden="true" className="mt-0.5 shrink-0 font-display text-lg leading-none text-accent transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-secondary-foreground">{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
