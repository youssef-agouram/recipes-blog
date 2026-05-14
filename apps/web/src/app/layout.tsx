import type { Metadata } from "next";
import { DM_Sans, Lora, Work_Sans } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/components/providers/ReduxProvider";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800", "900"],
});

const lora = Lora({
  variable: "--font-body",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeHub | Elegant Recipes",
  description: "Discover healthy and delicious recipes.",
};

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
          <Toaster position="top-right" richColors theme="dark" closeButton />
        </ReduxProvider>
      </body>
    </html>
  );
}
