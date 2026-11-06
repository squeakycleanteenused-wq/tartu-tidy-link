import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteLayout } from "@/components/site/Layout";
import { useLang } from "@/lib/i18n";
import { confirmShop, unsubscribeShop } from "@/lib/waitlist.functions";

/* Kinnituse / loobumise leht. Toiming tehakse alles brauseris (POST), mitte lingi avamisel serveris,
   et e-posti turvaskannerid, mis linke ette laevad, ei kinnitaks ega kustutaks kellegi eest. */

type State = "working" | "ok" | "already" | "expired" | "invalid" | "error";

export function WaitlistResult({
  action,
  token,
}: {
  action: "confirm" | "unsubscribe";
  token?: string | undefined;
}) {
  const { t } = useLang();
  const c = t.shop.confirm;
  const [state, setState] = useState<State>("working");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    let alive = true;
    const run = action === "confirm" ? confirmShop : unsubscribeShop;
    run({ data: { token } })
      .then(({ result }) => {
        if (!alive) return;
        setState(result === "confirmed" || result === "removed" ? "ok" : result);
      })
      .catch(() => alive && setState("error"));
    return () => {
      alive = false;
    };
  }, [action, token]);

  const unsub = action === "unsubscribe";
  const copy: Record<Exclude<State, "working">, [string, string]> = {
    ok: unsub ? [c.unsubOkTitle, c.unsubOkText] : [c.okTitle, c.okText],
    already: [c.okTitle, c.alreadyText],
    expired: [c.expiredTitle, c.expiredText],
    invalid: unsub ? [c.unsubInvalidTitle, c.unsubInvalidText] : [c.invalidTitle, c.invalidText],
    error: [c.errorTitle, c.errorText],
  };
  const [title, text] = state === "working" ? [c.working, ""] : copy[state];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-xl px-4 py-20 text-center" role="status" aria-live="polite">
        <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
        {text && <p className="mt-4 text-secondary-foreground">{text}</p>}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {c.back}
        </Link>
      </div>
    </SiteLayout>
  );
}
