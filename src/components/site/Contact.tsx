import { useLang } from "@/lib/i18n";
import { SectionHeading } from "@/components/site/SectionHeading";
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
    {
      label: "Instagram",
      value: (
        <a href={RENTAL_COMPANY.instagram} target="_blank" rel="noopener" className="hover:underline">
          @squeakycleanteenused
        </a>
      ),
    },
    { label: t.contact.reg, value: RENTAL_COMPANY.code },
    { label: t.contact.areaLabel, value: t.contact.areaValue },
  ];
  return (
    <section id="kontakt" className="scroll-mt-28 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading eyebrow={t.nav.contact} title={t.contact.title} subtitle={t.contact.subtitle} />
        <div className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i) => (
            <div key={i.label} className="border-t border-gold/60 pt-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{i.label}</p>
              <p className="mt-2 font-display text-lg font-light">{i.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
