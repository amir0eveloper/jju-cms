import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== Role.ADMIN) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Students");

  // Define columns
  sheet.columns = [
    { header: "Full Name", key: "name", width: 30 },
    { header: "Username", key: "username", width: 20 },
    { header: "Password", key: "password", width: 20 }, // Optional: set default if empty
    { header: "Department Code", key: "departmentCode", width: 15 },
    { header: "Year Name", key: "yearName", width: 15 },
    { header: "Semester Name", key: "semesterName", width: 15 },
    { header: "Section Name", key: "sectionName", width: 15 },
  ];

  // Add example row
  sheet.addRow({
    name: "John Doe",
    username: "john.doe",
    password: "password123",
    departmentCode: "CS",
    yearName: "Year 1",
    semesterName: "Semester 1",
    sectionName: "Section A",
  });

  // Fetch reference data (Departments, etc.) to put in a second sheet for reference?
  // Or just leave it as simple template.
  // Adding a reference sheet is helpful.
  const refSheet = workbook.addWorksheet("Reference Data");
  refSheet.columns = [
    { header: "College", key: "college", width: 20 },
    { header: "Department", key: "dept", width: 20 },
    { header: "Department Code", key: "deptCode", width: 15 },
    { header: "Year", key: "year", width: 15 },
    { header: "Semester", key: "sem", width: 15 },
    { header: "Section", key: "sec", width: 15 },
  ];

  const sections = await db.section.findMany({
    include: {
      semester: {
        include: {
          academicYear: {
            include: {
              program: {
                include: {
                  department: {
                    include: {
                      college: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    take: 1000, // Limit to prevent massive file if too many
  });

  sections.forEach((sec) => {
    refSheet.addRow({
      college: sec.semester.academicYear.program.department.college.name,
      dept: sec.semester.academicYear.program.department.name,
      deptCode: sec.semester.academicYear.program.department.code,
      year: sec.semester.academicYear.name,
      sem: sec.semester.name,
      sec: sec.name,
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="students_template.xlsx"',
    },
  });
}
