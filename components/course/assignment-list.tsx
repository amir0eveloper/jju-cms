"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  deleteAssignment,
  submitAssignment,
} from "@/app/dashboard/courses/assignment-actions";
import { Trash2, FileText, Upload, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// Helper for submission dialog
function SubmitDialog({
  assignmentId,
  studentId,
  courseId,
  submissionType,
}: {
  assignmentId: string;
  studentId: string;
  courseId: string;
  submissionType: "ONLINE_TEXT" | "FILE_UPLOAD" | "BOTH" | "NONE";
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const content = formData.get("content") as string;
    const file = formData.get("file") as File;

    // Basic validation based on type
    if (submissionType === "ONLINE_TEXT" && !content) {
      toast({
        variant: "destructive",
        title: "Wait",
        description: "Please enter your answer.",
      });
      setLoading(false);
      return;
    }
    if (submissionType === "FILE_UPLOAD" && (!file || file.size === 0)) {
      toast({
        variant: "destructive",
        title: "Wait",
        description: "Please select a file to upload.",
      });
      setLoading(false);
      return;
    }

    const res = await submitAssignment(assignmentId, studentId, formData);
    setLoading(false);

    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setOpen(false);
      toast({
        title: "Submitted",
        description: "Your assignment has been submitted.",
      });
    }
  };

  if (submissionType === "NONE") return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <Upload className="h-4 w-4" /> Submit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Assignment</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          {(submissionType === "ONLINE_TEXT" || submissionType === "BOTH") && (
            <div className="space-y-2">
              <Label>Answer / Content</Label>
              <Textarea
                name="content"
                required={submissionType === "ONLINE_TEXT"}
                placeholder="Type your answer here..."
                className="min-h-37.5"
              />
            </div>
          )}

          {(submissionType === "FILE_UPLOAD" || submissionType === "BOTH") && (
            <div className="space-y-2">
              <Label>
                File Upload {submissionType === "BOTH" && "(Optional)"}
              </Label>
              <Input
                type="file"
                name="file"
                required={submissionType === "FILE_UPLOAD"}
              />
              <p className="text-xs text-gray-500">
                Upload your document (PDF, Docx, etc).
              </p>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AssignmentListProps {
  assignments: any[];
  isTeacher: boolean;
  courseId: string;
  studentId?: string;
}

export function AssignmentList({
  assignments,
  isTeacher,
  courseId,
  studentId,
}: AssignmentListProps) {
  if (assignments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed text-gray-500">
        No assignments created yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => {
        const submission = assignment.submissions[0]; // Assuming filtered by user if student
        const isSubmitted = !!submission;
        const isGraded =
          submission?.grade !== null && submission?.grade !== undefined;

        return (
          <Card key={assignment.id}>
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-800">
                  {assignment.title}
                </CardTitle>
                {assignment.dueDate && (
                  <div className="text-xs text-red-500 font-medium mt-1">
                    Due: {new Date(assignment.dueDate).toLocaleString()}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isTeacher ? (
                  <form
                    action={async () => {
                      if (confirm("Delete this assignment?")) {
                        await deleteAssignment(courseId, assignment.id);
                      }
                    }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                ) : (
                  <>
                    {isGraded ? (
                      <Badge variant="default" className="bg-green-600">
                        Grade: {submission.grade}/{assignment.maxScore}
                      </Badge>
                    ) : isSubmitted ? (
                      <Badge variant="secondary">
                        <CheckCircle className="h-3 w-3 mr-1" /> Submitted
                      </Badge>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 whitespace-pre-wrap mb-4">
                {assignment.description}
              </p>

              {!isTeacher && studentId && (
                <div className="flex justify-end border-t pt-4">
                  {isSubmitted ? (
                    <div className="text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(submission.submittedAt).toLocaleDateString()}
                      {/* Allow re-submission? Maybe later */}
                      <div className="mt-2">
                        <SubmitDialog
                          assignmentId={assignment.id}
                          studentId={studentId}
                          courseId={courseId}
                          submissionType={assignment.submissionType}
                        />
                      </div>
                    </div>
                  ) : (
                    <SubmitDialog
                      assignmentId={assignment.id}
                      studentId={studentId}
                      courseId={courseId}
                      submissionType={assignment.submissionType}
                    />
                  )}
                </div>
              )}

              {isTeacher && (
                <div className="text-xs text-gray-500">
                  Total Submissions: {assignment._count?.submissions || 0}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
