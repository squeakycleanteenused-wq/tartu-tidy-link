import { Link } from "@tanstack/react-router";
import { ArrowRight, FileText } from "lucide-react";
import { euro } from "@/lib/shop.shared";
import type { PublicProduct } from "@/lib/shop.server";

/* E-poe tootekaart (tumeroheline ja kuldne, nagu avalehe klaaskastid). */
export function ProductCard({ p }: { p: PublicProduct }) {
  return (
    <Link
      to="/pood/$slug"
      params={{ slug: p.slug }}
      className="group flex flex-col overflow-hidden rounded-[28px] border border-gold/40 bg-ink text-white shadow-[0_24px_60px_-30px_rgb(0_0_0/0.6)] transition-colors hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {p.imageUrl ? (
        <img src={p.imageUrl} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-white/5 text-gold">
          <FileText className="size-12" strokeWidth={1.2} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[11px] uppercase tracking-[0.25em] text-gold">
          {p.category || "Digitoode"}
          {p.fileType ? ` · ${p.fileType}` : ""}
        </p>
        <h3 className="mt-3 font-display text-2xl font-light leading-tight">{p.title}</h3>
        {p.short && <p className="mt-2 text-sm font-light leading-relaxed text-white/70">{p.short}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <p className="font-display text-3xl font-light text-gold">{euro(p.priceCents)}</p>
          <span className="grid size-11 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-gold group-hover:text-gold">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
