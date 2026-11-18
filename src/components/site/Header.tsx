import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useLang } from "@/lib/i18n";
import { ThemeToggle } from "./ThemeToggle";

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
  const { t, lang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);

  const links = [
    { href: "/#teenused", label: lang === "et" ? "Teenused" : "Services" },
    { href: "/#hinnakalkulaator", label: lang === "et" ? "Hind" : "Price" },
    { href: "/kinkekaardid", label: lang === "et" ? "Kinkekaardid" : "Gift cards" },
    { href: "/#kkk", label: lang === "et" ? "KKK" : "FAQ" },
    { href: "/#epood", label: t.nav.shop },
    { href: "/#kontakt", label: t.nav.contact },
  ];
  /* Taganemise link peab olema kogu aeg kergesti leitav (VÕS / EL direktiiv 2023/2673),
     seepärast jääb see päisesse, kuid tagasihoidlikumana. Tingimused on jaluses. */
  const withdraw = { href: "/#taganemine", label: lang === "et" ? "Taganen lepingust" : "Withdraw from a contract" };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden="true"
            className="grid size-9 shrink-0 place-items-center rounded-md bg-ink font-display text-sm font-bold tracking-wide text-gold ring-1 ring-gold/60"
          >
            SC
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-normal leading-tight tracking-tight sm:text-lg">
              Squeaky Clean
            </span>
            <span className="block truncate text-[11px] text-muted-foreground">{t.hero.title}</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-7 lg:flex">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-[13px] uppercase tracking-[0.15em] text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <a
              href={withdraw.href}
              className="border-l border-border pl-7 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {withdraw.label}
            </a>
          </nav>
          <span className="mx-2 hidden h-6 w-px bg-border lg:block" />
          <LangSwitch />
          <ThemeToggle />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 lg:hidden" aria-label={lang === "et" ? "Menüü" : "Menu"}>
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
                    className="border-b border-border px-3 py-4 font-display text-xl font-light"
                  >
                    {l.label}
                  </a>
                ))}
                <a href={withdraw.href} onClick={() => setMenuOpen(false)} className="px-3 py-4 text-sm text-muted-foreground underline underline-offset-4">
                  {withdraw.label}
                </a>
                <a href="/tingimused" className="px-3 text-sm text-muted-foreground underline underline-offset-4">
                  {t.nav.terms}
                </a>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}