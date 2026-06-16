import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "sonner";
import Script from "next/script";

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
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "GTM-TLSR8KGV";

  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable} dark`}>
      <head>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');
            `,
          }}
        />
      </head>
      <body className="antialiased font-body flex min-h-screen flex-col">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ReduxProvider>
          {children}
          <AnalyticsTracker />
          <Toaster position="top-right" richColors theme="dark" closeButton />
        </ReduxProvider>
      </body>
    </html>
  );
}
