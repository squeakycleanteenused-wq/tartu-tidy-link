import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";

export function Contact() {
  const { t } = useLang();
  const items = [
    {
      label: t.contact.email,
      value: (
        <a href={`mailto:${RENTAL_COMPANY.email}`} className="break-all hover:underline">
          {RENTAL_COMPANY.email}
        </a>
      ),
    },
    {
      label: t.contact.phone,
      value: (
        <a href={`tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`} className="hover:underline">
          {RENTAL_COMPANY.phone}
        </a>
      ),
    },
    { label: t.contact.address, value: RENTAL_COMPANY.address },
    { label: t.contact.reg, value: RENTAL_COMPANY.code },
    { label: t.contact.areaLabel, value: t.contact.areaValue },
  ];
  return (
    <section id="kontakt" className="scroll-mt-28 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.contact.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.contact.subtitle}</p>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.label} className="border-t-2 border-ink pt-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{i.label}</p>
              <p className="mt-1 text-sm font-semibold">{i.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
