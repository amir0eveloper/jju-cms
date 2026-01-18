"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/admin/user-form";

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
  code: string;
  programs: Program[];
}

export function UserFormWrapper({
  departments,
}: {
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </DialogTrigger>
      <UserForm setOpen={setOpen} departments={departments} />
    </Dialog>
  );
}
