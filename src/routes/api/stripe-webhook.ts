import { createFileRoute } from "@tanstack/react-router";

/* Stripe'i webhook: kinnitab makse ja väljastab kinkekaardi. Allkiri kontrollitakse STRIPE_WEBHOOK_SECRET-iga.
   Stripe'i Dashboardis: Developers → Webhooks → endpoint https://<leht>/api/stripe-webhook,
   sündmused checkout.session.completed ja checkout.session.async_payment_succeeded. */
export const Route = createFileRoute("/api/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const g = await import("@/lib/giftcards.server");
        const payload = await request.text();
        const ok = g.verifyStripeSignature(
          payload,
          request.headers.get("stripe-signature"),
          process.env["STRIPE_WEBHOOK_SECRET"] ?? "",
          Date.now(),
        );
        if (!ok) return new Response("Vale allkiri", { status: 400 });
        try {
          const d = await g.prodDeps(new URL(request.url).origin);
          const result = await g.handleStripeEvent(d, JSON.parse(payload));
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
