import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import "./globals.css";
import RequestTransferContextProvider from "@/context/RequestTransferContext";
import SourceContextProvider from "@/context/SourceContext";
import DestinationContextProvider from "@/context/DestinationContext";


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
  return (
    // <ClerkProvider>
      <html lang="en">
        <body className={`montserrat.className, h-auto`}>
          <div className="h-full mx-auto flex flex-col">
            <Header />
              <SourceContextProvider>
                <DestinationContextProvider>
                  <RequestTransferContextProvider>
                  {children}
                  </RequestTransferContextProvider>
                </DestinationContextProvider>
              </SourceContextProvider>
          </div>
          <div className="h-20">
            <Footer />
          </div>
        </body>
      </html>
    // </ClerkProvider>
  );
}
