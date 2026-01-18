import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { GradebookTable } from "@/components/course/gradebook-table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // Ensure only teachers/admin can access
  if (session.user.role === Role.STUDENT) {
    redirect(`/dashboard/courses/${courseId}`);
  }

  const course = await db.course.findUnique({
    where: { id: courseId },
    include: {
      assignments: {
        orderBy: { dueDate: "asc" },
        include: {
          submissions: true, // Fetch ALL submissions for gradebook
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

  // Extract students from enrollments AND sections
  const enrolledStudentsMap = new Map();

  // 1. Direct Enrollments
  course.enrollments.forEach((e) => {
    enrolledStudentsMap.set(e.user.id, e.user);
  });

  // 2. Section Enrollments
  course.sections.forEach((section) => {
    section.students.forEach((student) => {
      enrolledStudentsMap.set(student.id, student);
    });
  });

  const enrolledStudents = Array.from(enrolledStudentsMap.values());
  // Sort by name
  enrolledStudents.sort((a, b) =>
    (a.name || a.username).localeCompare(b.name || b.username),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/courses/${course.id}`}>
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Course
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-blue-500">
            Gradebook
          </h1>
          <p className="text-gray-500">{course.title}</p>
        </div>
      </div>

      <GradebookTable course={course} students={enrolledStudents} />
    </div>
  );
}
