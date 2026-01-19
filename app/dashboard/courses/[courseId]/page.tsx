import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleForm } from "@/components/course/module-form";
import { EnrollmentManager } from "@/components/course/enrollment-manager";
import { StudentList } from "@/components/course/student-list";
import { deleteModule } from "@/app/dashboard/courses/module-actions";
import { Trash2, FileText } from "lucide-react";
import { AssignmentForm } from "@/components/course/assignment-form";
import { AssignmentList } from "@/components/course/assignment-list";
import Link from "next/link";

export default async function CourseParams({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        include: { attachments: true },
        orderBy: { createdAt: "asc" },
      },
      assignments: {
        orderBy: { dueDate: "asc" },
        include: {
          submissions: {
            where: {
              studentId: session.user.id, // Filter submissions for the current user (if student)
            },
          },
          _count: {
            select: { submissions: true },
          },
        },
      },
      enrollments: {
        include: {
          user: true,
        },
      },
      sections: {
        include: {
          students: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Combine unique students count for display
  const uniqueStudentIds = new Set(course.enrollments.map((e) => e.userId));
  course.sections.forEach((s) =>
    s.students.forEach((st) => uniqueStudentIds.add(st.id)),
  );
  const totalStudentCount = uniqueStudentIds.size;

  const isTeacher =
    session.user.role === Role.TEACHER || session.user.role === Role.ADMIN;

  // Merge students for the list
  const enrolledStudentsMap = new Map();
  course.enrollments.forEach((e) => enrolledStudentsMap.set(e.user.id, e.user));
  course.sections.forEach((s) =>
    s.students.forEach((st) => enrolledStudentsMap.set(st.id, st)),
  );
  const allEnrolledStudents = Array.from(enrolledStudentsMap.values());

  // Fetch students not enrolled for enrollment manager
  // This needs to exclude SECTION students too now.
  // The query below uses `NOT: { coursesEnrolled: ... }`.
  // It should also check `NOT: { section: { courses: { some: { id: courseId } } } }`.
  // This is getting complex to optimize in a single query.
  // For now, simpler to fetch candidates and filter in JS if list isn't huge, or refine query.
  // Let's refine the query.
  // Fetch students not enrolled for enrollment manager
  const whereClause: any = {
    role: Role.STUDENT,
    AND: [
      { coursesEnrolled: { none: { courseId: courseId } } },
      { section: { courses: { none: { id: courseId } } } },
    ],
  };

  // If filter requested: Only show students in the same semester as the course
  if (course.semesterId) {
    whereClause.section = { semesterId: course.semesterId };
  }

  const students = await db.user.findMany({
    where: whereClause,
    select: { id: true, name: true, username: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <span>{course.code}</span>
            <span>•</span>
            <span>{totalStudentCount} Students Enrolled</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">
            {course.title}
          </h1>
          <p className="text-gray-600 mt-2 max-w-2xl">{course.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {isTeacher && (
            <Link href={`/dashboard/courses/${course.id}/gradebook`}>
              <Button variant="outline" className="gap-2">
                Gradebook
              </Button>
            </Link>
          )}
          {isTeacher && (
            <Link href={`/dashboard/courses/${course.id}/attendance`}>
              <Button variant="outline" className="gap-2">
                Attendance
              </Button>
            </Link>
          )}
          {isTeacher && (
            <EnrollmentManager courseId={course.id} students={students} />
          )}
          {isTeacher && <ModuleForm courseId={course.id} />}
          {isTeacher && <AssignmentForm courseId={course.id} />}
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
          {/* Main Content: Modules */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-500">
                Learning Modules
              </h2>
            </div>
            {course.modules.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed text-gray-500">
                No modules added yet.
              </div>
            ) : (
              course.modules.map((module) => (
                <Card key={module.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-semibold text-blue-800">
                      {module.title}
                    </CardTitle>
                    {isTeacher && (
                      <form
                        action={async () => {
                          "use server";
                          await deleteModule(course.id, module.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                      {module.content}
                    </div>
                    {module.attachments.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm font-semibold mb-2 text-gray-700">
                          Attachments:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {module.attachments.map((file) => (
                            <a
                              key={file.id}
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm text-blue-600 hover:underline transition-colors"
                            >
                              <FileText className="h-4 w-4" />
                              {file.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Sidebar: Assignments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-500">Assignments</h2>
            </div>
            <AssignmentList
              assignments={course.assignments}
              isTeacher={isTeacher}
              courseId={course.id}
              studentId={session.user.id}
            />
          </div>
        </div>
      </div>

      {isTeacher && (
        <StudentList
          courseId={course.id}
          enrolledStudents={allEnrolledStudents}
        />
      )}
    </div>
  );
}
