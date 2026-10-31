import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/components/ui/toaster";
import { SITE_URL } from "@/lib/site";
import { Analytics } from "@/lib/analytics";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LandedNZ",
  description: "Your settlement roadmap for New Zealand",
};

// Explicit type: TS 7 does not see the global LayoutProps from next typegen.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={GeistSans.variable}>
      <body>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
