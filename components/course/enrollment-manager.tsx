"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enrollStudent } from "@/app/dashboard/courses/enrollment-actions";
import { Loader2, Users } from "lucide-react";

interface Student {
  id: string;
  name: string | null;
  username: string;
}

export function EnrollmentManager({
  courseId,
  students,
}: {
  courseId: string;
  students: Student[];
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnroll = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    const studentId = formData.get("studentId") as string;

    if (!studentId) {
      setError("Please select a student");
      setLoading(false);
      return;
    }

    const res = await enrollStudent(courseId, studentId);

    if (res.error) {
      setError(res.error);
    } else {
      setOpen(false);
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="h-4 w-4 mr-2" />
          Enroll Student
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll Student</DialogTitle>
          <DialogDescription>
            Select a student to enroll in this course.
          </DialogDescription>
        </DialogHeader>
        <form action={handleEnroll} className="space-y-4">
          <div className="space-y-2">
            <Select name="studentId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name || student.username} ({student.username})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enroll"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
