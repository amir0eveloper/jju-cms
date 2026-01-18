"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bulkUploadStudents } from "@/app/dashboard/users/bulk-upload/actions";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface Section {
  id: string;
  name: string;
  level: number;
}

interface Department {
  id: string;
  name: string;
  sections: Section[];
}

interface College {
  id: string;
  name: string;
  departments: Department[];
}

export function BulkUploadForm({ colleges }: { colleges: College[] }) {
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const departments =
    colleges.find((c) => c.id === selectedCollegeId)?.departments || [];
  const sections =
    departments.find((d) => d.id === selectedDeptId)?.sections || [];

  async function action(formData: FormData) {
    setLoading(true);
    const text = formData.get("studentData") as string;
    const res = await bulkUploadStudents(selectedSectionId, text);
    setResult(res);
    setLoading(false);
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>1. Select Target Section</Label>
            <Select onValueChange={setSelectedCollegeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select College" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedDeptId}
              disabled={!selectedCollegeId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              onValueChange={setSelectedSectionId}
              disabled={!selectedDeptId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Section" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    Year {s.level} - {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-2">
              <Label>2. Paste Student List</Label>
              <p className="text-xs text-gray-500">
                Format: Name, Username (one per line)
              </p>
              <Textarea
                name="studentData"
                placeholder={"John Doe, john.doe\nJane Smith, jane.smith"}
                className="h-64 font-mono text-sm"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !selectedSectionId}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import Students
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Select the College, Department, and Section first.</li>
              <li>Copy your student list from Excel or CSV.</li>
              <li>Ensure each line has "Name, Username".</li>
              <li>
                Password defaults to <code>password123</code>.
              </li>
            </ul>
          </CardContent>
        </Card>

        {result && (
          <Alert
            variant={result.stats.errors > 0 ? "destructive" : "default"}
            className={
              result.stats.errors === 0
                ? "border-green-200 bg-green-50 text-green-800"
                : ""
            }
          >
            <AlertTitle>Import Complete</AlertTitle>
            <AlertDescription>
              <div className="mt-2 text-sm">
                <p>
                  Successfully imported: <b>{result.stats.success}</b>
                </p>
                <p>
                  Errors: <b>{result.stats.errors}</b>
                </p>
                {result.errorMessages.length > 0 && (
                  <div className="mt-2 p-2 bg-white rounded border max-h-40 overflow-y-auto">
                    {result.errorMessages.map((e: string, i: number) => (
                      <div
                        key={i}
                        className="text-xs text-red-600 border-b last:border-0 py-1"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
