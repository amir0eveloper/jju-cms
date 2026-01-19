import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import { AttendanceSheet } from "@/components/course/attendance-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  createAttendanceSession,
  deleteAttendanceSession,
} from "@/app/dashboard/courses/attendance-actions";

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ sessionId?: string }>;
}) {
  const { courseId } = await params;
  const { sessionId } = await searchParams; // To switch views
  const session = await getServerSession(authOptions);

  if (!session) redirect("/");

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      attendanceSessions: {
        orderBy: { date: "desc" },
      },
      enrollments: {
        include: { user: true },
        orderBy: { user: { name: "asc" } }, // Alphabetical order
      },
      sections: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!course) notFound();

  // Filter students (Merge Direct + Section)
  const studentsMap = new Map();
  course.enrollments.forEach((e) => studentsMap.set(e.user.id, e.user));
  course.sections.forEach((s) =>
    s.students.forEach((st) => studentsMap.set(st.id, st)),
  );
  const students = Array.from(studentsMap.values()).sort((a, b) =>
    (a.name || a.username).localeCompare(b.name || b.username),
  );

  // If a specific session is selected, fetch its details (records)
  let activeSession = null;
  if (sessionId) {
    activeSession = await db.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { records: true },
    });
  } else if (course.attendanceSessions.length > 0) {
    // Default to latest
    activeSession = await db.attendanceSession.findUnique({
      where: { id: course.attendanceSessions[0].id },
      include: { records: true },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/dashboard/courses/${course.id}`}>
            <Button variant="ghost" size="sm">
              <ChevronLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-blue-500">
            Attendance
          </h1>
        </div>

        {/* Create Session Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Attendance Session</DialogTitle>
            </DialogHeader>
            <form
              action={async (formData) => {
                "use server";
                await createAttendanceSession(course.id, formData);
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Session Title (Optional)
                </label>
                <Input name="title" placeholder="Lecture 1" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input
                  name="date"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().split("T")[0]}
                />
              </div>
              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-[250px_1fr] gap-6">
        {/* Sidebar: Session List */}
        <div className="border rounded-md bg-white p-2 space-y-1 h-fit">
          <div className="px-2 py-1.5 text-sm font-semibold text-blue-500">
            All Sessions
          </div>
          {course.attendanceSessions.length === 0 && (
            <div className="px-2 py-4 text-sm text-gray-500 text-center">
              No sessions yet.
            </div>
          )}
          {course.attendanceSessions.map((s) => (
            <Link
              key={s.id}
              href={`/dashboard/courses/${course.id}/attendance?sessionId=${s.id}`}
              className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                activeSession?.id === s.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{new Date(s.date).toLocaleDateString()}</span>
                {/* Optionally add delete here */}
              </div>
              {s.title && (
                <div className="text-xs opacity-70 truncate">{s.title}</div>
              )}
            </Link>
          ))}
        </div>

        {/* Main: Attendance Sheet */}
        <div>
          {activeSession ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-blue-500">
                  {activeSession.title ||
                    new Date(activeSession.date).toDateString()}
                </h2>
                <form
                  action={async () => {
                    "use server";
                    await deleteAttendanceSession(course.id, activeSession.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    Delete Session
                  </Button>
                </form>
              </div>
              <AttendanceSheet session={activeSession} students={students} />
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-gray-500">
              Select or create a session to take attendance.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
