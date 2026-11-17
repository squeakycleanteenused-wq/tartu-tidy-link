import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WaitlistResult } from "@/components/site/WaitlistResult";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/epood/kinnita")({
  validateSearch: z.object({ token: z.string().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "E-poe teavituse kinnitamine | Squeaky Clean" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/` }],
  }),
  component: Page,
});

function Page() {
  const { token } = Route.useSearch();
  return <WaitlistResult action="confirm" token={token} />;
}
