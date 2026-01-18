import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentAttendanceReportClient } from "@/components/reports/student-attendance-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function StudentAttendanceReportPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "CLASS_MANAGER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Student Attendance Report
          </h1>
          <p className="text-muted-foreground">
            Track and analyze student attendance across courses
          </p>
        </div>
      </div>

      <StudentAttendanceReportClient />
    </div>
  );
}
