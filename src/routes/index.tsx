import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import { PriceCalculator } from "@/components/site/PriceCalculator";
import { PhotoQuestion } from "@/components/site/PhotoQuestion";
import { Shop } from "@/components/site/Shop";
import { WithdrawalSection } from "@/components/site/WithdrawalSection";
import { Contact } from "@/components/site/Contact";
import { SITE_URL, canonical, siteJsonLd } from "@/lib/site";

const title = "Koristusteenused Tartus ja Põlvas | Squeaky Clean";
const description =
  "Hoolduskoristus, suurpuhastus ja aknapesu Tartus, Põlvas ja lähiümbruses. Arvuta hind veebis kalkulaatoriga.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [canonical("/")],
    scripts: [siteJsonLd],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <PriceCalculator />
      <PhotoQuestion />
      <Shop />
      <WithdrawalSection />
      <Contact />
    </SiteLayout>
  );
}
