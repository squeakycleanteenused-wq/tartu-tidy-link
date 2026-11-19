import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart";
import { bundlePct } from "@/lib/shop.shared";

/* E-poe lehtedel ekraani all hõljuv ostukorvi riba (nähtav ainult siis, kui korvis on midagi). */
export function CartBar() {
  const items = useCart();
  if (items.length === 0) return null;
  const pct = bundlePct(items.length);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <Link
        to="/pood/korv"
        className="pointer-events-auto inline-flex items-center gap-3 rounded-full border border-gold/60 bg-ink px-6 py-3 text-sm text-white shadow-[0_20px_50px_-20px_rgb(0_0_0/0.7)] hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ShoppingBag className="size-4 text-gold" />
        <span>
          Ostukorvis {items.length} {items.length === 1 ? "toode" : "toodet"}
          {pct > 0 ? ` · −${pct}%` : ""}
        </span>
        <span className="font-semibold uppercase tracking-[0.15em] text-gold">Vaata korvi</span>
      </Link>
    </div>
  );
}
