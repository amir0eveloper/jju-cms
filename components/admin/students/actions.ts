"use server";

import { db } from "@/lib/db";
import { Role, Prisma } from "@prisma/client";
import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";

// ... existing getStudents function

export async function getStudents({
  search,
  deptId,
  yearId,
  semId,
  secId,
}: {
  search?: string;
  deptId?: string;
  yearId?: string;
  semId?: string;
  secId?: string;
}) {
  const where: Prisma.UserWhereInput = {
    role: Role.STUDENT,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { username: { contains: search, mode: "insensitive" } },
    ];
  }

  if (deptId && deptId !== "all") {
    where.departmentId = deptId;
  }

  if (secId && secId !== "all") {
    where.sectionId = secId;
  } else if (semId && semId !== "all") {
    where.section = {
      semesterId: semId,
    };
  } else if (yearId && yearId !== "all") {
    where.section = {
      semester: {
        academicYearId: yearId,
      },
    };
  }

  const students = await db.user.findMany({
    where,
    include: {
      department: true,
      section: {
        include: {
          semester: {
            include: {
              academicYear: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return students;
}

export async function importStudentsFromExcel(formData: FormData) {
  const file = formData.get("file") as File;
  if (!file) return { error: "No file uploaded" };

  try {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer) as any);

    const sheet = workbook.getWorksheet("Students");
    if (!sheet) return { error: "Sheet 'Students' not found in workbook." };

    const studentsToCreate: any[] = [];
    const errors: string[] = [];

    // Cache queries to minimize DB calls
    // Fetch all departments, years, semesters, sections? Might be too large.
    // Better to query as needed or fetch map.
    // For efficient bulk import, map keys to IDs.

    // Fetch all Sections with full hierarchy for matching
    const allSections = await db.section.findMany({
      include: {
        semester: {
          include: {
            academicYear: {
              include: {
                program: {
                  include: {
                    department: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Create lookup maps
    // Key: "DeptCode|YearName|SemName|SecName" -> SectionID
    const sectionMap = new Map<string, string>();
    const departmentMap = new Map<string, string>(); // Code -> ID

    allSections.forEach((sec) => {
      const d = sec.semester.academicYear.program.department;
      const y = sec.semester.academicYear;
      const s = sec.semester;

      const key = `${d.code}|${y.name}|${s.name}|${sec.name}`.toLowerCase();
      sectionMap.set(key, sec.id);
      departmentMap.set(d.code.toLowerCase(), d.id);
    });

    // Iterate rows (skip header)
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const name = row.getCell("A").text; // Full Name
      const username = row.getCell("B").text; // Username
      const password = row.getCell("C").text || "Student123!"; // Password (Default if empty)
      const deptCode = row.getCell("D").text; // Department Code
      const yearName = row.getCell("E").text; // Year Name
      const semesterName = row.getCell("F").text; // Semester Name
      const sectionName = row.getCell("G").text; // Section Name

      if (!username || !deptCode) {
        errors.push(`Row ${rowNumber}: Missing Username or Department Code`);
        return;
      }

      const key =
        `${deptCode}|${yearName}|${semesterName}|${sectionName}`.toLowerCase();
      const sectionId = sectionMap.get(key);
      const departmentId = departmentMap.get(deptCode.toLowerCase());

      if (!departmentId) {
        errors.push(
          `Row ${rowNumber}: Department code '${deptCode}' not found.`,
        );
        return;
      }

      // Section is optional? Requirement says "select Dept, Year, Sem, Section".
      // A student MUST belong to a department. Section might be optional but hierarchy usually implies student is in a section.
      // If section not found but provided, error? Or create?
      // Let's assume strict validation for now.
      if (sectionName && !sectionId) {
        errors.push(
          `Row ${rowNumber}: Section '${sectionName}' not found in hierarchy.`,
        );
        return;
      }

      studentsToCreate.push({
        name: name || username,
        username,
        password,
        departmentId,
        sectionId: sectionId || null,
        role: Role.STUDENT,
      });
    });

    if (errors.length > 0) {
      return {
        error: `Validation failed: ${errors.slice(0, 5).join(", ")} ${errors.length > 5 ? `...and ${errors.length - 5} more` : ""}`,
      };
    }

    // Bulk create
    // Prisma createMany is fast.
    // Need to has passwords first.

    // Note: createMany doesn't support nested writes or relations in some DBs, but simple fields are fine.
    // We need to hash passwords. `bcrypt.hash` is async.

    const studentsWithHashedPasswords = await Promise.all(
      studentsToCreate.map(async (s) => ({
        ...s,
        password: await bcrypt.hash(s.password, 10),
      })),
    );

    // Filter out existing usernames to prevent unique constraint error?
    // Or just let it fail? Better to check.
    const usernames = studentsWithHashedPasswords.map((s) => s.username);
    const existingUsers = await db.user.findMany({
      where: { username: { in: usernames } },
      select: { username: true },
    });

    const existingUsernames = new Set(existingUsers.map((u) => u.username));

    const finalStudents = studentsWithHashedPasswords.filter(
      (s) => !existingUsernames.has(s.username),
    );

    if (finalStudents.length === 0 && studentsToCreate.length > 0) {
      return { error: "All usernames already exist." };
    }

    await db.user.createMany({
      data: finalStudents,
    });

    revalidatePath("/dashboard/students");
    return {
      success: true,
      message: `Successfully imported ${finalStudents.length} students. ${existingUsernames.size > 0 ? `(${existingUsernames.size} duplicates skipped)` : ""}`,
    };
  } catch (err) {
    console.error(err);
    return { error: "Failed to process Excel file." };
  }
}
