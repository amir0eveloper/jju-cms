"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, CheckCircle, Building2 } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalUsers: number;
    roleCounts: Record<string, number>;
    totalCourses: number;
    publishedCourses: number;
    draftCourses: number;
    todayAttendance: number;
    colleges: number;
    departments: number;
    programs: number;
  };
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Users Card - Blue Theme */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-900">
            Total Users
          </CardTitle>
          <div className="p-2 bg-blue-500 rounded-lg">
            <Users className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-700">
            {stats.totalUsers}
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-600">Admins:</span>
              <span className="font-semibold text-blue-800">
                {stats.roleCounts.ADMIN || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Teachers:</span>
              <span className="font-semibold text-blue-800">
                {stats.roleCounts.TEACHER || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Students:</span>
              <span className="font-semibold text-blue-800">
                {stats.roleCounts.STUDENT || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Managers:</span>
              <span className="font-semibold text-blue-800">
                {stats.roleCounts.CLASS_MANAGER || 0}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Card - Purple Theme */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-900">
            Courses
          </CardTitle>
          <div className="p-2 bg-purple-500 rounded-lg">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-700">
            {stats.totalCourses}
          </div>
          <div className="mt-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <p className="text-xs text-purple-700">
                <span className="font-semibold">{stats.publishedCourses}</span>{" "}
                Published
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <p className="text-xs text-purple-700">
                <span className="font-semibold">{stats.draftCourses}</span>{" "}
                Draft
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Card - Green Theme */}
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-900">
            Today's Attendance
          </CardTitle>
          <div className="p-2 bg-green-500 rounded-lg">
            <CheckCircle className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700">
            {stats.todayAttendance}
          </div>
          <p className="text-xs text-green-600 mt-3 font-medium">
            Teachers marked present
          </p>
        </CardContent>
      </Card>

      {/* Academic Structure Card - Orange Theme */}
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-900">
            Academic Structure
          </CardTitle>
          <div className="p-2 bg-orange-500 rounded-lg">
            <Building2 className="h-4 w-4 text-white" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-700">
            {stats.departments}
          </div>
          <div className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-orange-600">Colleges:</span>
              <span className="font-semibold text-orange-800">
                {stats.colleges}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">Programs:</span>
              <span className="font-semibold text-orange-800">
                {stats.programs}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
