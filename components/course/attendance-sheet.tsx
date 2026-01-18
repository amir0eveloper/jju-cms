"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { saveAttendance } from "@/app/dashboard/courses/attendance-actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AttendanceSheetProps {
  session: any;
  students: any[];
}

export function AttendanceSheet({ session, students }: AttendanceSheetProps) {
  // Map initial state
  const [records, setRecords] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    students.forEach((s) => {
      const existing = session.records.find((r: any) => r.studentId === s.id);
      initial[s.id] = existing?.status || "PRESENT"; // Default to PRESENT
    });
    return initial;
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleStatusChange = (studentId: string, status: string) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSave = async () => {
    setLoading(true);
    const payload = Object.entries(records).map(([studentId, status]) => ({
      studentId,
      status: status as "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
    }));

    const res = await saveAttendance(session.id, payload);
    setLoading(false);

    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      toast({
        title: "Saved",
        description: "Attendance recorded successfully.",
      });
    }
  };

  // Calculate dynamic stats
  const stats = Object.values(records).reduce((acc: any, status) => {
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex gap-4">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Present: {stats["PRESENT"] || 0}
          </Badge>
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Absent: {stats["ABSENT"] || 0}
          </Badge>
          <Badge
            variant="outline"
            className="bg-yellow-50 text-yellow-700 border-yellow-200"
          >
            Late: {stats["LATE"] || 0}
          </Badge>
        </div>
        <Button onClick={handleSave} disabled={loading} className="gap-2">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Attendance
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Name</TableHead>
              <TableHead>Registration No.</TableHead>
              <TableHead className="w-[200px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell className="text-gray-500">
                  {student.username}
                </TableCell>
                <TableCell>
                  <Select
                    value={records[student.id]}
                    onValueChange={(val) => handleStatusChange(student.id, val)}
                  >
                    <SelectTrigger
                      className={`w-[140px] ${
                        records[student.id] === "ABSENT"
                          ? "text-red-600 font-medium"
                          : records[student.id] === "LATE"
                            ? "text-yellow-600"
                            : "text-green-600"
                      }`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRESENT">Present</SelectItem>
                      <SelectItem value="ABSENT">Absent</SelectItem>
                      <SelectItem value="LATE">Late</SelectItem>
                      <SelectItem value="EXCUSED">Excused</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
