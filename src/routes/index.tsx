import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { BookingSection } from "@/components/site/BookingSection";
import { Shop } from "@/components/site/Shop";
import { Contact } from "@/components/site/Contact";

const title = "Koristusteenused Tartus ja Põlvas | Squeaky Clean";
const description =
  "Hoolduskoristus, suurpuhastus ja aknapesu Tartus, Põlvas ja lähiümbruses. Läbipaistev hinnakiri, kindlustatud teenus ja mugav broneerimine.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <SiteLayout>
      <Hero />
      <Services />
      <BookingSection />
      <Shop />
      <Contact />
    </SiteLayout>
  );
}
