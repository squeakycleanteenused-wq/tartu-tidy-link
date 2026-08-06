import { Link } from "@tanstack/react-router";
import { Menu, MapPin, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-full border border-border bg-background p-0.5">
      {(["et", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
            lang === l
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l === "et" ? "EE" : "EN"}
        </button>
      ))}
    </div>
  );
}

export function Header() {
  const { t } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/#teenused", label: t.nav.services },
    { href: "/#epood", label: t.nav.shop },
    { href: "/#broneerimine", label: t.nav.booking },
    { href: "/tingimused", label: t.nav.terms },
    { href: "/#kontakt", label: t.nav.contact },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-bold leading-tight">
              Squeaky Clean
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">Teenused OÜ</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <LangSwitch />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 rounded-full lg:hidden">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-10 flex flex-col gap-1 px-4">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-secondary"
                  >
                    {l.label}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="border-t border-border/60 bg-primary-soft/60">
        <p className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-1.5 text-[12px] text-secondary-foreground">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{t.area}</span>
        </p>
      </div>
    </header>
  );
}