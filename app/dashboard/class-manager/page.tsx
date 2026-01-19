import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  getManagerCourses,
  getDashboardStats,
  getLiveClasses,
} from "./actions";
import { ClassManagerList } from "@/components/class-manager/class-list";
import { ClassManagerStats } from "@/components/class-manager/stats";
import { LiveClassTimeline } from "@/components/class-manager/live-timeline";

export default async function ClassManagerPage() {
  const session = await getServerSession(authOptions);

  if (
    session?.user?.role !== Role.CLASS_MANAGER &&
    session?.user?.role !== Role.ADMIN
  ) {
    redirect("/dashboard");
  }

  const courses = await getManagerCourses();
  const stats = await getDashboardStats();
  const liveClasses = await getLiveClasses();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">Class Management</h1>
        <p className="text-gray-500">
          Monitor academic operations and teacher attendance.
        </p>
      </div>

      {stats && <ClassManagerStats stats={stats} />}

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-4 lg:col-span-3">
          <LiveClassTimeline classes={liveClasses} />
        </div>
        <div className="md:col-span-8 lg:col-span-9">
          <ClassManagerList courses={courses} />
        </div>
      </div>
    </div>
  );
}
