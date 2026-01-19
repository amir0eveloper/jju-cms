"use server";

import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  const departmentId = formData.get("departmentId") as string;
  const sectionId = formData.get("sectionId") as string;

  if (!username || !password || !role) {
    return { error: "Missing required fields" };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role,
        departmentId: departmentId || null,
        sectionId: sectionId || null,
      },
    });

    // Auto-enroll in section courses if section is selected
    if (sectionId) {
      const section = await db.section.findUnique({
        where: { id: sectionId },
        include: { courses: true },
      });

      if (section && section.courses.length > 0) {
        await db.enrollment.createMany({
          data: section.courses.map((course) => ({
            userId: user.id,
            courseId: course.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to create user:", error);
    return { error: "Failed to create user. Username might already exist." };
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.user.delete({
      where: {
        id: userId,
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete user:", error);
    return { error: "Failed to delete user" };
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const name = formData.get("name") as string;
  const username = formData.get("username") as string;
  const role = formData.get("role") as Role;
  const departmentId = formData.get("departmentId") as string;
  const sectionId = formData.get("sectionId") as string;

  try {
    await db.user.update({
      where: { id: userId },
      data: {
        name,
        username,
        role,
        departmentId: departmentId || null,
        sectionId: sectionId || null,
      },
    });

    // Auto-enroll in section courses if section changed/exists
    if (sectionId) {
      const section = await db.section.findUnique({
        where: { id: sectionId },
        include: { courses: true },
      });

      if (section && section.courses.length > 0) {
        await db.enrollment.createMany({
          data: section.courses.map((course) => ({
            userId: userId,
            courseId: course.id,
          })),
          skipDuplicates: true,
        });
      }
    }

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { error: "Failed to update user" };
  }
}
