import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { notifyShopSignup } from "@/lib/mail.functions";

export function Shop() {
  const { t, lang } = useLang();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      toast.error(t.shop.invalidEmail);
      return;
    }
    setSending(true);
    try {
      await notifyShopSignup({ data: { email: email.trim(), lang } });
      toast.success(t.shop.subscribed);
      setEmail("");
    } catch {
      toast.error(t.shop.subscribeError);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="epood" className="scroll-mt-28 bg-secondary py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="text-[11px] font-medium uppercase tracking-[0.3em] text-accent">
          {t.shop.soonBadge}
        </span>
        <h2 className="mt-5 font-display text-4xl font-light tracking-tight sm:text-5xl">{t.shop.title}</h2>
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
          <p className="mt-3 text-xs text-muted-foreground">{t.shop.notifyNote}</p>
        </form>
      </div>
    </section>
  );
}
