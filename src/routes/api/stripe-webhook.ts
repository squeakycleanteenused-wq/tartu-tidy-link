import { createFileRoute } from "@tanstack/react-router";
import type { StripeEvent } from "@/lib/giftcards.server";

/* Stripe'i webhook: kinnitab makse ja väljastab kinkekaardi.
   Ehtsuse kontroll: kui STRIPE_WEBHOOK_SECRET on seatud, kontrollitakse allkirja. Kui pole, küsitakse sündmus
   ID järgi otse Stripe'ist meie salajase võtmega ja kasutatakse ainult Stripe'i vastust (võltsitud sisu ei loeta).
   Stripe'i Dashboardis: Workbench → Webhooks → endpoint https://<leht>/api/stripe-webhook,
   sündmused checkout.session.completed ja checkout.session.async_payment_succeeded. */
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const g = await import("@/lib/giftcards.server");
        const payload = await request.text();
        const whsec = (process.env["STRIPE_WEBHOOK_SECRET"] ?? "").trim();
        let event: StripeEvent | null;
        try {
          if (whsec) {
            if (!g.verifyStripeSignature(payload, request.headers.get("stripe-signature"), whsec, Date.now())) {
              return new Response("Vale allkiri", { status: 400 });
            }
            event = JSON.parse(payload) as StripeEvent;
          } else {
            const id = (JSON.parse(payload) as { id?: unknown }).id;
            event = await g.fetchStripeEvent((process.env["STRIPE_SECRET_KEY"] ?? "").trim(), typeof id === "string" ? id : "");
            if (!event) return new Response("Tundmatu sündmus", { status: 400 });
          }
        } catch (e) {
          // Ära logi veateksti: see võib sisaldada võtit (nt vigase päise korral).
          console.error("[stripe-webhook] sündmuse kontroll ebaõnnestus:", (e as Error).name);
          return new Response("Vigane päring", { status: 400 });
        }
        try {
          const origin = new URL(request.url).origin;
          // E-poe tellimus (metadata.kind = "product") või kinkekaart (vaikimisi).
          if (event.data.object.metadata?.["kind"] === "product") {
            const shop = await import("@/lib/shop.server");
            const result = await shop.handleStripeEvent(await shop.prodDeps(origin), event);
            return Response.json({ received: true, result });
          }
          const d = await g.prodDeps(origin);
          const result = await g.handleStripeEvent(d, event);
          return Response.json({ received: true, result });
        } catch (e) {
          console.error("[stripe-webhook]", e);
          // 500: Stripe proovib hiljem uuesti. Topeltkaarti ei teki, sest payment_id on unikaalne.
          return new Response("Viga", { status: 500 });
        }
      },
    },
  },
});
