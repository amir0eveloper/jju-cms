"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileText,
  Users,
  GraduationCap,
  BarChart3,
  Building2,
  Calendar,
} from "lucide-react";

const reportTypes = [
  {
    id: "student-attendance",
    title: "Student Attendance Report",
    description: "Track student attendance across courses and sections",
    icon: Users,
    color: "text-blue-600",
    href: "/dashboard/reports/student-attendance",
  },
  {
    id: "teacher-attendance",
    title: "Teacher Attendance Report",
    description: "Monitor teacher coverage and class delivery",
    icon: GraduationCap,
    color: "text-purple-600",
    href: "/dashboard/reports/teacher-attendance",
  },
  {
    id: "enrollment",
    title: "Course Enrollment Report",
    description: "Analyze course enrollment trends and capacity",
    icon: BarChart3,
    color: "text-green-600",
    href: "/dashboard/reports/enrollment",
  },
  {
    id: "department",
    title: "Department Statistics",
    description: "Comprehensive department metrics and analytics",
    icon: Building2,
    color: "text-orange-600",
    href: "/dashboard/reports/department",
  },
  {
    id: "schedule",
    title: "Class Schedule Report",
    description: "View and analyze class timetables",
    icon: Calendar,
    color: "text-pink-600",
    href: "/dashboard/reports/schedule",
  },
];

export function ReportTypeCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reportTypes.map((report) => (
        <Card key={report.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-slate-100 ${report.color}`}>
                <report.icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-lg">{report.title}</CardTitle>
              </div>
            </div>
            <CardDescription>{report.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={report.href}>
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
