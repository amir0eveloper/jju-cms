"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createCollege } from "@/app/dashboard/hierarchy/actions";
import { Plus } from "lucide-react";

export function CollegeForm() {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createCollege(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full justify-start" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Add College
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add College</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-3">
          <Input name="name" placeholder="College Name" required />
          <Input name="code" placeholder="College Code (e.g. CNS)" required />
          <Button type="submit" className="w-full">
            Create
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
