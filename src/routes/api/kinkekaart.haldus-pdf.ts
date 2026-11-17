import { createFileRoute } from "@tanstack/react-router";

/* Halduse PDF: kliendi fail või trükikoja fail (?bleed=1, 3 mm lõikevaruga). Ainult sisselogitud omanikule. */
export const Route = createFileRoute("/api/kinkekaart/haldus-pdf")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const g = await import("@/lib/giftcards.server");
        const u = new URL(request.url);
        const d = await g.prodDeps(u.origin);
        const cookie = (request.headers.get("cookie") ?? "")
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith(`${g.ADMIN_COOKIE}=`))
          ?.slice(g.ADMIN_COOKIE.length + 1);
        if (!g.verifyAdminToken(d, cookie ? decodeURIComponent(cookie) : undefined)) {
          return new Response("Pole sisse logitud", { status: 401 });
        }
        const nr = u.searchParams.get("nr") ?? "";
        const bleed = u.searchParams.get("bleed") === "1";
        const card = g.CARD_NR_RE.test(nr) ? await g.readCard(d, nr) : null;
        if (!card) return new Response("Kaarti ei leitud", { status: 404 });
        const pdf = await d.pdf(card, { bleed });
        return new Response(pdf, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="kinkekaart_${card.nr}${bleed ? "_trykk_3mm" : ""}.pdf"`,
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
