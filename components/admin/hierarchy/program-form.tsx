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
import { createProgram } from "@/app/dashboard/hierarchy/actions";
import { Plus } from "lucide-react";

interface College {
  id: string;
  name: string;
  departments: { id: string; name: string }[];
}

export function ProgramForm({ colleges }: { colleges: College[] }) {
  const [open, setOpen] = useState(false);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>("");

  const departments =
    colleges.find((c) => c.id === selectedCollegeId)?.departments || [];

  async function action(formData: FormData) {
    const res = await createProgram(formData);
    if (res?.success) {
      setOpen(false);
      setSelectedCollegeId("");
    }
    // Handle error if needed
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add Program
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Program</DialogTitle>
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

          <Select name="departmentId" disabled={!selectedCollegeId} required>
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

          <Input
            name="name"
            placeholder="Program Name (e.g. Regular)"
            required
            disabled={!selectedCollegeId}
          />
          <Input
            name="code"
            placeholder="Code (e.g. REG)"
            disabled={!selectedCollegeId}
          />

          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
