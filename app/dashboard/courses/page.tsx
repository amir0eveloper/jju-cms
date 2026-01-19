import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CourseFormWrapper } from "@/components/admin/course-form-wrapper";
import { CoursesTable } from "@/components/admin/courses/courses-table";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const courses = await db.course.findMany({
    include: {
      teacher: true,
      department: true,
      semester: {
        include: {
          academicYear: true,
        },
      },
      _count: {
        select: { enrollments: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const teachers = await db.user.findMany({
    where: {
      role: Role.TEACHER,
    },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  const departments = await db.department.findMany({
    include: {
      programs: {
        include: {
          academicYears: {
            include: {
              semesters: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500 ">
            Courses
          </h1>
          <p className="text-gray-500">Manage courses and assign teachers.</p>
        </div>
        <CourseFormWrapper teachers={teachers} departments={departments} />
      </div>

      <CoursesTable
        courses={courses}
        teachers={teachers}
        departments={departments}
      />
    </div>
  );
}
