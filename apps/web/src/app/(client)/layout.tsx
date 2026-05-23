import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      <Footer />
      <AnnouncementBar />
      <BottomNavigation />
    </>
  );
}
