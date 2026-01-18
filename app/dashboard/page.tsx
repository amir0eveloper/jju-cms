import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma";
import StudentDashboard from "@/components/dashboard/student-dashboard";
import TeacherDashboard from "@/components/dashboard/teacher-dashboard";
import {
  getDashboardStats,
  getEnrollmentChartData,
  getAttendanceTrends,
  getRecentActivity,
} from "./actions";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { EnrollmentChart } from "@/components/dashboard/enrollment-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === Role.STUDENT) {
    return <StudentDashboard />;
  }

  if (session?.user?.role === Role.TEACHER) {
    return <TeacherDashboard />;
  }

  // Admin and Class Manager dashboard
  if (
    session?.user?.role === Role.ADMIN ||
    session?.user?.role === Role.CLASS_MANAGER
  ) {
    const [stats, enrollmentData, attendanceData, activity] = await Promise.all(
      [
        getDashboardStats().catch(() => null),
        getEnrollmentChartData().catch(() => []),
        getAttendanceTrends().catch(() => []),
        getRecentActivity().catch(() => ({
          recentUsers: [],
          recentCourses: [],
        })),
      ],
    );

    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">
            {session.user.role === Role.ADMIN
              ? "Admin Dashboard"
              : "Class Manager Dashboard"}
          </h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your system.
          </p>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="grid gap-6 md:grid-cols-2">
          <EnrollmentChart data={enrollmentData} />
          <AttendanceChart data={attendanceData} />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <ActivityFeed
              recentUsers={activity.recentUsers}
              recentCourses={activity.recentCourses}
            />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    );
  }

  // Fallback for other roles
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-blue-500 leading-tight">
          Dashboard
        </h1>
      </div>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="border rounded-lg p-6 bg-white shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Welcome</h3>
            <div className="text-2xl font-bold text-blue-600">
              {session?.user?.name || session?.user?.username}
            </div>
            <p className="text-xs text-blue-500 font-medium capitalize mt-1">
              Role:{" "}
              {session?.user?.role
                ? String(session.user.role).toLowerCase()
                : "unknown"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
