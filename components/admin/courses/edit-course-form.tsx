"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCourse } from "@/app/dashboard/courses/actions";
import { ScheduleManager, ScheduleItem } from "./schedule-manager";

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
        name: string; // Corrected from 'title' to 'name' based on previous context if needed, but schema says name.
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
  departmentId: string | null;
  semesterId: string | null;
  semester?: {
    id: string;
    academicYearId: string;
    academicYear: {
      id: string;
      programId: string;
    };
  } | null;
  startDate?: Date | null;
  endDate?: Date | null;
  isPublished: boolean;
  enrollmentKey?: string | null;
  maxStudents?: number | null;
  image?: string | null;
  schedules?: ScheduleItem[];
}

export function EditCourseForm({
  course,
  setOpen,
  teachers,
  departments,
}: {
  course: Course;
  setOpen: (open: boolean) => void;
  teachers: Teacher[];
  departments: Department[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Schedule State
  const [schedules, setSchedules] = useState<ScheduleItem[]>(
    course.schedules || [],
  );

  // Initialize state with course data
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    course.departmentId || "",
  );

  // Derive initial Program & Year
  const initialProgramId = course.semester?.academicYear.programId || "";
  const [selectedProgramId, setSelectedProgramId] =
    useState<string>(initialProgramId);

  const initialYearId = course.semester?.academicYearId || "";
  const [selectedYearId, setSelectedYearId] = useState<string>(initialYearId);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    course.semesterId || "",
  );

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const programs = selectedDept?.programs || [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const academicYears = selectedProgram?.academicYears || [];

  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const semesters = selectedYear?.semesters || [];

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const res = await updateCourse(course.id, formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Course</DialogTitle>
        <DialogDescription>Update course details.</DialogDescription>
      </DialogHeader>
      <form action={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={course.title}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" name="code" defaultValue={course.code} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId">Assign Teacher</Label>
            <Select name="teacherId" defaultValue={course.teacherId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name || teacher.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={course.description || ""}
              className="min-h-25"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select
              name="departmentId"
              value={selectedDeptId}
              onValueChange={(val) => {
                setSelectedDeptId(val);
                setSelectedProgramId("");
                setSelectedYearId("");
                setSelectedSemesterId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="program">Program</Label>
            <Select
              value={selectedProgramId}
              onValueChange={(val) => {
                setSelectedProgramId(val);
                setSelectedYearId("");
                setSelectedSemesterId("");
              }}
              disabled={!selectedDeptId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select
                value={selectedYearId}
                onValueChange={(val) => {
                  setSelectedYearId(val);
                  setSelectedSemesterId("");
                }}
                disabled={!selectedDeptId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((y) => (
                    <SelectItem key={y.id} value={y.id}>
                      {y.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semesterId">Semester</Label>
              <Select
                name="semesterId"
                value={selectedSemesterId}
                onValueChange={setSelectedSemesterId}
                disabled={!selectedYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                type="date"
                id="startDate"
                name="startDate"
                defaultValue={
                  course.startDate
                    ? new Date(course.startDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                type="date"
                id="endDate"
                name="endDate"
                defaultValue={
                  course.endDate
                    ? new Date(course.endDate).toISOString().split("T")[0]
                    : ""
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxStudents">Max Students</Label>
              <Input
                type="number"
                id="maxStudents"
                name="maxStudents"
                placeholder="Optional"
                defaultValue={course.maxStudents || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentKey">Key</Label>
              <Input
                id="enrollmentKey"
                name="enrollmentKey"
                placeholder="Optional"
                defaultValue={course.enrollmentKey || ""}
              />
            </div>
          </div>

          <div className="space-y-2 col-span-2">
            <ScheduleManager
              initialSchedules={schedules}
              onChange={setSchedules}
            />
            <input
              type="hidden"
              name="schedules"
              value={JSON.stringify(schedules)}
            />
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Label htmlFor="isPublished">Status</Label>
            <select
              name="isPublished"
              className="border rounded px-2 py-1 text-sm bg-white"
              defaultValue={course.isPublished ? "true" : "false"}
            >
              <option value="false">Draft</option>
              <option value="true">Published</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}
        <DialogFooter className="col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
