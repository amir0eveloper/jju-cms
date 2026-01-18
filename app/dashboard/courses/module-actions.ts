"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { minioClient, BUCKET_NAME } from "@/lib/minio";

export async function createModule(courseId: string, formData: FormData) {
  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const file = formData.get("file") as File;

  if (!title) {
    return { error: "Title is required" };
  }

  try {
    const module = await db.module.create({
      data: {
        title,
        content,
        courseId,
      },
    });

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;

      // Ensure bucket exists (optional, but good practice)
      const bucketExists = await minioClient.bucketExists(BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(BUCKET_NAME, "us-east-1");
      }

      await minioClient.putObject(BUCKET_NAME, fileName, buffer, file.size);

      await db.attachment.create({
        data: {
          name: file.name,
          url: `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET_NAME}/${fileName}`,
          type: file.type,
          moduleId: module.id,
        },
      });
    }

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to create module:", error);
    return { error: "Failed to create module" };
  }
}

export async function deleteModule(courseId: string, moduleId: string) {
  try {
    await db.module.delete({
      where: {
        id: moduleId,
      },
    });

    revalidatePath(`/dashboard/courses/${courseId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to delete module:", error);
    return { error: "Failed to delete module" };
  }
}
