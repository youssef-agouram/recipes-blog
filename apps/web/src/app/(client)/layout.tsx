import dynamic from "next/dynamic";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const AnnouncementBar = dynamic(
  () => import("@/components/layout/AnnouncementBar").then(mod => mod.AnnouncementBar)
);
const BottomNavigation = dynamic(
  () => import("@/components/layout/BottomNavigation").then(mod => mod.BottomNavigation)
);

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnnouncementBar />
      <BottomNavigation />
    </>
  );
}
