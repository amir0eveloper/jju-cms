"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Student Attendance Report
export async function generateStudentAttendanceReport(filters: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  programId?: string;
  semesterId?: string;
  sectionId?: string;
  studentId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const whereClause: any = {};

    // Apply filters
    if (filters.studentId) {
      whereClause.studentId = filters.studentId;
    }
    if (filters.startDate || filters.endDate) {
      whereClause.session = {
        date: {
          ...(filters.startDate && { gte: new Date(filters.startDate) }),
          ...(filters.endDate && { lte: new Date(filters.endDate) }),
        },
      };
    }

    const attendanceRecords = await db.attendanceRecord.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            username: true,
            section: {
              select: {
                name: true,
                semester: {
                  select: {
                    name: true,
                    academicYear: {
                      select: {
                        name: true,
                        program: {
                          select: {
                            name: true,
                            department: {
                              select: {
                                name: true,
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
        },
        session: {
          select: {
            date: true,
            course: {
              select: {
                title: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 1000, // Limit for performance
    });

    // Calculate statistics
    const totalRecords = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (r) => r.status === "PRESENT",
    ).length;
    const absentCount = attendanceRecords.filter(
      (r) => r.status === "ABSENT",
    ).length;
    const lateCount = attendanceRecords.filter(
      (r) => r.status === "LATE",
    ).length;

    const attendanceRate =
      totalRecords > 0 ? ((presentCount + lateCount) / totalRecords) * 100 : 0;

    return {
      records: attendanceRecords,
      statistics: {
        total: totalRecords,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        attendanceRate: attendanceRate.toFixed(2),
      },
    };
  } catch (error) {
    console.error("Failed to generate student attendance report:", error);
    return { error: "Failed to generate report" };
  }
}

// Teacher Attendance Report
export async function generateTeacherAttendanceReport(filters: {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  courseId?: string;
  teacherId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const whereClause: any = {};

    if (filters.teacherId) {
      whereClause.teacherId = filters.teacherId;
    }
    if (filters.courseId) {
      whereClause.courseId = filters.courseId;
    }
    if (filters.startDate || filters.endDate) {
      whereClause.date = {
        ...(filters.startDate && { gte: new Date(filters.startDate) }),
        ...(filters.endDate && { lte: new Date(filters.endDate) }),
      };
    }

    const teacherRecords = await db.teacherAttendance.findMany({
      where: whereClause,
      include: {
        teacher: {
          select: {
            id: true,
            name: true,
            username: true,
            department: {
              select: {
                name: true,
              },
            },
          },
        },
        course: {
          select: {
            title: true,
            code: true,
          },
        },
        markedBy: {
          select: {
            name: true,
            username: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
      take: 1000,
    });

    // Calculate statistics
    const totalClasses = teacherRecords.length;
    const held = teacherRecords.filter((r) => r.status === "PRESENT").length;
    const absent = teacherRecords.filter((r) => r.status === "ABSENT").length;
    const coverageRate = totalClasses > 0 ? (held / totalClasses) * 100 : 0;

    return {
      records: teacherRecords,
      statistics: {
        totalClasses,
        held,
        absent,
        coverageRate: coverageRate.toFixed(2),
      },
    };
  } catch (error) {
    console.error("Failed to generate teacher attendance report:", error);
    return { error: "Failed to generate report" };
  }
}

// Course Enrollment Report
export async function generateEnrollmentReport(filters: {
  semesterId?: string;
  departmentId?: string;
  programId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const whereClause: any = {};

    if (filters.semesterId) {
      whereClause.semesterId = filters.semesterId;
    }
    if (filters.departmentId) {
      whereClause.departmentId = filters.departmentId;
    }

    const courses = await db.course.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            enrollments: true,
          },
        },
        teacher: {
          select: {
            name: true,
            username: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        semester: {
          select: {
            name: true,
            academicYear: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    const totalCourses = courses.length;
    const totalEnrollments = courses.reduce(
      (sum, course) => sum + course._count.enrollments,
      0,
    );
    const avgEnrollment =
      totalCourses > 0 ? totalEnrollments / totalCourses : 0;

    return {
      courses,
      statistics: {
        totalCourses,
        totalEnrollments,
        averageEnrollment: avgEnrollment.toFixed(2),
      },
    };
  } catch (error) {
    console.error("Failed to generate enrollment report:", error);
    return { error: "Failed to generate report" };
  }
}

// Department Statistics Report
export async function generateDepartmentReport(filters: {
  departmentId?: string;
  academicYearId?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return { error: "Unauthorized" };
  }

  try {
    const departments = await db.department.findMany({
      where: filters.departmentId ? { id: filters.departmentId } : {},
      include: {
        _count: {
          select: {
            students: true,
            courses: true,
          },
        },
        programs: {
          include: {
            _count: {
              select: {
                academicYears: true,
              },
            },
          },
        },
        college: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      departments,
      totalDepartments: departments.length,
    };
  } catch (error) {
    console.error("Failed to generate department report:", error);
    return { error: "Failed to generate report" };
  }
}

// Save Report Configuration
export async function saveReportConfig(data: {
  name: string;
  description?: string;
  type: string;
  parameters: any;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const savedReport = await db.savedReport.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type as any,
        parameters: data.parameters,
        userId: session.user.id,
      },
    });

    return { success: true, report: savedReport };
  } catch (error) {
    console.error("Failed to save report:", error);
    return { error: "Failed to save report" };
  }
}

// Get Saved Reports
export async function getSavedReports() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    const reports = await db.savedReport.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { reports };
  } catch (error) {
    console.error("Failed to get saved reports:", error);
    return { error: "Failed to fetch reports" };
  }
}

// Delete Saved Report
export async function deleteSavedReport(reportId: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { error: "Unauthorized" };
  }

  try {
    await db.savedReport.delete({
      where: {
        id: reportId,
        userId: session.user.id, // Ensure user owns the report
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to delete report:", error);
    return { error: "Failed to delete report" };
  }
}
