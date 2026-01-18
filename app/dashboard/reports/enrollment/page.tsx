import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { EnrollmentReportClient } from "@/components/reports/enrollment-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EnrollmentReportPage() {
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
            Course Enrollment Report
          </h1>
          <p className="text-muted-foreground">
            Analyze course enrollment trends and capacity
          </p>
        </div>
      </div>

      <EnrollmentReportClient />
    </div>
  );
}
