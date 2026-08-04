import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { CartDrawer } from "./Shop";
import { LanguageProvider } from "@/lib/i18n";
import { CartProvider } from "@/lib/shop";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}