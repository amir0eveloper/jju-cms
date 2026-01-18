"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { enrollStudent } from "@/app/dashboard/courses/enrollment-actions";
import { Lock, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

interface JoinCourseDialogProps {
  courseId: string;
  courseTitle: string;
  hasKey: boolean;
  userId: string;
}

export function JoinCourseDialog({
  courseId,
  courseTitle,
  hasKey,
  userId,
}: JoinCourseDialogProps) {
  const [open, setOpen] = useState(false);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleEnroll = async () => {
    setLoading(true);
    setError(null);

    const res = await enrollStudent(courseId, userId, hasKey ? key : undefined);

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      toast({
        title: "Enrolled Successfully",
        description: `You have joined ${courseTitle}`,
      });
      router.refresh();
      router.push("/dashboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2" variant={hasKey ? "outline" : "default"}>
          {hasKey ? <Lock className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
          {hasKey ? "Join (Key Required)" : "Join Course"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join {courseTitle}</DialogTitle>
          <DialogDescription>
            {hasKey
              ? "This course requires an enrollment key provided by your instructor."
              : "Are you sure you want to enroll in this course?"}
          </DialogDescription>
        </DialogHeader>

        {hasKey && (
          <div className="space-y-2 py-2">
            <Label htmlFor="key">Enrollment Key</Label>
            <Input
              id="key"
              type="password"
              placeholder="Enter key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEnroll} disabled={loading || (hasKey && !key)}>
            {loading ? "Joining..." : "Join Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
