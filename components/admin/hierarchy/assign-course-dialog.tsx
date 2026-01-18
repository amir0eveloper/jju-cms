"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateSectionCourses } from "@/app/dashboard/hierarchy/actions";
import { useToast } from "@/components/ui/use-toast";
import { BookOpen, Loader2, Settings2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignCourseDialogProps {
  section: {
    id: string;
    name: string;
    courses: { id: string }[];
  };
  allCourses: { id: string; title: string; code: string }[];
}

export function AssignCourseDialog({
  section,
  allCourses,
}: AssignCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    section.courses.map((c) => c.id),
  );
  const { toast } = useToast();

  const handleToggle = (
    courseId: string,
    checked: boolean | "indeterminate",
  ) => {
    if (checked === true) {
      setSelectedCourseIds((prev) => [...prev, courseId]);
    } else {
      setSelectedCourseIds((prev) => prev.filter((id) => id !== courseId));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const res = await updateSectionCourses(section.id, selectedCourseIds);
    setLoading(false);

    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setOpen(false);
      toast({ title: "Saved", description: "Section courses updated." });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-500 hover:text-blue-600"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Courses to {section.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-500">
            Select courses that students in this section will automatically be
            enrolled in.
          </div>

          <ScrollArea className="h-75 border rounded-md p-4">
            <div className="space-y-3">
              {allCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={selectedCourseIds.includes(course.id)}
                    onCheckedChange={(checked) =>
                      handleToggle(course.id, checked)
                    }
                  />
                  <Label
                    htmlFor={`course-${course.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <span className="font-bold mr-2 text-blue-700">
                      {course.code}
                    </span>
                    {course.title}
                  </Label>
                </div>
              ))}
              {allCourses.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  No courses available. Create courses first.
                </div>
              )}
            </div>
          </ScrollArea>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
