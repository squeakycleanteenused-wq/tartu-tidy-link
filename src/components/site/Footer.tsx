import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Building2 } from "lucide-react";
import { useLang } from "@/lib/i18n";

export function Footer() {
  const { t } = useLang();
  return (
    <footer className="border-t border-border bg-secondary/50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
        <div>
          <h3 className="text-base font-bold">{t.company}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{t.hero.eyebrow}</p>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <Mail className="size-4 shrink-0" /> squeakycleanteenused@gmail.com
          </li>
          <li className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0" /> {t.contact.reg}: 16288747
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" /> {t.contact.areaValue}
          </li>
        </ul>
        <div className="text-sm">
          <Link to="/tingimused" className="font-medium text-primary hover:underline">
            {t.terms.link}
          </Link>
          <p className="mt-4 text-muted-foreground">
            © {new Date().getFullYear()} {t.company}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}