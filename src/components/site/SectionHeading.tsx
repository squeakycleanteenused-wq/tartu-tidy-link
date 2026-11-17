import type { ReactNode } from "react";

/* Ühtne plokipealkiri kogu lehel (sama stiil mis avalehe ülaosas):
   väike kuldne silt, õhuline serif-pealkiri ja soovi korral kuldne kaldkirjas lõpp. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  subtitle,
  center = false,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  subtitle?: ReactNode;
  center?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-3xl"}>
      <p className={`text-[11px] font-medium uppercase tracking-[0.3em] ${dark ? "text-gold" : "text-accent"}`}>{eyebrow}</p>
      <h2
        className={`mt-5 text-balance font-display text-4xl font-light leading-[1.1] tracking-tight sm:text-5xl ${dark ? "text-white" : ""}`}
      >
        {title}
        {accent && <span className={`italic ${dark ? "text-gold" : "text-accent"}`}> {accent}</span>}
      </h2>
      {subtitle && (
        <p className={`mt-5 text-base font-light leading-relaxed sm:text-lg ${dark ? "text-white/75" : "text-muted-foreground"}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
