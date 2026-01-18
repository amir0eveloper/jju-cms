"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { unenrollStudent } from "@/app/dashboard/courses/enrollment-actions";

interface Student {
  id: string;
  name: string | null;
  username: string;
}

interface StudentListProps {
  courseId: string;
  enrolledStudents: Student[];
}

export function StudentList({ courseId, enrolledStudents }: StudentListProps) {
  return (
    <div className="rounded-md border bg-white shadow-sm mt-6">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-blue-500">Enrolled Students</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrolledStudents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                No students enrolled yet.
              </TableCell>
            </TableRow>
          ) : (
            enrolledStudents.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">
                  {student.name || "N/A"}
                </TableCell>
                <TableCell>{student.username}</TableCell>
                <TableCell className="text-right">
                  <form
                    action={async () => {
                      await unenrollStudent(courseId, student.id);
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      title="Unenroll Student"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
