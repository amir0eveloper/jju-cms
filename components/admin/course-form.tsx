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
import { createCourse } from "@/app/dashboard/courses/actions";
import { ScheduleManager, ScheduleItem } from "./courses/schedule-manager";

interface Teacher {
  id: string;
  name: string | null;
  username: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
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

export function CourseForm({
  setOpen,
  teachers,
  departments,
}: {
  setOpen: (open: boolean) => void;
  teachers: Teacher[];
  departments: Department[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  // Schedule State
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const programs = selectedDept?.programs || [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const academicYears = selectedProgram?.academicYears || [];

  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const semesters = selectedYear?.semesters || [];

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const res = await createCourse(formData);

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
        <DialogTitle>Create New Course</DialogTitle>
        <DialogDescription>
          Add a new course and assign a teacher.
        </DialogDescription>
      </DialogHeader>
      <form action={handleSubmit} className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Course Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="Introduction to Computer Science"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Course Code</Label>
            <Input id="code" name="code" placeholder="CS101" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacherId">Assign Teacher</Label>
            <Select name="teacherId" required>
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
              placeholder="Brief description..."
              className="min-h-25"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select
              name="departmentId"
              required
              onValueChange={(val) => {
                setSelectedDeptId(val);
                setSelectedProgramId("");
                setSelectedYearId("");
                setSelectedSemesterId("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="programId">Program</Label>
            <Select
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
                {programs.map((prog) => (
                  <SelectItem key={prog.id} value={prog.id}>
                    {prog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Select
                onValueChange={(val) => {
                  setSelectedYearId(val);
                  setSelectedSemesterId("");
                }}
                disabled={!selectedProgramId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="semesterId">Semester</Label>
              <Select
                name="semesterId"
                required
                onValueChange={setSelectedSemesterId}
                disabled={!selectedYearId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>
                <SelectContent>
                  {semesters.map((sem) => (
                    <SelectItem key={sem.id} value={sem.id}>
                      {sem.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input type="date" id="startDate" name="startDate" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input type="date" id="endDate" name="endDate" />
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="enrollmentKey">Key</Label>
              <Input
                id="enrollmentKey"
                name="enrollmentKey"
                placeholder="Optional"
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
            <Label htmlFor="isPublished">Publish Course?</Label>
            <select
              name="isPublished"
              className="border rounded px-2 py-1 text-sm bg-white"
            >
              <option value="false">Draft</option>
              <option value="true">Published</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm col-span-2">{error}</p>}
        <DialogFooter className="col-span-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Course"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
