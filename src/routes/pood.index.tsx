import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site/Layout";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductCard } from "@/components/site/ProductCard";
import { CartBar } from "@/components/site/CartBar";
import { BUNDLE_TEXT } from "@/lib/shop.shared";
import { Shop } from "@/components/site/Shop";
import { shopProducts } from "@/lib/shop.functions";
import { SITE_URL, canonical } from "@/lib/site";

const title = "E-pood | Squeaky Clean";
const description = "Squeaky Cleani e-pood: praktilised digitaalsed dokumendid ja tooted koduks. Allalaadimine kohe pärast makset.";

export const Route = createFileRoute("/pood/")({
  loader: () => shopProducts(),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: `${SITE_URL}/pood` },
    ],
    links: [canonical("/pood")],
  }),
  component: Page,
});

function Page() {
  const products = Route.useLoaderData();
  const groups = products.reduce<Record<string, typeof products>>((acc, p) => {
    (acc[p.category || "Muud"] ??= []).push(p);
    return acc;
  }, {});
  return (
    <SiteLayout>
      {products.length === 0 ? (
        <Shop />
      ) : (
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading
              eyebrow="E-pood"
              title="Praktiline abi"
              accent="koduks"
              subtitle="Digitaalsed tooted on allalaaditavad kohe pärast makset. Link tuleb ka e-postile."
            />
            <p className="mx-auto mt-8 max-w-xl rounded-full border border-gold/50 px-6 py-3 text-center text-sm">
              Pane ise komplekt kokku. {BUNDLE_TEXT.replace("Komplekt: ", "")}
            </p>
            {Object.entries(groups).map(([cat, list]) => (
              <div key={cat} className="mt-14">
                {Object.keys(groups).length > 1 && (
                  <h2 className="mb-6 font-display text-2xl font-light">{cat}</h2>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((p) => (
                    <ProductCard key={p.slug} p={p} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      <CartBar />
    </SiteLayout>
  );
}
