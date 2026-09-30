import { useLang } from "@/lib/i18n";

export function Contact() {
  const { t } = useLang();
  return (
    <section id="kontakt" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.contact.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.contact.subtitle}</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-3">
          <div className="border-t-2 border-ink pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t.contact.email}
            </p>
            <a
              href="mailto:squeakycleanteenused@gmail.com"
              className="mt-1 block break-all text-sm font-semibold hover:underline"
            >
              squeakycleanteenused@gmail.com
            </a>
          </div>
          <div className="border-t-2 border-ink pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t.contact.reg}
            </p>
            <p className="mt-1 text-sm font-semibold">16288747</p>
          </div>
          <div className="border-t-2 border-ink pt-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              {t.contact.areaLabel}
            </p>
            <p className="mt-1 text-sm font-semibold">{t.contact.areaValue}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
