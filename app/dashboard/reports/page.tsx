import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportTypeCards } from "@/components/reports/report-type-cards";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Only allow ADMIN and CLASS_MANAGER to access reports
  if (session.user.role !== "ADMIN" && session.user.role !== "CLASS_MANAGER") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <FileBarChart className="h-8 w-8 text-blue-600" />
          Reports & Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate comprehensive reports with advanced filtering and export
          capabilities
        </p>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            <li>Select a report type below</li>
            <li>Apply filters to customize your report data</li>
            <li>Preview the results in table and chart format</li>
            <li>Export to PDF, Excel, or CSV as needed</li>
          </ol>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Available Reports</h2>
        <ReportTypeCards />
      </div>
    </div>
  );
}
