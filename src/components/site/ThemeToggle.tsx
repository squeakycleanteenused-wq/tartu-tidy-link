import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

/* Hele/tume režiim. Vaikimisi järgib leht seadme seadistust; nupuga valitud režiim
   salvestatakse brauserisse (localStorage "sc-theme") ja seatakse <html data-theme="…">. */

export const THEME_KEY = "sc-theme";

/* Käivitatakse <head>-is enne lehe joonistamist, et ei tekiks valget vilksatust. */
export const themeInitScript = `try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

function isDark() {
  const set = document.documentElement.dataset["theme"];
  if (set === "dark") return true;
  if (set === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function ThemeToggle() {
  const { lang } = useLang();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(isDark());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setDark(isDark());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const toggle = () => {
    const next = dark ? "light" : "dark";
    document.documentElement.dataset["theme"] = next;
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      /* privaatne režiim: valik kehtib ainult selle lehe avamise ajal */
    }
    setDark(!dark);
  };

  const label =
    lang === "et" ? (dark ? "Lülita hele režiim" : "Lülita tume režiim") : dark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button variant="outline" size="icon" className="shrink-0" onClick={toggle} aria-label={label} title={label}>
      {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
