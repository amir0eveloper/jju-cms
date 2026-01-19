import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, Building2, GraduationCap } from "lucide-react";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export async function AdminStats() {
  const [studentCount, teacherCount, courseCount, deptCount] =
    await Promise.all([
      db.user.count({ where: { role: Role.STUDENT } }),
      db.user.count({ where: { role: Role.TEACHER } }),
      db.course.count(),
      db.department.count(),
    ]);

  const stats = [
    {
      title: "Total Students",
      value: studentCount,
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "Total Teachers",
      value: teacherCount,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      title: "Active Courses",
      value: courseCount,
      icon: BookOpen,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "Departments",
      value: deptCount,
      icon: Building2,
      color: "text-orange-600",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="border-none shadow-md">
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
  );
}
