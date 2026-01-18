"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createSection } from "@/app/dashboard/hierarchy/actions";
import { Plus } from "lucide-react";

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
      semesters: { id: string; name: string }[];
    }[];
  }[];
}

interface College {
  id: string;
  name: string;
  departments: Department[];
}

export function SectionForm({ colleges }: { colleges: College[] }) {
  const [open, setOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");

  const departments =
    colleges.find((c) => c.id === selectedCollegeId)?.departments || [];

  const programs =
    departments.find((d) => d.id === selectedDeptId)?.programs || [];

  const academicYears =
    programs.find((p) => p.id === selectedProgramId)?.academicYears || [];

  const semesters =
    academicYears.find((y) => y.id === selectedYearId)?.semesters || [];

  async function action(formData: FormData) {
    await createSection(formData);
    setOpen(false);
    setSelectedCollegeId("");
    setSelectedDeptId("");
    setSelectedProgramId("");
    setSelectedYearId("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Section
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Section</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <Select onValueChange={setSelectedCollegeId} required>
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

          <Select
            onValueChange={setSelectedDeptId}
            disabled={!selectedCollegeId}
            required
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

          <Select
            onValueChange={setSelectedProgramId}
            disabled={!selectedDeptId}
            required
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

          <Select
            onValueChange={setSelectedYearId}
            disabled={!selectedProgramId}
            required
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

          <Select name="semesterId" disabled={!selectedYearId} required>
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

          <Input name="name" placeholder="Section Name (e.g. Sec A)" required />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
