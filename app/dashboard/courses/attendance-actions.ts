"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createAttendanceSession(
  courseId: string,
  formData: FormData,
) {
  const title = formData.get("title") as string;
  const dateStr = formData.get("date") as string;

  if (!dateStr) return { error: "Date is required" };

  try {
    await db.attendanceSession.create({
      data: {
        courseId,
        title: title || `Class - ${new Date(dateStr).toLocaleDateString()}`,
        date: new Date(dateStr),
      },
    });
    revalidatePath(`/dashboard/courses/${courseId}/attendance`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to create session" };
  }
}

// Bulk update attendance for a session
export async function saveAttendance(
  sessionId: string,
  records: {
    studentId: string;
    status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
  }[],
) {
  try {
    // Using transaction for bulk update safety
    await db.$transaction(
      records.map((record) =>
        db.attendanceRecord.upsert({
          where: {
            sessionId_studentId: {
              sessionId,
              studentId: record.studentId,
            },
          },
          create: {
            sessionId,
            studentId: record.studentId,
            status: record.status,
          },
          update: {
            status: record.status,
          },
        }),
      ),
    );
    revalidatePath(`/dashboard/courses`); // Broad revalidation
    return { success: true };
  } catch (error) {
    console.error("Failed to save attendance:", error);
    return { error: "Failed to save attendance" };
  }
}

export async function deleteAttendanceSession(
  courseId: string,
  sessionId: string,
) {
  try {
    await db.attendanceSession.delete({ where: { id: sessionId } });
    revalidatePath(`/dashboard/courses/${courseId}/attendance`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete session" };
  }
}
