import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, Package } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLang } from "@/lib/i18n";
import { products, useCart, type Category } from "@/lib/shop";
import { submitOrder } from "@/lib/booking.functions";

const categories: (Category | "all")[] = ["all", "cleaning", "gifts", "partners"];

export function Shop() {
  const { t, lang } = useLang();
  const { add } = useCart();
  const [filter, setFilter] = useState<Category | "all">("all");
  const list = products.filter((p) => filter === "all" || p.category === filter);

  return (
    <section id="epood" className="scroll-mt-28 border-t border-border bg-secondary/40 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-3xl font-bold sm:text-4xl">{t.shop.title}</h2>
        <p className="mt-2 text-muted-foreground">{t.shop.subtitle}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                filter === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {c === "all" ? t.shop.all : t.shop.categories[c]}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => (
            <article key={p.id} className="surface-card flex flex-col p-5">
              <span className="grid size-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Package className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{p.name[lang]}</h3>
              <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.desc[lang]}</p>
              <p className="mt-4 text-lg font-bold">{p.price.toFixed(2)} €</p>
              <Button className="mt-3 rounded-full" onClick={() => add(p)}>
                <ShoppingBag className="size-4" />
                {t.shop.add}
              </Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CartDrawer() {
  const { t, lang } = useLang();
  const { lines, open, setOpen, setQty, remove, total, clear } = useCart();
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState(t.shop.deliveryOptions[0]!);

  const placeOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()) || phone.trim().length < 5) {
      toast.error(t.booking.required);
      return;
    }
    await submitOrder({
      data: {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        delivery,
        items: lines.map((l) => ({ id: l.product.id, qty: l.qty })),
      },
    });
    toast.success(t.shop.ordered);
    clear();
    setCheckout(false);
    setOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t.shop.cart}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto px-4">
            {lines.length === 0 && <p className="text-sm text-muted-foreground">{t.shop.empty}</p>}
            {lines.map((l) => (
              <div key={l.product.id} className="rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 text-sm font-medium">{l.product.name[lang]}</p>
                  <button
                    onClick={() => remove(l.product.id)}
                    aria-label={t.shop.remove}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => setQty(l.product.id, l.qty - 1)}>
                      <Minus className="size-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{l.qty}</span>
                    <Button size="icon" variant="outline" className="size-7 rounded-full" onClick={() => setQty(l.product.id, l.qty + 1)}>
                      <Plus className="size-3" />
                    </Button>
                  </div>
                  <span className="text-sm font-bold">{(l.qty * l.product.price).toFixed(2)} €</span>
                </div>
              </div>
            ))}
          </div>
          <SheetFooter>
            <div className="mb-3 flex items-center justify-between text-base font-bold">
              <span>{t.shop.total}</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <Button
              className="w-full rounded-full"
              disabled={lines.length === 0}
              onClick={() => setCheckout(true)}
            >
              {t.shop.checkout}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.shop.checkout}</DialogTitle>
          </DialogHeader>
          <form onSubmit={placeOrder} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="o-name">{t.shop.orderName}</Label>
              <Input id="o-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="o-email">{t.shop.orderEmail}</Label>
              <Input id="o-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={160} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="o-phone">{t.shop.orderPhone}</Label>
              <Input id="o-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} />
            </div>
            <div className="grid gap-2">
              <Label>{t.shop.delivery}</Label>
              <RadioGroup value={delivery} onValueChange={setDelivery} className="gap-2">
                {t.shop.deliveryOptions.map((d) => (
                  <div key={d} className="flex items-center gap-2 rounded-lg border border-border p-3">
                    <RadioGroupItem value={d} id={`d-${d}`} />
                    <Label htmlFor={`d-${d}`} className="font-normal">
                      {d}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div className="flex items-center justify-between text-base font-bold">
              <span>{t.shop.total}</span>
              <span>{total.toFixed(2)} €</span>
            </div>
            <Button type="submit" className="w-full rounded-full">
              {t.shop.place}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}