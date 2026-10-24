import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-geist" });

export const metadata: Metadata = {
  title: "LandedNZ",
  description: "Your settlement roadmap for New Zealand",
};

// Explicit type: TS 7 does not see the global LayoutProps from next typegen.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-NZ" className={geist.variable}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
