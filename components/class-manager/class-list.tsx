"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, XCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { markClassAttendance } from "@/app/dashboard/class-manager/actions";
import { toast } from "sonner"; // Assuming sonner or use toast from ui

// Define Course type based on the action result
type Course = {
  id: string;
  title: string;
  code: string;
  teacherId: string;
  teacher: { name: string | null; username: string };
  department: { name: string; code: string } | null;
  teacherAttendances: {
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
    date: Date;
  }[];
};

export function ClassManagerList({ courses }: { courses: Course[] }) {
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<string | null>(null);

  // Local state for optimistic updates
  // Map<courseId, status>
  const [localStatus, setLocalStatus] = useState<Record<string, string>>({});

  const getStatus = (course: Course) => {
    // Check local optimistic state first
    if (localStatus[course.id]) return localStatus[course.id];

    // Then check server data (latest one)
    // Note: This logic assumes the server returns the latest status relevant to "date".
    // Since we don't refetch on date change yet in this MVP client, it's imperfect but acceptable.
    if (course.teacherAttendances.length > 0) {
      return course.teacherAttendances[0].status;
    }
    return null;
  };

  const handleMark = async (course: Course, status: "PRESENT" | "ABSENT") => {
    setLoading(course.id);
    try {
      const res = await markClassAttendance(
        course.id,
        course.teacherId,
        status,
        date,
      );
      if (res.success) {
        toast.success(`Marked ${status}`);
        // Optimistic update
        setLocalStatus((prev) => ({ ...prev, [course.id]: status }));
      } else {
        toast.error("Failed to mark");
      }
    } catch (e) {
      toast.error("Error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg border shadow-sm">
        <span className="font-semibold text-gray-700">Attendance Date:</span>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-60 justify-start text-left font-normal",
                !date && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const currentStatus = getStatus(course);

          return (
            <Card
              key={course.id}
              className={cn(
                currentStatus === "PRESENT" && "border-green-500",
                currentStatus === "ABSENT" && "border-red-500",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-bold">
                    {course.title}
                  </CardTitle>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline">{course.code}</Badge>
                    {currentStatus && (
                      <Badge
                        variant={
                          currentStatus === "PRESENT"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {currentStatus}
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {course.department?.code}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="font-medium">Teacher:</div>
                    <div>{course.teacher.name || course.teacher.username}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                      onClick={() => handleMark(course, "PRESENT")}
                      disabled={
                        loading === course.id || currentStatus === "PRESENT"
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Held
                    </Button>
                    <Button
                      className="flex-1"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleMark(course, "ABSENT")}
                      disabled={
                        loading === course.id || currentStatus === "ABSENT"
                      }
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Absent
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
