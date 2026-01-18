"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/generated/prisma"; // Adjust import path
import { revalidatePath } from "next/cache";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalClasses = await db.course.count({
    where: { isPublished: true },
  });

  // Count schedules for today (Day of week: 0-6)
  const todayDay = today.getDay();
  const classesToday = await db.classSchedule.count({
    where: { dayOfWeek: todayDay },
  });

  const presentCount = await db.teacherAttendance.count({
    where: {
      date: { gte: today },
      status: "PRESENT",
    },
  });

  const issueCount = await db.teacherAttendance.count({
    where: {
      date: { gte: today },
      status: { in: ["ABSENT", "LATE"] },
    },
  });

  return {
    totalClasses,
    classesToday,
    presentCount,
    issueCount,
  };
}

export async function getLiveClasses() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Simple "Live" logic: Order by startTime
  // In real app, filter by currentTime between start/end
  const schedules = await db.classSchedule.findMany({
    where: { dayOfWeek },
    include: {
      course: {
        include: { teacher: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  // Map to simplified object
  return schedules.map((s) => ({
    id: s.id,
    courseName: s.course.title,
    courseCode: s.course.code,
    teacherName: s.course.teacher.name || s.course.teacher.username,
    room: s.room || "TBD",
    startTime: s.startTime,
    endTime: s.endTime,
    status: "UPCOMING" as const, // dynamic logic can be added here
  }));
}

// Fetch courses (optionally filtered if we had manager->dept link)
export async function getManagerCourses() {
  const session = await getServerSession(authOptions);
  if (
    session?.user?.role !== Role.CLASS_MANAGER &&
    session?.user?.role !== Role.ADMIN
  ) {
    return [];
  }

  // Fetch courses with teacher info
  return await db.course.findMany({
    include: {
      teacher: {
        select: { name: true, username: true },
      },
      department: {
        select: { name: true, code: true },
      },
      teacherAttendances: {
        orderBy: { date: "desc" },
        take: 1, // Get latest status
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// Mark a class as "Held" (Teacher Present) or Absent
export async function markClassAttendance(
  courseId: string,
  teacherId: string, // We need to know WHO the teacher is, usually from the course
  status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED",
  date: Date,
  notes?: string,
) {
  const session = await getServerSession(authOptions);
  if (
    !session ||
    (session.user.role !== Role.CLASS_MANAGER &&
      session.user.role !== Role.ADMIN)
  ) {
    return { error: "Unauthorized" };
  }

  try {
    await db.teacherAttendance.create({
      data: {
        date: date, // Assuming marking for "today" or specific date
        courseId,
        teacherId,
        status,
        notes,
        markedById: session.user.id,
      },
    });
    revalidatePath("/dashboard/class-manager");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to mark attendance" };
  }
}
