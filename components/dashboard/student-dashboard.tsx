import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, GraduationCap, PlayCircle, Layers } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // Fetch user to get sectionId
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { sectionId: true },
  });

  const sectionId = user?.sectionId;

  // Fetch courses that are EITHER directly enrolled OR linked to the student's section
  const coursesRaw = await db.course.findMany({
    where: {
      OR: [
        {
          enrollments: {
            some: {
              userId: session.user.id,
            },
          },
        },
        {
          sections: {
            some: {
              id: sectionId || "no-section-id-fallback", // If no section, this condition effectively fails safely
            },
          },
        },
      ],
    },
    include: {
      department: true,
      semester: {
        include: {
          academicYear: true,
        },
      },
      _count: {
        select: { modules: true },
      },
    },
    orderBy: {
      title: "asc",
    },
  });

  // Normalize structure to match existing UI (array of { course: ... })
  const enrollments = coursesRaw.map((course) => ({ course }));

  // Calculate Stats
  const enrolledCount = enrollments.length;
  const totalLearningModules = enrollments.reduce(
    (acc, curr) => acc + curr.course._count.modules,
    0,
  );

  // Quick Access: Determine "Latest" or just pick the first one with modules
  const activeCourse = enrollments.find(
    (e) => e.course._count.modules > 0,
  )?.course;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">
            Student Dashboard
          </h1>
          <p className="text-gray-500">
            Welcome back, {session.user.name || session.user.username}.
          </p>
        </div>
        <Link href="/dashboard/student/browse">
          <Button>Browse Courses</Button>
        </Link>
      </div>

      {/* Stats & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-none shadow-sm bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {enrolledCount}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">
              Learning Modules
            </CardTitle>
            <Layers className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {totalLearningModules}
            </div>
            <p className="text-xs text-purple-600 mt-1">Available materials</p>
          </CardContent>
        </Card>

        {activeCourse ? (
          <Link
            href={`/dashboard/courses/${activeCourse.id}`}
            className="block h-full group"
          >
            <Card className="h-full border-2 border-green-100 bg-green-50 hover:bg-green-100 transition-colors shadow-sm cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">
                  Resume Learning
                </CardTitle>
                <PlayCircle className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-900 line-clamp-1">
                  {activeCourse.code}
                </div>
                <p className="text-xs text-green-700 mt-1 line-clamp-1">
                  {activeCourse.title}
                </p>
              </CardContent>
            </Card>
          </Link>
        ) : (
          <Card className="border-none shadow-sm bg-gray-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                Quick Start
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400 mb-4">
                Enroll in a course to get started.
              </p>
              <Link href="/dashboard/student/browse">
                <Button variant="outline" size="sm" className="w-full">
                  Browse Catalog
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-blue-500">My Courses</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed text-gray-500">
              You are not enrolled in any courses yet.
            </div>
          ) : (
            enrollments.map(({ course }) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="block group"
              >
                <Card
                  className={`h-full transition-shadow hover:shadow-md flex flex-col relative overflow-hidden ${
                    course.endDate && new Date(course.endDate) < new Date()
                      ? "bg-gray-50 border-gray-200"
                      : "border-blue-100"
                  }`}
                >
                  {course.endDate && new Date(course.endDate) < new Date() && (
                    <div className="absolute top-0 right-0">
                      <Badge
                        variant="outline"
                        className="rounded-none rounded-bl-lg bg-gray-200 text-gray-600 border-none"
                      >
                        Ended
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle
                        className={`text-lg font-bold group-hover:text-blue-600 transition-colors ${
                          course.endDate &&
                          new Date(course.endDate) < new Date()
                            ? "text-gray-700"
                            : "text-blue-900"
                        }`}
                      >
                        {course.code}
                      </CardTitle>
                      {course.department && (
                        <div className="text-xs text-gray-500 font-medium">
                          {course.department.name}
                        </div>
                      )}
                    </div>
                    {/* <BookOpen className={`h-4 w-4 ${course.endDate && new Date(course.endDate) < new Date() ? 'text-gray-400' : 'text-blue-500'}`} /> */}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <div
                        className={`text-xl font-bold mb-2 line-clamp-2 ${
                          course.endDate &&
                          new Date(course.endDate) < new Date()
                            ? "text-gray-600"
                            : "text-gray-800"
                        }`}
                      >
                        {course.title}
                      </div>

                      {/* Advanced Details: Dates */}
                      {(course.startDate || course.endDate) && (
                        <div className="text-xs text-gray-500 mb-2 space-y-0.5">
                          {course.startDate && (
                            <div className="flex items-center gap-1">
                              <span className="">Start:</span>
                              {new Date(course.startDate).toLocaleDateString()}
                            </div>
                          )}
                          {course.endDate && (
                            <div className="flex items-center gap-1">
                              <span className="">End:</span>
                              {new Date(course.endDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      )}

                      {course.semester && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {course.semester.academicYear.name}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs font-normal"
                          >
                            {course.semester.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1 border-t pt-2">
                      <Layers className="h-3 w-3" />
                      {course._count.modules} Modules
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
