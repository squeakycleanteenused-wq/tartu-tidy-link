import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Building2, Phone } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { RENTAL_COMPANY } from "@/lib/rental-contract";
import { OPEN_COOKIE_SETTINGS } from "./CookieConsent";

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
            <Mail className="size-4 shrink-0" />
            <a href={`mailto:${RENTAL_COMPANY.email}`} className="hover:underline">
              {RENTAL_COMPANY.email}
            </a>
          </li>
          <li className="flex items-center gap-2">
            <Phone className="size-4 shrink-0" />
            <a href={`tel:${RENTAL_COMPANY.phone.replace(/\s/g, "")}`} className="hover:underline">
              {RENTAL_COMPANY.phone}
            </a>
          </li>
          <li className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" /> {RENTAL_COMPANY.address}
          </li>
          <li className="flex items-center gap-2">
            <Building2 className="size-4 shrink-0" /> {t.contact.reg}: {RENTAL_COMPANY.code}
          </li>
        </ul>
        <div className="space-y-2 text-sm">
          <Link to="/tingimused" className="block font-medium text-primary hover:underline">
            {t.terms.link}
          </Link>
          <Link to="/privaatsus" className="block font-medium text-primary hover:underline">
            {t.footer.privacy}
          </Link>
          <a href="/#taganemine" className="block font-medium text-primary hover:underline">
            {t.footer.withdraw}
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))}
            className="block font-medium text-primary hover:underline"
          >
            {t.footer.cookies}
          </button>
          <p className="pt-2 text-muted-foreground">
            © {new Date().getFullYear()} {t.company}. {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
