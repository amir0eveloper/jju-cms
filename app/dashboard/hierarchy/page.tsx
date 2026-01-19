import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollegeForm } from "@/components/admin/hierarchy/college-form";
import { DepartmentForm } from "@/components/admin/hierarchy/department-form";
import { ProgramForm } from "@/components/admin/hierarchy/program-form";
import { AcademicYearForm } from "@/components/admin/hierarchy/academic-year-form";
import { SemesterForm } from "@/components/admin/hierarchy/semester-form";
import { SectionForm } from "@/components/admin/hierarchy/section-form";
import { AssignCourseDialog } from "@/components/admin/hierarchy/assign-course-dialog"; // Import

export default async function HierarchyPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch all courses for the assignment dialog
  const allCourses = await db.course.findMany({
    select: { id: true, title: true, code: true },
    orderBy: { title: "asc" },
  });

  const colleges = await db.college.findMany({
    include: {
      departments: {
        include: {
          programs: {
            include: {
              academicYears: {
                include: {
                  semesters: {
                    include: {
                      sections: {
                        include: {
                          courses: { select: { id: true } },
                        },
                      },
                    },
                  },
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">
          Academic Hierarchy
        </h1>
        <p className="text-gray-500">
          Manage Colleges, Departments, Programs, Years, Semesters, and
          Sections.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Forms */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg">Add New Units</h2>
          <CollegeForm />
          <DepartmentForm colleges={colleges} />
          <ProgramForm colleges={colleges} />
          <AcademicYearForm colleges={colleges} />
          <SemesterForm colleges={colleges} />
          <SectionForm colleges={colleges} />
        </div>

        {/* Hierarchy Tree */}
        <div className="md:col-span-3 space-y-4">
          {colleges.length === 0 ? (
            <div className="text-center p-8 border rounded-lg text-gray-500 bg-white">
              No hierarchy defined yet. Start by creating a College.
            </div>
          ) : (
            colleges.map((college) => (
              <Card key={college.id} className="border-l-4 border-l-blue-500">
                <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl text-blue-800">
                      {college.name} ({college.code})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {college.departments.length === 0 ? (
                      <p className="text-sm text-gray-400 italic">
                        No departments yet.
                      </p>
                    ) : (
                      college.departments.map((dept) => (
                        <div key={dept.id} className="ml-2">
                          <h4 className="font-bold text-gray-800 mb-2 border-b pb-1">
                            {dept.name} ({dept.code})
                          </h4>

                          <div className="ml-4 space-y-3">
                            {dept.programs.length === 0 ? (
                              <p className="text-sm text-gray-400 italic">
                                No programs.
                              </p>
                            ) : (
                              dept.programs.map((prog) => (
                                <div
                                  key={prog.id}
                                  className="ml-2 border-l-2 pl-3 border-gray-100"
                                >
                                  <h5 className="font-semibold text-blue-600">
                                    {prog.name}
                                  </h5>
                                  <div className="ml-2 space-y-2 mt-2">
                                    {prog.academicYears.length === 0 ? (
                                      <p className="text-xs text-gray-400 italic">
                                        No years.
                                      </p>
                                    ) : (
                                      prog.academicYears.map((year) => (
                                        <div
                                          key={year.id}
                                          className="space-y-1"
                                        >
                                          <h6 className="text-sm font-medium text-gray-700">
                                            {year.name}
                                          </h6>
                                          <div className="ml-4 space-y-2">
                                            {year.semesters.map((sem) => (
                                              <div key={sem.id}>
                                                <div className="text-xs font-medium text-gray-500 mb-1">
                                                  {sem.name}
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                  {sem.sections.map((sec) => (
                                                    <div
                                                      key={sec.id}
                                                      className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100 flex items-center gap-2"
                                                    >
                                                      <span>{sec.name}</span>
                                                      <AssignCourseDialog
                                                        section={sec}
                                                        allCourses={allCourses}
                                                      />
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
