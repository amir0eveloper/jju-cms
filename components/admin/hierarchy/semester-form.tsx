"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSemester } from "@/app/dashboard/hierarchy/actions";

interface College {
  id: string;
  name: string;
  departments: {
    id: string;
    name: string;
    programs: {
      id: string;
      name: string;
      academicYears: { id: string; name: string }[];
    }[];
  }[];
}

export function SemesterForm({ colleges }: { colleges: College[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const selectedCollege = colleges.find((c) => c.id === selectedCollegeId);
  const departments = selectedCollege?.departments || [];

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const programs = selectedDept?.programs || [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const academicYears = selectedProgram?.academicYears || [];

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const res = await createSemester(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setLoading(false);
      // Optional: Reset form state?
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-700">Create Semester</h3>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Select College</Label>
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
        </div>

        <div className="space-y-2">
          <Label>Select Department</Label>
          <Select
            onValueChange={setSelectedDeptId}
            disabled={!selectedCollegeId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Department" />
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
          <Label>Select Program</Label>
          <Select
            onValueChange={setSelectedProgramId}
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

        <div className="space-y-2">
          <Label htmlFor="academicYearId">Select Academic Year</Label>
          <Select name="academicYearId" disabled={!selectedProgramId} required>
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
          <Label htmlFor="name">Semester Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="e.g. Semester 1"
            required
            disabled={!selectedProgramId}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="semesterNumber">Semester Number</Label>
          <Input
            id="semesterNumber"
            name="semesterNumber"
            type="number"
            placeholder="e.g. 1"
            required
            disabled={!selectedProgramId}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading || !selectedProgramId}
          className="w-full"
        >
          {loading ? "Creating..." : "Add Semester"}
        </Button>
      </form>
    </div>
  );
}
