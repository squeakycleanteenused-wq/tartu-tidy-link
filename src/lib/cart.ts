import { useSyncExternalStore } from "react";
import { MAX_CART } from "@/lib/shop.shared";

/* E-poe ostukorv: toodete aadressid (slug) brauseri mälus. Hinnad arvutab alati server uuesti. */
const KEY = "sc-cart";
const EMPTY: string[] = [];
let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  if (cache) return cache;
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as unknown;
    cache = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_CART) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  cache = [...new Set(next)].slice(0, MAX_CART);
  try {
    window.localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* privaatne režiim: korv püsib ainult selle lehe ajal */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      l();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

export const cart = {
  add: (slug: string) => write([...read(), slug]),
  remove: (slug: string) => write(read().filter((s) => s !== slug)),
  set: (slugs: string[]) => write(slugs),
  clear: () => write([]),
};

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
