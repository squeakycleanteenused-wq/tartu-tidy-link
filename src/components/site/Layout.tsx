import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { LanguageProvider } from "@/lib/i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
