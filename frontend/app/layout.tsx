import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { SessionProvider } from "next-auth/react";

import "./globals.css";
import RequestTransferContextProvider from "@/context/RequestTransferContext";
import SourceContextProvider from "@/context/SourceContext";
import DestinationContextProvider from "@/context/DestinationContext";
import { LanguageProvider } from "@/context/LanguageContext";
import type { Lang } from "@/data/i18n/core";
import { ToastProvider } from "@/components/ui/toast";
// We avoid server cookies/headers here to keep this layout synchronous.


const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Koh Samui Transfer Service",
  description: "Local, Reliable, and Affordable Transfers in Koh Samui",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Best-effort get initial language from request URL (App Router layout is server component; search params available via headers)
  // We’ll parse from process.env.NEXT_RUNTIME headers via node's URL if provided by Next.
  // Fallback to 'en'; client will resync from URL/localStorage on mount.
  let initialLang: Lang | undefined = undefined;
  // Note: We avoid reading request headers here to keep this layout synchronous.
  // The language will be initialized from cookie if present and re-synced on the client from URL/localStorage.
  // Note: We don't read cookies on the server here; the LanguageProvider will sync from client storage/URL on mount.
  return (
    // <ClerkProvider>
      <html lang="en">
        <body className={`${montserrat.className} h-auto`}>
          <SessionProvider>
            <LanguageProvider initialLang={initialLang}>
              <ToastProvider>
                <div className="h-full mx-auto flex flex-col">
                  <Header />
                    <SourceContextProvider>
                      <DestinationContextProvider>
                        <RequestTransferContextProvider>
                          {children}
                        </RequestTransferContextProvider>
                      </DestinationContextProvider>
                    </SourceContextProvider>
                  <div className="h-20">
                    <Footer />
                  </div>
                </div>
              </ToastProvider>
            </LanguageProvider>
          </SessionProvider>
        </body>
      </html>
    // </ClerkProvider>
  );
}
