import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useLang } from "@/lib/i18n";
import { SITE_URL, canonical } from "@/lib/site";
import { legalTerms } from "@/lib/legal";

const title = "Teenuseosutamise tingimused | Squeaky Clean Teenused OÜ";
const description =
  "Squeaky Clean Teenused OÜ hinnakiri, teenuseosutamise tingimused, taganemisõigus, tühistamine, arveldamine ja isikuandmete töötlemine.";

export const Route = createFileRoute("/tingimused")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:url", content: `${SITE_URL}/tingimused` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/tingimused")],
  }),
  component: TermsPage,
});

function TermsContent() {
  const { t, lang } = useLang();
  const items = legalTerms(lang);
  const companyWithdrawal = legalTerms(lang, true)[6]?.[1] ?? "";
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> {t.terms.back}
      </Link>
      <h1 className="mt-6 text-3xl font-bold sm:text-4xl">{t.terms.title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">{t.terms.intro}</p>

      <section className="mt-10">
        <h2 className="text-xl font-bold">{t.terms.prices}</h2>
        <p className="mt-2 text-sm text-secondary-foreground">{t.terms.pricesNote}</p>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {t.services.items.map((s) => (
            <div key={s.name} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-sans text-base font-semibold">{s.name}</h3>
                <span className="text-sm font-semibold">{s.price}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.meta}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-secondary-foreground">
                {s.list.map((li) => (
                  <li key={li}>{li}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-secondary-foreground">{t.services.note}</p>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">{t.terms.conditions}</h2>
        <div className="mt-6 space-y-7">
          {items.map(([h, p], i) => (
            <section key={h}>
              <h3 className="font-sans text-base font-semibold">
                {i + 1}. {h}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{p}</p>
              {i === 6 && (
                <>
                  <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{companyWithdrawal}</p>
                  <a href="/#taganemine" className="mt-2 inline-block text-sm font-medium text-primary hover:underline">
                    {t.terms.withdrawForm}
                  </a>
                </>
              )}
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function TermsPage() {
  return (
    <SiteLayout>
      <TermsContent />
    </SiteLayout>
  );
}