import { Sidebar } from "@/components/layout/sidebar";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

import { NotificationBell } from "@/components/dashboard/notification-bell";

import { MobileSidebar } from "@/components/layout/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      <div className="flex-1 relative overflow-hidden">
        {/* Mobile Hamburger */}
        <div className="absolute top-4 left-4 z-20 md:hidden">
          <MobileSidebar>
            <Sidebar />
          </MobileSidebar>
        </div>

        {/* Notification Bell */}
        <div className="absolute top-4 right-6 z-10">
          <NotificationBell />
        </div>

        {/* Main Content */}
        <main className="h-full overflow-y-auto p-4 pt-16 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
