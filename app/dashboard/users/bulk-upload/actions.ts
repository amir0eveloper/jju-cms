"use server";

import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

export async function bulkUploadStudents(sectionId: string, rawText: string) {
  if (!sectionId) return { error: "Section is required" };
  if (!rawText) return { error: "Student data is required" };

  const lines = rawText.split("\n");
  const defaultPassword = await bcrypt.hash("password123", 10);

  let successCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Expected format: Name, Username (comma or tab separated)
    // simplistic parsing
    const parts = trimmed.split(/,|\t/);
    if (parts.length < 2) {
      errorCount++;
      errors.push(`Invalid format: ${trimmed}`);
      continue;
    }

    const name = parts[0].trim();
    const username = parts[1].trim();

    try {
      // Check if user exists
      const existing = await db.user.findUnique({ where: { username } });

      if (existing) {
        // Update their section ? Or skip? Let's skip for now or update
        await db.user.update({
          where: { id: existing.id },
          data: { sectionId },
        });
      } else {
        await db.user.create({
          data: {
            name,
            username,
            password: defaultPassword,
            role: Role.STUDENT,
            sectionId,
          },
        });
      }
      successCount++;
    } catch (err) {
      errorCount++;
      errors.push(`Failed to import ${username}`);
    }
  }

  revalidatePath("/dashboard/users");
  return {
    success: true,
    stats: { success: successCount, errors: errorCount },
    errorMessages: errors,
  };
}
