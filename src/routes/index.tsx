import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import { Intro } from "@/components/site/Intro";
import { Services } from "@/components/site/Services";
import { WhyUs } from "@/components/site/WhyUs";
import { Faq } from "@/components/site/Faq";
import { faqJsonLd } from "@/lib/faq";
import { PriceCalculator } from "@/components/site/PriceCalculator";
import { PhotoQuestion } from "@/components/site/PhotoQuestion";
import { Shop } from "@/components/site/Shop";
import { WithdrawalSection } from "@/components/site/WithdrawalSection";
import { Contact } from "@/components/site/Contact";
import { SITE_URL, canonical, siteJsonLd } from "@/lib/site";
import heroImage from "@/assets/hero-clean-home.jpg";

const title = "Kodukoristus Tartus ja Põlvas | Squeaky Clean";
const description =
  "Ühekordne kodukoristus Tartus, Põlvas ja lähiümbruses: hoolduskoristus, suurpuhastus ja aknapesu. Arvuta hind veebis kalkulaatoriga.";

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
    scripts: [siteJsonLd, faqJsonLd],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Intro />
      <Services />
      <WhyUs />
      <PriceCalculator />
      <PhotoQuestion />
      <Faq />
      <Shop />
      <WithdrawalSection />
      <Contact />
    </SiteLayout>
  );
}
