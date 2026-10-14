import { RENTAL_COMPANY } from "@/lib/rental-contract";

/* Lehe ametlik aadress. Google kasutab seda otsingutulemustes (canonical, og:url). */
export const SITE_URL = "https://squeakycleanteenused.ee";
export const SITE_NAME = "Squeaky Clean";

export const canonical = (path: string) => ({ rel: "canonical", href: `${SITE_URL}${path}` });

/* Struktureeritud andmed: Google kuvab nende põhjal saidi nime ja ettevõtte infot. */
export const siteJsonLd = {
  type: "application/ld+json",
  children: JSON.stringify([
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      alternateName: RENTAL_COMPANY.name,
      url: `${SITE_URL}/`,
    },
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: RENTAL_COMPANY.name,
      url: `${SITE_URL}/`,
      email: RENTAL_COMPANY.email,
      telephone: RENTAL_COMPANY.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rattasepa tee 16",
        addressLocality: "Soinaste küla, Kambja vald",
        addressRegion: "Tartumaa",
        postalCode: "61709",
        addressCountry: "EE",
      },
      areaServed: ["Tartu", "Põlva"],
      priceRange: "30–100 €",
      sameAs: [RENTAL_COMPANY.instagram],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Koristusteenused",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hoolduskoristus" }, priceSpecification: { "@type": "PriceSpecification", minPrice: 60, maxPrice: 70, priceCurrency: "EUR" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Suurpuhastus" }, priceSpecification: { "@type": "PriceSpecification", minPrice: 80, maxPrice: 100, priceCurrency: "EUR" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Aknapesu" }, priceSpecification: { "@type": "UnitPriceSpecification", minPrice: 3.5, priceCurrency: "EUR", unitText: "tk" } },
        ],
      },
      description: "Ühekordne kodukoristus Tartus, Põlvas ja lähiümbruses: hoolduskoristus, suurpuhastus ja aknapesu.",
    },
  ]),
};
