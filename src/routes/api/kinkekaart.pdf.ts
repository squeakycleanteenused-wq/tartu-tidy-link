import { createFileRoute } from "@tanstack/react-router";

/* Kinkekaardi PDF allkirjastatud ja aeguva lingiga (link on ostja e-kirjas ja aitäh-lehel). */
export const Route = createFileRoute("/api/kinkekaart/pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await import("@/lib/giftcards.server");
        const u = new URL(request.url);
        const nr = u.searchParams.get("nr") ?? "";
        const exp = Number(u.searchParams.get("exp"));
        const sig = u.searchParams.get("sig") ?? "";
        const d = await g.prodDeps(u.origin);
        if (!g.CARD_NR_RE.test(nr) || !g.verifyPdfSig(d, nr, exp, sig)) {
          return new Response("Link on vigane või aegunud. Kirjuta meile ja saadame kaardi uuesti.", {
            status: 403,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        }
        const card = await g.readCard(d, nr);
        if (!card || card.status === "tühistatud") return new Response("Kaarti ei leitud", { status: 404 });
        const pdf = await d.pdf(card, { bleed: false });
        return new Response(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="kinkekaart_${card.nr}.pdf"`,
            "Cache-Control": "private, no-store",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
