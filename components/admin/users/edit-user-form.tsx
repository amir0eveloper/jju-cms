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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateUser } from "@/app/dashboard/users/actions";
import { Role } from "@prisma/client";

interface User {
  id: string;
  name: string | null;
  username: string;
  role: Role;
  departmentId: string | null;
  sectionId: string | null;
}

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

export function EditUserForm({
  user,
  setOpen,
  departments,
}: {
  user: User;
  setOpen: (open: boolean) => void;
  departments: Department[];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>(user.role);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(
    user.departmentId || "",
  );
  // We need to fetch the user's current program/year/semester if they have one?
  // The user object only has departmentId and sectionId.
  // We can't automatically infer program/year/semester easily without complex lookup or traversing down from department.
  // For now, if editing, we might need to reset hierarchical selection if they change department.
  // BUT the user interface might need to pre-fill if possible.
  // Given we don't have programId on user, we initialize empty if department matches but we can't find exact path.
  // Actually, we can traverse up from Section -> Semester -> Year -> Program.
  // But we only have `user.sectionId` and `user.departmentId`.
  // We can find the section in the departments tree to verify the path.

  // Helper to find path based on sectionId
  const findPath = (deptId: string, sectId: string) => {
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return null;
    for (const prog of dept.programs) {
      for (const year of prog.academicYears) {
        for (const sem of year.semesters) {
          if (sem.sections.some((s) => s.id === sectId)) {
            return { programId: prog.id, yearId: year.id, semesterId: sem.id };
          }
        }
      }
    }
    return null;
  };

  const initialPath =
    user.departmentId && user.sectionId
      ? findPath(user.departmentId, user.sectionId)
      : null;

  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    initialPath?.programId || "",
  );
  const [selectedYearId, setSelectedYearId] = useState<string>(
    initialPath?.yearId || "",
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    initialPath?.semesterId || "",
  );
  const [currentSectionId, setCurrentSectionId] = useState<string>(
    user.sectionId || "",
  );

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

    const res = await updateUser(user.id, formData);

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
        <DialogTitle>Edit User</DialogTitle>
        <DialogDescription>Update user details.</DialogDescription>
      </DialogHeader>
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name || ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={user.username}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          {user.role === Role.STUDENT ? (
            <Input value="Student" disabled className="bg-gray-100" />
          ) : (
            // Only show editable role select if not student (usually admin editing staff)
            // But let's respect the "don't show ADMIN" rule if we are changing roles.
            <Select
              name="role"
              defaultValue={user.role}
              onValueChange={(val) => setSelectedRole(val as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(Role)
                  .filter((r) => r !== Role.ADMIN && r !== Role.STUDENT) // Assume we don't downgrade to student here? Or maybe we can.
                  .map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                {/* Keep current role if it is ADMIN, to allow editing admins but not creating new ones? */}
                {user.role === Role.ADMIN && (
                  <SelectItem value={Role.ADMIN}>ADMIN</SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
          {/* Hidden input to ensure role is sent */}
          <input type="hidden" name="role" value={selectedRole} />
        </div>

        {selectedRole === Role.STUDENT && (
          <>
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
                defaultValue={selectedDeptId}
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
                value={selectedProgramId}
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
                value={selectedYearId}
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
                value={selectedSemesterId}
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
              <Select
                name="sectionId"
                disabled={!selectedSemesterId}
                defaultValue={currentSectionId}
                onValueChange={setCurrentSectionId}
              >
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
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <DialogFooter>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
