import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteLayout } from "@/components/site/Layout";
import { GiftCardShop } from "@/components/site/GiftCardShop";
import { SITE_URL, canonical } from "@/lib/site";

const title = "Kinkekaardid | Squeaky Clean";
const description =
  "Kingi puhas kodu: kodukoristuse kinkekaart Tartus ja Põlvas. Vali kujundus ja summa, maksa kohe ja saa kaart PDF-ina või prinditult ümbrikus.";

export const Route = createFileRoute("/kinkekaardid/")({
  validateSearch: z.object({ katkestatud: z.coerce.number().optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/kinkekaardid` },
    ],
    links: [canonical("/kinkekaardid")],
  }),
  component: Page,
});

function Page() {
  const { katkestatud } = Route.useSearch();
  return (
    <SiteLayout>
      <GiftCardShop cancelled={katkestatud === 1} />
    </SiteLayout>
  );
}
