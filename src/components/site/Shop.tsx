import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { shopConfig, subscribeShop } from "@/lib/waitlist.functions";

/* Cloudflare Turnstile laaditakse ainult siis, kui serveris on TURNSTILE_SITE_KEY ja TURNSTILE_SECRET_KEY. */
type TurnstileApi = {
  render: (el: HTMLElement, o: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};
const turnstile = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

export function Shop() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [website, setWebsite] = useState(""); // honeypot: päris kasutaja ei näe ega täida
  const loadedAt = useRef(0);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [tsToken, setTsToken] = useState("");
  const tsBox = useRef<HTMLDivElement>(null);
  const tsId = useRef<string | undefined>(undefined);

  useEffect(() => {
    loadedAt.current = Date.now();
    let alive = true;
    shopConfig()
      .then((c) => alive && setSiteKey(c.turnstileSiteKey))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!siteKey) return;
    const mount = () => {
      if (!tsBox.current || tsId.current || !turnstile()) return;
      tsId.current = turnstile()!.render(tsBox.current, {
        sitekey: siteKey,
        callback: (tok: string) => setTsToken(tok),
        "expired-callback": () => setTsToken(""),
        "error-callback": () => setTsToken(""),
      });
    };
    if (turnstile()) return mount();
    const sc = document.createElement("script");
    sc.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    sc.async = true;
    sc.onload = mount;
    document.head.appendChild(sc);
  }, [siteKey]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast.error(t.shop.invalidEmail);
      return;
    }
    if (siteKey && !tsToken) {
      toast.error(t.shop.subscribeError);
      return;
    }
    setSending(true);
    try {
      await subscribeShop({
        data: {
          email: email.trim(),
          lang,
          website,
          elapsedMs: Date.now() - loadedAt.current,
          turnstileToken: tsToken || undefined,
        },
      });
      toast.success(t.shop.subscribed);
      setEmail("");
    } catch (err) {
      toast.error(
        err instanceof Error && err.message === "Too many requests"
          ? t.shop.rateLimited
          : t.shop.subscribeError,
      );
    } finally {
      if (tsId.current) turnstile()?.reset(tsId.current);
      setTsToken("");
      setSending(false);
    }
  };

  return (
    <section id="epood" className="scroll-mt-28 border-y border-border bg-secondary py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          {t.shop.soonBadge}
        </span>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{t.shop.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.shop.soonText}</p>

        <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-lg text-left">
          <p className="text-sm font-medium">{t.shop.notifyTitle}</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.shop.orderEmail}
              maxLength={160}
              aria-label={t.shop.orderEmail}
            />
            <Button type="submit" disabled={sending}>
              {t.shop.notifyMe}
            </Button>
          </div>
          {/* Honeypot: nähtamatu, klaviatuurile ja ekraanilugejale kättesaamatu */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>
          {siteKey && <div ref={tsBox} className="mt-3" />}
          <p className="mt-3 text-xs text-muted-foreground">{t.shop.notifyNote}</p>
        </form>
      </div>
    </section>
  );
}
