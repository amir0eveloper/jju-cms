import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { BookOpen } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SidebarNav } from "./sidebar-nav";
import Image from "next/image";

export async function Sidebar() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;

  return (
    <div className="h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className=" rounded-lg">
          <Image src="/jju-logo.png" alt="Logo" width={24} height={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-blue-500 leading-none">
            Jigjiga University
          </h2>
          <p className="text-xs text-blue-600 font-semibold mt-1">
            Class Management System
          </p>
        </div>
      </div>

      {role && <SidebarNav role={role} />}

      <div className="p-4 border-t border-gray-100 mt-auto">
        <SignOutButton />
      </div>
    </div>
  );
}
