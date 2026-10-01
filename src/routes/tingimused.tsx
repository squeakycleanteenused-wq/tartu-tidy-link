import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useLang } from "@/lib/i18n";
import { SITE_URL, canonical } from "@/lib/site";

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
  const { t } = useLang();
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
      <div className="mt-10 space-y-7">
        {t.terms.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-lg font-bold">{s.h}</h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary-foreground">{s.p}</p>
          </section>
        ))}
      </div>
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