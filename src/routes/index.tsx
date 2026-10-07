import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import { PriceCalculator } from "@/components/site/PriceCalculator";
import { PhotoQuestion } from "@/components/site/PhotoQuestion";
import { Shop } from "@/components/site/Shop";
import { WithdrawalSection } from "@/components/site/WithdrawalSection";
import { Contact } from "@/components/site/Contact";
import { SITE_URL, canonical, siteJsonLd } from "@/lib/site";
import heroImage from "@/assets/hero-clean-home.jpg";

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
      { property: "og:image", content: `${SITE_URL}${heroImage}` },
      { property: "og:image:width", content: "1280" },
      { property: "og:image:height", content: "960" },
      { property: "og:image:alt", content: "Puhas ja valgusküllane elutuba" },
      { name: "twitter:image", content: `${SITE_URL}${heroImage}` },
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
