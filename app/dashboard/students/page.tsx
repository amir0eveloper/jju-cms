import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UsersTable } from "@/components/admin/students/users-table";
import { StudentFilters } from "@/components/admin/students/student-filters";
import { ImportStudentsDialog } from "@/components/admin/students/import-students-dialog";
// import { AddStudentDialog } from "@/components/admin/students/add-student-dialog";
import { Button } from "@/components/ui/button";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch Hierarchy Data for Filters
  const departments = await db.department.findMany({
    include: {
      programs: {
        include: {
          academicYears: {
            include: {
              semesters: {
                include: {
                  sections: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">
            All Students
          </h1>
          <p className="text-gray-500">
            Manage student records, filter by hierarchy, and import/export data.
          </p>
        </div>
        <div className="flex gap-2">
          <ImportStudentsDialog />
          <Button>Add Student</Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <StudentFilters departments={departments} />
        <UsersTable searchParams={searchParams} />
      </div>
    </div>
  );
}
