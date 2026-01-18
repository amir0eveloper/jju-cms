"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileSpreadsheet } from "lucide-react";
import { generateStudentAttendanceReport } from "@/app/dashboard/reports/actions";
import { exportToCSV, prepareDataForExport } from "@/lib/reports/export-utils";
import { toast } from "sonner";

export function StudentAttendanceReportClient() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    studentId: "",
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateStudentAttendanceReport(filters);
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
    if (!reportData?.records) return;
    const exportData = prepareDataForExport(
      reportData.records,
      "STUDENT_ATTENDANCE",
    );
    exportToCSV(
      exportData,
      `student-attendance-${new Date().toISOString().split("T")[0]}`,
    );
    toast.success("Report exported to CSV!");
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) =>
                  setFilters({ ...filters, startDate: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) =>
                  setFilters({ ...filters, endDate: e.target.value })
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {reportData && reportData.statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.statistics.total}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Present
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reportData.statistics.present}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Absent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {reportData.statistics.absent}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Attendance Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reportData.statistics.attendanceRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Export Actions */}
      {reportData && reportData.records && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Report Results ({reportData.records.length} records)
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
                    <th className="text-left p-2">Student</th>
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Section</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.records
                    .slice(0, 100)
                    .map((record: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2">
                          {record.user?.name || record.user?.username || "N/A"}
                        </td>
                        <td className="p-2">
                          {record.session?.course?.title || "N/A"}
                        </td>
                        <td className="p-2">
                          {record.session?.date
                            ? new Date(record.session.date).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              record.status === "PRESENT"
                                ? "bg-green-100 text-green-700"
                                : record.status === "ABSENT"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-2">
                          {record.user?.section?.name || "N/A"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {reportData.records.length > 100 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing first 100 records. Export to CSV for complete data.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
