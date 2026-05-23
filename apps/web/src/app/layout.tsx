import type { Metadata } from "next";
import { DM_Sans, Lora, Work_Sans } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const workSans = Work_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  display: "swap",
});

import { constructMetadata } from "@/lib/seo";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";

export const metadata = constructMetadata({
  title: "TastyRecipes | Elegant Cooking & Delicious Recipes",
  description: "Discover and explore thousands of handpicked, healthy, and delicious cooking recipes from around the world.",
  keywords: "recipes, cooking, food, easy recipes, quick dinner, tasty recipes, cooking guide",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable} ${workSans.variable} dark`}>
      <body className="antialiased font-body flex min-h-screen flex-col">
        <ReduxProvider>
          {children}
          <AnalyticsTracker />
          <Toaster position="top-right" richColors theme="dark" closeButton />
        </ReduxProvider>
      </body>
    </html>
  );
}
