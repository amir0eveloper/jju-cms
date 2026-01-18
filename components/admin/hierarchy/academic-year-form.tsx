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
import { createAcademicYear } from "@/app/dashboard/hierarchy/actions";
import { Plus } from "lucide-react";

interface College {
  id: string;
  name: string;
  departments: {
    id: string;
    name: string;
    programs: { id: string; name: string }[];
  }[];
}

export function AcademicYearForm({ colleges }: { colleges: College[] }) {
  const [open, setOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("");

  const departments =
    colleges.find((c) => c.id === selectedCollegeId)?.departments || [];

  const programs =
    departments.find((d) => d.id === selectedDeptId)?.programs || [];

  async function action(formData: FormData) {
    await createAcademicYear(formData);
    setOpen(false);
    setSelectedCollegeId("");
    setSelectedDeptId("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Year
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Academic Year</DialogTitle>
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

          <Select name="programId" disabled={!selectedDeptId} required>
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

          <Input
            name="name"
            placeholder="Year Name (e.g. Year 1)"
            required
            disabled={!selectedDeptId} // Or !selectedProgramId if captured
          />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
