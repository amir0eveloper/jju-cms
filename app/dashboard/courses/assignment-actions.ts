"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

import {
  createNotification,
  createBulkNotifications,
} from "@/lib/notifications";

export async function createAssignment(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const maxScoreStr = formData.get("maxScore") as string;

  if (!title) return { error: "Title is required" };

  try {
    const dueDate = dueDateStr ? new Date(dueDateStr) : null;
    const maxScore = maxScoreStr ? parseInt(maxScoreStr) : 100;
    const submissionType =
      (formData.get("submissionType") as
        | "ONLINE_TEXT"
        | "FILE_UPLOAD"
        | "BOTH"
        | "NONE") || "BOTH";

    const assignment = await db.assignment.create({
      data: {
        title,
        description,
        dueDate,
        maxScore,
        submissionType,
        courseId,
      },
      include: {
        course: true,
      },
    });

    // Notify all students
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: { select: { userId: true } },
        sections: {
          include: {
            students: { select: { id: true } },
          },
        },
      },
    });

    if (course) {
      const studentIds = new Set<string>();
      course.enrollments.forEach((e) => studentIds.add(e.userId));
      course.sections.forEach((s) =>
        s.students.forEach((st) => studentIds.add(st.id)),
      );

      if (studentIds.size > 0) {
        await createBulkNotifications(
          Array.from(studentIds),
          "New Assignment",
          `New assignment "${title}" added in ${course.title}`,
          `/dashboard/courses/${courseId}`,
        );
      }
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create assignment:", error);
    return { error: "Failed to create assignment" };
  }
}

export async function deleteAssignment(courseId: string, assignmentId: string) {
  try {
    await db.assignment.delete({
      where: { id: assignmentId },
    });
    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    return { error: "Failed to delete assignment" };
  }
}

import { minioClient, BUCKET_NAME } from "@/lib/minio";

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  formData: FormData,
) {
  const content = formData.get("content") as string;
  const file = formData.get("file") as File;

  try {
    let fileUrl = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `submissions/${assignmentId}/${studentId}-${Date.now()}-${file.name}`;

      // Ensure bucket exists
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      }

      await minioClient.putObject(BUCKET_NAME, fileName, buffer, file.size);
      fileUrl = `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileName}`;
    }

    await db.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      create: {
        assignmentId,
        studentId,
        content: content || "",
        fileUrl,
      },
      update: {
        content: content || undefined,
        fileUrl: fileUrl || undefined, // Only update if new file uploaded
        submittedAt: new Date(),
      },
    });

    revalidatePath(`/dashboard/courses`);
    return { success: true };
  } catch (error) {
    console.error("Submission failed:", error);
    return { error: "Failed to submit assignment" };
  }
}

export async function gradeSubmission(
  submissionId: string,
  grade: number,
  feedback?: string,
) {
  try {
    const submission = await db.submission.update({
      where: { id: submissionId },
      data: {
        grade,
        feedback,
        gradedAt: new Date(),
      },
      include: {
        assignment: {
          include: { course: true },
        },
      },
    });

    await createNotification(
      submission.studentId,
      "Assignment Graded",
      `Your submission for "${submission.assignment.title}" has been graded.`,
      `/dashboard/courses/${submission.assignment.courseId}`,
    );

    return { success: true };
  } catch (error) {
    return { error: "Failed to grade submission" };
  }
}
