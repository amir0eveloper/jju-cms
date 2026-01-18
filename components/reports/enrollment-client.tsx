"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { generateEnrollmentReport } from "@/app/dashboard/reports/actions";
import { exportToCSV, prepareDataForExport } from "@/lib/reports/export-utils";
import { toast } from "sonner";

export function EnrollmentReportClient() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateEnrollmentReport({});
      if (result.error) {
        toast.error(result.error);
      } else {
        setReportData(result);
        toast.success("Report generated successfully!");
      }
    } catch (error) {
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData?.courses) return;
    const exportData = prepareDataForExport(
      reportData.courses,
      "COURSE_ENROLLMENT",
    );
    exportToCSV(
      exportData,
      `enrollment-${new Date().toISOString().split("T")[0]}`,
    );
    toast.success("Report exported to CSV!");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Generating..." : "Generate Enrollment Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && reportData.statistics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.statistics.totalCourses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reportData.statistics.totalEnrollments}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Enrollment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reportData.statistics.averageEnrollment}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {reportData && reportData.courses && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Enrollment Data ({reportData.courses.length} courses)
              </CardTitle>
              <Button onClick={handleExportCSV} variant="outline">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Code</th>
                    <th className="text-left p-2">Teacher</th>
                    <th className="text-left p-2">Department</th>
                    <th className="text-right p-2">Enrollments</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.courses.map((course: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2">{course.title}</td>
                      <td className="p-2">{course.code}</td>
                      <td className="p-2">
                        {course.teacher?.name ||
                          course.teacher?.username ||
                          "N/A"}
                      </td>
                      <td className="p-2">
                        {course.department?.name || "N/A"}
                      </td>
                      <td className="text-right p-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded font-semibold">
                          {course._count?.enrollments || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
