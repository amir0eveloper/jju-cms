import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default async function TeacherDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  const courses = await db.course.findMany({
    where: {
      teacherId: session.user.id,
    },
    include: {
      department: true,
      semester: {
        include: {
          academicYear: true,
        },
      },
      _count: {
        select: {
          modules: true,
          enrollments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Calculate Stats
  const totalCourses = courses.length;
  const totalStudents = courses.reduce(
    (acc, course) => acc + course._count.enrollments,
    0,
  );
  const totalModules = courses.reduce(
    (acc, course) => acc + course._count.modules,
    0,
  );

  const stats = [
    {
      title: "Active Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Content Modules",
      value: totalModules,
      icon: FileText,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">
          Teacher Dashboard
        </h1>
        <p className="text-gray-500">Overview of your academic activities.</p>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-500">Your Courses</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed text-gray-500">
              You haven't been assigned any courses yet. Contact an
              administrator.
            </div>
          ) : (
            courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/courses/${course.id}`}
                className="block group"
              >
                <Card className="h-full transition-shadow hover:shadow-md border-blue-100 flex flex-col relative overflow-hidden">
                  {!course.isPublished && (
                    <div className="absolute top-0 right-0">
                      <Badge
                        variant="destructive"
                        className="rounded-none rounded-bl-lg"
                      >
                        Draft
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-lg font-bold text-blue-900 group-hover:text-blue-600 transition-colors">
                        {course.code}
                      </CardTitle>
                      {course.department && (
                        <div className="text-xs text-gray-500 font-medium">
                          {course.department.name}
                        </div>
                      )}
                    </div>
                    {/* <BookOpen className="h-4 w-4 text-blue-500" /> */}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                        {course.title}
                      </div>

                      {/* Advanced Details: Dates */}
                      {(course.startDate || course.endDate) && (
                        <div className="text-xs text-gray-600 mb-2 space-y-0.5">
                          {course.startDate && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">Start:</span>
                              {new Date(course.startDate).toLocaleDateString()}
                            </div>
                          )}
                          {course.endDate && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold">End:</span>
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

                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 border-t pt-2">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {course._count.modules}{" "}
                        Modules
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />{" "}
                        {course._count.enrollments} Students
                      </span>
                    </div>
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
