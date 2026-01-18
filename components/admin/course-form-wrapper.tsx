"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { CourseForm } from "@/components/admin/course-form";

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

export function CourseFormWrapper({
  teachers,
  departments,
}: {
  teachers: Teacher[];
  departments: Department[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </DialogTrigger>
      <CourseForm
        setOpen={setOpen}
        teachers={teachers}
        departments={departments}
      />
    </Dialog>
  );
}
