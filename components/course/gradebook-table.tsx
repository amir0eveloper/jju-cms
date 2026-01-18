"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmission } from "@/app/dashboard/courses/assignment-actions";
import { useToast } from "@/components/ui/use-toast";

interface GradeDialogProps {
  submissionId: string;
  currentGrade?: number;
  currentFeedback?: string;
  assignmentMaxScore: number;
  studentName: string;
  onGraded: () => void;
  content?: string;
  fileUrl?: string;
}

function GradeDialog({
  submissionId,
  currentGrade,
  currentFeedback,
  assignmentMaxScore,
  studentName,
  onGraded,
  content,
  fileUrl,
}: GradeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const gradeStr = formData.get("grade") as string;
    const feedback = formData.get("feedback") as string;
    const grade = parseInt(gradeStr);

    const res = await gradeSubmission(submissionId, grade, feedback);
    setLoading(false);

    if (res.error) {
      toast({ variant: "destructive", title: "Error", description: res.error });
    } else {
      setOpen(false);
      toast({ title: "Graded", description: "Grade saved successfully." });
      onGraded(); // Trigger refresh if possible (in this client component context requires router refresh)
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-6 text-xs">
          Grade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Grade {studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Submission Viewer */}
          <div className="bg-gray-50 p-4 rounded-md border text-sm">
            <h4 className="font-semibold mb-2">Submission:</h4>
            {fileUrl && (
              <div className="mb-2">
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download/View File
                </a>
              </div>
            )}
            {content && (
              <div className="whitespace-pre-wrap text-gray-700 bg-white p-2 rounded border">
                {content}
              </div>
            )}
            {!content && !fileUrl && (
              <span className="text-gray-400 italic">
                No content submitted.
              </span>
            )}
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade (Max: {assignmentMaxScore})</Label>
                <Input
                  name="grade"
                  type="number"
                  defaultValue={currentGrade}
                  max={assignmentMaxScore}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Feedback</Label>
              <Textarea
                name="feedback"
                defaultValue={currentFeedback}
                placeholder="Great work..."
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving..." : "Save Grade"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// No-op check
export function GradebookTable({
  course,
  students,
}: {
  course: any;
  students: any[];
}) {
  // In a real app, this data structure might need optimization
  // We want rows = students, cols = assignments

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-50">Student</TableHead>
            {course.assignments.map((assignment: any) => (
              <TableHead key={assignment.id} className="min-w-37.5">
                {assignment.title}
                <div className="text-xs text-gray-500 font-normal">
                  Max: {assignment.maxScore}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.name || student.username}
                <div className="text-xs text-gray-500">{student.username}</div>
              </TableCell>
              {course.assignments.map((assignment: any) => {
                // Find submission for this student and assignment
                const submission = assignment.submissions.find(
                  (s: any) => s.studentId === student.id,
                );

                return (
                  <TableCell key={assignment.id}>
                    {submission ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {submission.grade !== null ? (
                            <Badge variant="default" className="bg-green-600">
                              {submission.grade}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Submitted</Badge>
                          )}
                          {/* Popover to view content and grade */}
                          <GradeDialog
                            submissionId={submission.id}
                            currentGrade={submission.grade}
                            currentFeedback={submission.feedback}
                            assignmentMaxScore={assignment.maxScore}
                            studentName={student.name || student.username}
                            onGraded={() => window.location.reload()} // Simple reload to refresh data
                            content={submission.content}
                            fileUrl={submission.fileUrl}
                          />
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-37.5">
                          {submission.content || "File Upload"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-sm">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
