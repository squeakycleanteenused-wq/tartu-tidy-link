import { useState } from "react";
import { Sparkles, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLang } from "@/lib/i18n";
import { subscribeNewsletter } from "@/lib/booking.functions";

export function Shop() {
  const { t } = useLang();
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
      await subscribeNewsletter({ data: { email: email.trim() } });
      toast.success(t.shop.subscribed);
      setEmail("");
    } catch {
      toast.error(t.shop.subscribeError);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="epood" className="scroll-mt-28 border-t border-border bg-secondary/40 py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-medium text-primary">
          <Sparkles className="size-4" />
          {t.shop.soonBadge}
        </span>
        <h2 className="mt-5 text-3xl font-bold sm:text-4xl">{t.shop.title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{t.shop.soonText}</p>

        <form onSubmit={onSubmit} className="surface-card mx-auto mt-8 max-w-lg p-6 text-left sm:p-8">
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
            <Button type="submit" className="rounded-full" disabled={sending}>
              <Mail className="size-4" />
              {t.shop.notifyMe}
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t.shop.notifyNote}</p>
        </form>
      </div>
    </section>
  );
}
