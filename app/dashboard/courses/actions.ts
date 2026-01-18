"use server";

import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData) {
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const teacherId = formData.get("teacherId") as string;
  const departmentId = formData.get("departmentId") as string;
  const semesterId = formData.get("semesterId") as string;

  // Advanced Fields
  const startDate = formData.get("startDate")
    ? new Date(formData.get("startDate") as string)
    : null;
  const endDate = formData.get("endDate")
    ? new Date(formData.get("endDate") as string)
    : null;
  const isPublished = formData.get("isPublished") === "true";
  const enrollmentKey = (formData.get("enrollmentKey") as string) || null;
  const maxStudents = formData.get("maxStudents")
    ? parseInt(formData.get("maxStudents") as string)
    : null;
  const image = (formData.get("image") as string) || null;

  if (!title || !code || !teacherId || !departmentId || !semesterId) {
    return { error: "Missing required fields" };
  }

  const schedulesJson = formData.get("schedules") as string;
  let schedules = [];
  try {
    if (schedulesJson) schedules = JSON.parse(schedulesJson);
  } catch (e) {
    console.error("Failed to parse schedules", e);
  }

  try {
    await db.course.create({
      data: {
        title,
        code,
        description,
        teacherId,
        departmentId,
        semesterId,
        startDate,
        endDate,
        isPublished,
        enrollmentKey,
        maxStudents,
        image,
        schedules: {
          create: schedules.map((s: any) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            room: s.room,
            type: s.type,
          })),
        },
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to create course:", error);
    return {
      error: "Failed to create course. Course code might already exist.",
    };
  }
}

export async function deleteCourse(courseId: string) {
  try {
    await db.course.delete({
      where: {
        id: courseId,
      },
    });

    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete course:", error);
    return { error: "Failed to delete course" };
  }
}

export async function updateCourse(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const code = formData.get("code") as string;
  const description = formData.get("description") as string;
  const teacherId = formData.get("teacherId") as string;
  const departmentId = formData.get("departmentId") as string;
  const semesterId = formData.get("semesterId") as string;

  // Advanced Fields
  const startDate = formData.get("startDate")
    ? new Date(formData.get("startDate") as string)
    : null;
  const endDate = formData.get("endDate")
    ? new Date(formData.get("endDate") as string)
    : null;
  const isPublished = formData.get("isPublished") === "true";
  const enrollmentKey = (formData.get("enrollmentKey") as string) || null;
  const maxStudents = formData.get("maxStudents")
    ? parseInt(formData.get("maxStudents") as string)
    : null;
  const image = (formData.get("image") as string) || null;

  if (!title || !code || !teacherId || !departmentId || !semesterId) {
    return { error: "Required fields are missing." };
  }

  const schedulesJson = formData.get("schedules") as string;
  let schedules = [];
  try {
    if (schedulesJson) schedules = JSON.parse(schedulesJson);
  } catch (e) {
    console.error("Failed to parse schedules", e);
  }

  try {
    await db.$transaction(async (tx) => {
      // Update basic info
      await tx.course.update({
        where: { id: courseId },
        data: {
          title,
          code,
          description,
          teacherId,
          departmentId,
          semesterId,
          startDate,
          endDate,
          isPublished,
          enrollmentKey,
          maxStudents,
          image,
        },
      });

      // Update schedules if provided
      if (schedulesJson) {
        // Replace strategy: Delete all and re-create.
        // In a real app we might diff, but this is safer for consistency.
        await tx.classSchedule.deleteMany({
          where: { courseId },
        });

        if (schedules.length > 0) {
          await tx.classSchedule.createMany({
            data: schedules.map((s: any) => ({
              courseId,
              dayOfWeek: s.dayOfWeek,
              startTime: s.startTime,
              endTime: s.endTime,
              room: s.room,
              type: s.type,
            })),
          });
        }
      }
    });

    revalidatePath("/dashboard/courses");
    return { success: true };
  } catch (error) {
    console.error("Failed to update course:", error);
    return { error: "Failed to update course" };
  }
}
