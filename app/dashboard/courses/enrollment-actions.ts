"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function enrollStudent(
  courseId: string,
  userId: string,
  enrollmentKey?: string,
) {
  try {
    // 1. Fetch Course Rules
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) return { error: "Course not found" };
    if (!course.isPublished)
      return { error: "Course is not accepting enrollments" };

    // 2. Check Capacity
    if (course.maxStudents && course._count.enrollments >= course.maxStudents) {
      return { error: "Course is full" };
    }

    // 3. Check Enrollment Key
    if (course.enrollmentKey) {
      if (!enrollmentKey || enrollmentKey !== course.enrollmentKey) {
        return { error: "Invalid enrollment key" };
      }
    }

    // 4. Check if already enrolled
    const existing = await db.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return { error: "Student is already enrolled in this course" };
    }

    await db.enrollment.create({
      data: {
        userId,
        courseId,
      },
    });

    revalidatePath("/dashboard/courses");
    revalidatePath("/dashboard/student/browse");
    return { success: true };
  } catch (error) {
    console.error("Failed to enroll student:", error);
    return { error: "Failed to enroll student" };
  }
}

export async function unenrollStudent(courseId: string, userId: string) {
  try {
    await db.enrollment.delete({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to unenroll student:", error);
    return { error: "Failed to unenroll student" };
  }
}
