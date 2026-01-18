"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// --- College Actions ---
export async function createCollege(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;

  if (!name || !code) return { error: "Name and Code are required" };

  try {
    await db.college.create({ data: { name, code } });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create college. Code must be unique." };
  }
}

// --- Department Actions ---
export async function createDepartment(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const collegeId = formData.get("collegeId") as string;

  if (!name || !code || !collegeId) return { error: "All fields are required" };

  try {
    await db.department.create({ data: { name, code, collegeId } });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create department. Code must be unique." };
  }
}

// --- Program Actions ---
export async function createProgram(formData: FormData) {
  const name = formData.get("name") as string;
  const code = formData.get("code") as string;
  const departmentId = formData.get("departmentId") as string;

  if (!name || !departmentId)
    return { error: "Name and Department are required" };

  try {
    await db.program.create({ data: { name, code, departmentId } });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create program." };
  }
}

// --- Academic Year Actions ---
export async function createAcademicYear(formData: FormData) {
  const name = formData.get("name") as string;
  const programId = formData.get("programId") as string;

  if (!name || !programId) return { error: "All fields are required" };

  try {
    // Note: Link to Program now
    await db.academicYear.create({ data: { name, programId } });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create academic year." };
  }
}

// --- Semester Actions ---
export async function createSemester(formData: FormData) {
  const name = formData.get("name") as string;
  const academicYearId = formData.get("academicYearId") as string;

  if (!name || !academicYearId) return { error: "All fields are required" };

  const semesterNumber = parseInt(formData.get("semesterNumber") as string);
  if (isNaN(semesterNumber))
    return { error: "Valid semester number is required" };

  try {
    await db.semester.create({
      data: { name, academicYearId, semesterNumber },
    });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create semester." };
  }
}

// --- Section Actions ---
export async function createSection(formData: FormData) {
  const name = formData.get("name") as string;
  const semesterId = formData.get("semesterId") as string;

  if (!name || !semesterId) return { error: "All fields are required" };

  try {
    await db.section.create({ data: { name, semesterId } });
    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    return { error: "Failed to create section." };
  }
}

// --- Section Course Assignment ---
export async function updateSectionCourses(
  sectionId: string,
  courseIds: string[],
) {
  try {
    // 1. Update the Course <-> Section links
    await db.section.update({
      where: { id: sectionId },
      data: {
        courses: {
          set: courseIds.map((id) => ({ id })),
        },
      },
    });

    // 2. Auto-enroll existing students in the section to these courses
    const section = await db.section.findUnique({
      where: { id: sectionId },
      include: { students: true },
    });

    if (section && section.students.length > 0 && courseIds.length > 0) {
      const enrollments = [];
      for (const student of section.students) {
        for (const courseId of courseIds) {
          enrollments.push({
            userId: student.id,
            courseId: courseId,
          });
        }
      }

      if (enrollments.length > 0) {
        await db.enrollment.createMany({
          data: enrollments,
          skipDuplicates: true,
        });
      }
    }

    revalidatePath("/dashboard/hierarchy");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to update section courses." };
  }
}
