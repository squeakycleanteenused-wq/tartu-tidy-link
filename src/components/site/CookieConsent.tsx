import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useLang } from "@/lib/i18n";

/* Küpsiste nõusolek. Google Adsi skripti ei laadita enne, kui külastaja vajutab "Nõustun".
   Valik salvestatakse brauserisse (localStorage) ja seda saab muuta jaluse lingist "Küpsiste seaded". */

const GOOGLE_ADS_ID = "AW-18374991187";
const STORAGE_KEY = "sc-cookie-consent";
export const OPEN_COOKIE_SETTINGS = "sc-open-cookie-settings";

type Choice = "granted" | "denied";

const COPY = {
  et: {
    title: "Küpsised",
    text: "Kasutame Google Adsi küpsiseid, et mõõta, kas meie reklaamid toovad kliente. Need lisame ainult sinu nõusolekul. Lehe toimimiseks vajalikud andmed (keelevalik ja see valik) salvestatakse ainult sinu brauserisse.",
    more: "Privaatsuspoliitika",
    accept: "Nõustun",
    reject: "Keeldun",
  },
  en: {
    title: "Cookies",
    text: "We use Google Ads cookies to measure whether our ads bring us customers. We only set them with your consent. Data needed for the site to work (language choice and this choice) is stored only in your browser.",
    more: "Privacy policy",
    accept: "Accept",
    reject: "Reject",
  },
} as const;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function readChoice(): Choice | null {
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

function saveChoice(v: Choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, v);
  } catch {
    /* privaatne režiim vms: küsime järgmisel korral uuesti */
  }
}

function loadGoogleAds() {
  if (document.getElementById("google-ads-gtag")) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", {
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
    analytics_storage: "denied",
  });
  window.gtag("js", new Date());
  window.gtag("config", GOOGLE_ADS_ID);
  const s = document.createElement("script");
  s.id = "google-ads-gtag";
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`;
  document.head.appendChild(s);
}

/* Kustutab Google'i küpsised, kui nõusolek võetakse tagasi. */
function clearGoogleCookies() {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  document.cookie.split(";").forEach((c) => {
    const name = (c.split("=")[0] ?? "").trim();
    if (!/^(_gcl|_ga|_gid|_gac)/.test(name)) return;
    domains.forEach((d) => {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`;
    });
  });
}

export function CookieConsent() {
  const { lang } = useLang();
  const t = COPY[lang];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const choice = readChoice();
    if (choice === "granted") loadGoogleAds();
    if (choice === null) setOpen(true);
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_COOKIE_SETTINGS, onOpen);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, onOpen);
  }, []);

  const decide = (v: Choice) => {
    const before = readChoice();
    saveChoice(v);
    setOpen(false);
    if (v === "granted") {
      loadGoogleAds();
    } else if (before === "granted") {
      // Juba laaditud skripti ei saa peatada: kustutame küpsised ja laeme lehe uuesti.
      clearGoogleCookies();
      window.location.reload();
    }
  };

  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t.title}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background px-4 py-4 shadow-[0_-4px_16px_rgb(21_49_75/0.08)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-secondary-foreground">
          <span className="font-semibold text-foreground">{t.title}. </span>
          {t.text}{" "}
          <Link to="/privaatsus" className="font-medium text-primary underline">
            {t.more}
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" onClick={() => decide("denied")}>
            {t.reject}
          </Button>
          <Button onClick={() => decide("granted")}>{t.accept}</Button>
        </div>
      </div>
    </div>
  );
}
