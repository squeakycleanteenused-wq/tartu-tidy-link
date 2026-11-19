import { createFileRoute } from "@tanstack/react-router";

/* E-poe digitoote allalaadimine allkirjastatud ja aeguva lingiga (aitäh-lehel ja ostja e-kirjas).
   Fail on privaatses salves; suuname 60 sekundit kehtivale salvelingile. */
export const Route = createFileRoute("/api/pood/fail")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const shop = await import("@/lib/shop.server");
        const u = new URL(request.url);
        const d = await shop.prodDeps(u.origin);
        const r = await shop.resolveDownload(d, u.searchParams.get("o") ?? "", Number(u.searchParams.get("exp")), u.searchParams.get("sig") ?? "");
        if (!r.ok) {
          return new Response(
            r.reason === "link"
              ? "Allalaadimislink on vigane või aegunud. Kirjuta meile ja saadame uue lingi."
              : "Faili ei leitud. Kirjuta meile ja aitame.",
            { status: r.reason === "link" ? 403 : 404, headers: { "Content-Type": "text/plain; charset=utf-8" } },
          );
        }
        return new Response(null, { status: 302, headers: { Location: r.url, "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });
      },
    },
  },
});
