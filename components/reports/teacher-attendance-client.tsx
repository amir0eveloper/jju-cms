"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileSpreadsheet } from "lucide-react";
import { generateTeacherAttendanceReport } from "@/app/dashboard/reports/actions";
import { exportToCSV, prepareDataForExport } from "@/lib/reports/export-utils";
import { toast } from "sonner";

export function TeacherAttendanceReportClient() {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    teacherId: "",
  });
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateTeacherAttendanceReport(filters);
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
      "TEACHER_ATTENDANCE",
    );
    exportToCSV(
      exportData,
      `teacher-attendance-${new Date().toISOString().split("T")[0]}`,
    );
    toast.success("Report exported to CSV!");
  };

  return (
    <div className="space-y-6">
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

      {reportData && reportData.statistics && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {reportData.statistics.totalClasses}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Classes Held
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {reportData.statistics.held}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Coverage Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {reportData.statistics.coverageRate}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                    <th className="text-left p-2">Teacher</th>
                    <th className="text-left p-2">Course</th>
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.records
                    .slice(0, 100)
                    .map((record: any, index: number) => (
                      <tr key={index} className="border-b hover:bg-slate-50">
                        <td className="p-2">
                          {record.teacher?.name ||
                            record.teacher?.username ||
                            "N/A"}
                        </td>
                        <td className="p-2">{record.course?.title || "N/A"}</td>
                        <td className="p-2">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              record.status === "PRESENT"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                        <td className="p-2">
                          {record.markedBy?.name ||
                            record.markedBy?.username ||
                            "N/A"}
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
