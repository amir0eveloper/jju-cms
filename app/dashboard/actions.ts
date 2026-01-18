"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null;
  }

  try {
    // Fetch all statistics in parallel
    const [
      totalUsers,
      usersByRole,
      totalCourses,
      publishedCourses,
      totalStudents,
      todayAttendance,
      colleges,
      departments,
      programs,
    ] = await Promise.all([
      db.user.count(),
      db.user.groupBy({
        by: ["role"],
        _count: {
          _all: true,
        },
      }),
      db.course.count(),
      db.course.count({ where: { isPublished: true } }),
      db.user.count({ where: { role: "STUDENT" } }),
      db.teacherAttendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.college.count(),
      db.department.count(),
      db.program.count(),
    ]);

    // Transform role counts
    const roleCounts = usersByRole.reduce(
      (acc, item) => {
        acc[item.role] = item._count._all;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      totalUsers,
      roleCounts,
      totalCourses,
      publishedCourses,
      draftCourses: totalCourses - publishedCourses,
      totalStudents,
      todayAttendance,
      colleges,
      departments,
      programs,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return null;
  }
}

export async function getEnrollmentChartData() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return [];
  }

  try {
    const departments = await db.department.findMany({
      include: {
        programs: {
          include: {
            academicYears: {
              include: {
                semesters: {
                  include: {
                    sections: {
                      include: {
                        _count: {
                          select: {
                            students: true,
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
      take: 10, // Limit to top 10 departments
    });

    return departments.map((dept) => {
      const studentCount = dept.programs.reduce((total, program) => {
        const programCount = program.academicYears.reduce((accYear, year) => {
          const yearCount = year.semesters.reduce((accSem, sem) => {
            const semCount = sem.sections.reduce(
              (accSec, sec) => accSec + sec._count.students,
              0,
            );
            return accSem + semCount;
          }, 0);
          return accYear + yearCount;
        }, 0);
        return total + programCount;
      }, 0);

      return {
        department: dept.code || dept.name,
        students: studentCount,
      };
    });
  } catch (error) {
    console.error("Failed to fetch enrollment data:", error);
    return [];
  }
}

export async function getAttendanceTrends() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return [];
  }

  try {
    // Get last 7 days of attendance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const attendanceRecords = await db.teacherAttendance.groupBy({
      by: ["date", "status"],
      where: {
        date: {
          gte: sevenDaysAgo,
        },
      },
      _count: {
        _all: true,
      },
    });

    // Group by date
    const dateMap = new Map<string, { present: number; absent: number }>();

    attendanceRecords.forEach((record) => {
      const dateKey = record.date.toISOString().split("T")[0];
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, { present: 0, absent: 0 });
      }
      const entry = dateMap.get(dateKey)!;
      if (record.status === "PRESENT") {
        entry.present += record._count._all;
      } else if (record.status === "ABSENT") {
        entry.absent += record._count._all;
      }
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        present: data.present,
        absent: data.absent,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Failed to fetch attendance trends:", error);
    return [];
  }
}

export async function getRecentActivity() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return { recentUsers: [], recentCourses: [] };
  }

  try {
    const [recentUsers, recentCourses] = await Promise.all([
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
          createdAt: true,
        },
      }),
      db.course.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          code: true,
          createdAt: true,
          teacher: {
            select: {
              name: true,
              username: true,
            },
          },
        },
      }),
    ]);

    return { recentUsers, recentCourses };
  } catch (error) {
    console.error("Failed to fetch recent activity:", error);
    return { recentUsers: [], recentCourses: [] };
  }
}
