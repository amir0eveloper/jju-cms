import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { TeacherAttendanceReportClient } from "@/components/reports/teacher-attendance-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeacherAttendanceReportPage() {
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
            Teacher Attendance Report
          </h1>
          <p className="text-muted-foreground">
            Monitor teacher coverage and class delivery
          </p>
        </div>
      </div>

      <TeacherAttendanceReportClient />
    </div>
  );
}
