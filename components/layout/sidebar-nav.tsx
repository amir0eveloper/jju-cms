"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutDashboard,
  Users,
  Settings,
  Building2,
  ClipboardCheck,
  FileBarChart,
} from "lucide-react";

interface SidebarNavProps {
  role: string;
}

export function SidebarNav({ role }: SidebarNavProps) {
  const pathname = usePathname();

  const links = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["ADMIN", "TEACHER", "STUDENT", "CLASS_MANAGER"],
      exact: true, // Only active if exact match
    },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "All Students",
      href: "/dashboard/students",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      name: "Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
      roles: ["ADMIN", "TEACHER", "STUDENT"],
    },
    {
      name: "Hierarchy",
      href: "/dashboard/hierarchy",
      icon: Building2,
      roles: ["ADMIN"],
    },
    {
      name: "Class Management",
      href: "/dashboard/class-manager",
      icon: ClipboardCheck,
      roles: ["ADMIN", "CLASS_MANAGER"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: FileBarChart,
      roles: ["ADMIN", "CLASS_MANAGER"],
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: Settings,
      roles: ["ADMIN", "TEACHER", "STUDENT", "CLASS_MANAGER"],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  return (
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {filteredLinks.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname?.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group font-medium",
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-blue-50 hover:text-blue-600",
            )}
          >
            <link.icon
              className={cn(
                "h-5 w-5",
                isActive
                  ? "text-white"
                  : "text-gray-400 group-hover:text-blue-600",
              )}
            />
            <span>{link.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
