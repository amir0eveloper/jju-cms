import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JoinCourseDialog } from "@/components/course/join-course-dialog";
import { BookOpen, Users, Calendar } from "lucide-react";

export default async function StudentBrowseCoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  // Fetch all published courses that the student is NOT enrolled in
  // Note: Prisma doesn't support "where NOT in related" very cleanly in one go without raw query or separate fetch
  // Easier to fetch published courses and filter in app or include enrollments to check

  const courses = await db.course.findMany({
    where: {
      isPublished: true,
      // Filter out courses where this user is enrolled
      enrollments: {
        none: {
          userId: session.user.id,
        },
      },
    },
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">
          Course Catalog
        </h1>
        <p className="text-gray-500">Browse and enroll in available courses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed text-gray-500">
            No new courses available for enrollment.
          </div>
        ) : (
          courses.map((course) => (
            <Card
              key={course.id}
              className="flex flex-col h-full hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl font-bold text-blue-900">
                      {course.code}
                    </CardTitle>
                    <p className="text-sm font-medium text-gray-600 mt-1">
                      {course.title}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {course.department && (
                    <Badge variant="secondary" className="text-xs">
                      {course.department.name}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <p className="text-sm text-gray-500 line-clamp-3">
                  {course.description || "No description provided."}
                </p>

                <div className="text-xs text-gray-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    <span>
                      Teacher: {course.teacher.name || course.teacher.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {course.semester
                        ? `${course.semester.academicYear.name} - ${course.semester.name}`
                        : "Flexible Schedule"}
                    </span>
                  </div>
                  {course.maxStudents && (
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          course._count.enrollments >= course.maxStudents
                            ? "text-red-500"
                            : ""
                        }
                      >
                        Capacity: {course._count.enrollments} /{" "}
                        {course.maxStudents}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t">
                <JoinCourseDialog
                  courseId={course.id}
                  courseTitle={course.title}
                  hasKey={!!course.enrollmentKey}
                  userId={session.user.id}
                />
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
