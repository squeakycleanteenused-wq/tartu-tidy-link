import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type Category = "cleaning" | "gifts" | "partners";

export type Product = {
  id: string;
  name: { et: string; en: string };
  desc: { et: string; en: string };
  price: number;
  category: Category;
};

export const products: Product[] = [
  {
    id: "univ-cleaner",
    name: { et: "Universaalpuhastusvahend 500 ml", en: "Universal cleaner 500 ml" },
    desc: { et: "Lõhnavaba, sobib kõikidele pestavatele pindadele.", en: "Fragrance-free, suitable for all washable surfaces." },
    price: 7.9,
    category: "cleaning",
  },
  {
    id: "window-spray",
    name: { et: "Aknapesuvahend 750 ml", en: "Window cleaner 750 ml" },
    desc: { et: "Triipudeta tulemus klaasil ja peeglitel.", en: "Streak-free result on glass and mirrors." },
    price: 6.5,
    category: "cleaning",
  },
  {
    id: "bath-gel",
    name: { et: "Vannitoa katlakivi eemaldaja", en: "Bathroom limescale remover" },
    desc: { et: "Tõhus geel plaatidele, vuukidele ja segistitele.", en: "Effective gel for tiles, grout and taps." },
    price: 8.9,
    category: "cleaning",
  },
  {
    id: "microfibre",
    name: { et: "Mikrokiudlappide komplekt (5 tk)", en: "Microfibre cloth set (5 pcs)" },
    desc: { et: "Värvikoodiga lapid eri pindade jaoks.", en: "Colour-coded cloths for different surfaces." },
    price: 12.0,
    category: "cleaning",
  },
  {
    id: "gift-small",
    name: { et: "Kingikomplekt „Väike sära“", en: "Gift set “Little Shine”" },
    desc: { et: "Universaalpuhasti, lapp ja käsikreem kinkekarbis.", en: "Universal cleaner, cloth and hand cream in a gift box." },
    price: 24.9,
    category: "gifts",
  },
  {
    id: "gift-home",
    name: { et: "Kinkekaart – hoolduskoristus", en: "Gift card – maintenance cleaning" },
    desc: { et: "Üks täielik hoolduskoristus kuni 70 m².", en: "One full maintenance cleaning up to 70 m²." },
    price: 65.0,
    category: "gifts",
  },
  {
    id: "partner-soap",
    name: { et: "Käsitööseep (Lõuna-Eesti talu)", en: "Handmade soap (South Estonian farm)" },
    desc: { et: "Naturaalne seep kohalikult koostööpartnerilt.", en: "Natural soap from a local partner." },
    price: 5.5,
    category: "partners",
  },
  {
    id: "partner-candle",
    name: { et: "Sojaküünal „Värske lina“", en: "Soy candle “Fresh Linen”" },
    desc: { et: "Käsitsi valatud küünal koostööpartnerilt.", en: "Hand-poured candle from a partner workshop." },
    price: 14.5,
    category: "partners",
  },
];

export type CartLine = { product: Product; qty: number };

type CartCtx = {
  lines: CartLine[];
  add: (p: Product) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  total: number;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const CartContext = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<CartCtx>(() => {
    return {
      lines,
      open,
      setOpen,
      add: (p) => {
        setLines((prev) => {
          const found = prev.find((l) => l.product.id === p.id);
          if (found) return prev.map((l) => (l.product.id === p.id ? { ...l, qty: l.qty + 1 } : l));
          return [...prev, { product: p, qty: 1 }];
        });
        setOpen(true);
      },
      remove: (id) => setLines((prev) => prev.filter((l) => l.product.id !== id)),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.product.id !== id)
            : prev.map((l) => (l.product.id === id ? { ...l, qty } : l)),
        ),
      clear: () => setLines([]),
      count: lines.reduce((s, l) => s + l.qty, 0),
      total: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
    };
  }, [lines, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}