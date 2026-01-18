"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Search } from "lucide-react";
import { deleteCourse } from "@/app/dashboard/courses/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { EditCourseForm } from "./edit-course-form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Teacher {
  id: string;
  name: string | null;
  username: string;
}

interface Department {
  id: string;
  name: string;
  programs: {
    id: string;
    name: string;
    academicYears: {
      id: string;
      name: string;
      semesters: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

interface Course {
  id: string;
  title: string;
  code: string;
  description: string | null;
  teacherId: string;
  teacher: Teacher;
  departmentId: string | null;
  department: { id: string; name: string } | null;
  semesterId: string | null;
  semester?: {
    id: string;
    name: string;
    academicYearId: string;
    academicYear: {
      id: string;
      name: string;
      programId: string;
    };
  } | null;
  isPublished: boolean;
  _count: { enrollments: number };
}

export function CoursesTable({
  courses,
  teachers,
  departments,
}: {
  courses: Course[];
  teachers: Teacher[];
  departments: Department[];
}) {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      course.code.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      deptFilter === "ALL" || course.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search courses..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Filter by Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Year / Semester</TableHead>
              <TableHead>Teacher</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>
                  <Link
                    href={`/dashboard/courses/${course.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {course.title}
                  </Link>
                </TableCell>
                <TableCell>{course.department?.name || "-"}</TableCell>
                <TableCell>
                  {course.semester ? (
                    <div className="flex gap-1">
                      <Badge variant="outline">
                        {course.semester.academicYear.name}
                      </Badge>
                      <Badge variant="secondary">{course.semester.name}</Badge>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Not Assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  {course.teacher.name || course.teacher.username}
                </TableCell>
                <TableCell>
                  {course.isPublished ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-none">
                      Published
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-gray-500 border-dashed"
                    >
                      Draft
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{course._count.enrollments}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Dialog
                      open={editingCourse?.id === course.id}
                      onOpenChange={(open) => !open && setEditingCourse(null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingCourse(course)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </DialogTrigger>
                      {editingCourse?.id === course.id && (
                        <EditCourseForm
                          course={course}
                          setOpen={(open) => !open && setEditingCourse(null)}
                          teachers={teachers}
                          departments={departments}
                        />
                      )}
                    </Dialog>

                    <form
                      action={async () => {
                        await deleteCourse(course.id);
                      }}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
