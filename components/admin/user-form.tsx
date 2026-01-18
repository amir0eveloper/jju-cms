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
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createUser } from "@/app/dashboard/users/actions";
import { Role } from "@/lib/generated/prisma/enums";

interface Section {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
  sections: Section[];
}

interface AcademicYear {
  id: string;
  name: string;
  semesters: Semester[];
}

interface Program {
  id: string;
  name: string;
  academicYears: AcademicYear[];
}

interface Department {
  id: string;
  name: string;
  programs: Program[];
}

export function UserForm({
  setOpen,
  departments,
}: {
  setOpen: (open: boolean) => void;
  departments: Department[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.STUDENT);
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");

  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const programs = selectedDept?.programs || [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const academicYears = selectedProgram?.academicYears || [];

  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const semesters = selectedYear?.semesters || [];

  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);
  const sections = selectedSemester?.sections || [];

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(null);

    const res = await createUser(formData);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New User</DialogTitle>
        <DialogDescription>
          Add a new user to the system. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Column 1: Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700 border-b pb-2">
              Basic Information
            </h3>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="John Doe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                name="role"
                required
                onValueChange={(val) => setSelectedRole(val as Role)}
                defaultValue={Role.STUDENT}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role)
                    .filter((role) => role !== Role.ADMIN)
                    .map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Column 2: Enrollment Info (Conditional) */}
          <div className="space-y-4">
            {selectedRole === Role.STUDENT ? (
              <>
                <h3 className="font-semibold text-gray-700 border-b pb-2">
                  Enrollment Details
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department</Label>
                  <Select
                    name="departmentId"
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
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
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
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                    onValueChange={setSelectedSemesterId}
                    disabled={!selectedYearId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
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

                <div className="space-y-2">
                  <Label htmlFor="sectionId">Section</Label>
                  <Select name="sectionId" disabled={!selectedSemesterId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Section" />
                    </SelectTrigger>
                    <SelectContent>
                      {sections.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 italic bg-gray-50 rounded border border-dashed">
                No additional details for this role.
              </div>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? "Creating..." : "Create User"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
