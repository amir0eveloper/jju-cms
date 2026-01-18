"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { generateDepartmentReport } from "@/app/dashboard/reports/actions";
import { toast } from "sonner";

export function DepartmentReportClient() {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const result = await generateDepartmentReport({});
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

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Generating..." : "Generate Department Report"}
          </Button>
        </CardContent>
      </Card>

      {reportData && reportData.departments && (
        <div className="grid gap-4">
          {reportData.departments.map((dept: any, index: number) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dept.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {dept.code}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">College</p>
                    <p className="text-lg font-semibold">
                      {dept.college?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Students
                    </p>
                    <p className="text-lg font-semibold text-blue-600">
                      {dept._count?.students || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Total Courses
                    </p>
                    <p className="text-lg font-semibold text-green-600">
                      {dept._count?.courses || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Programs</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {dept.programs?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
