// Utility functions for exporting reports

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) return;

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape commas and quotes
          if (
            typeof value === "string" &&
            (value.includes(",") || value.includes('"'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? "";
        })
        .join(","),
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function prepareDataForExport(records: any[], type: string) {
  switch (type) {
    case "STUDENT_ATTENDANCE":
      return records.map((r) => ({
        Student: r.user?.name || r.user?.username || "N/A",
        Course: r.session?.course?.title || "N/A",
        Date: r.session?.date
          ? new Date(r.session.date).toLocaleDateString()
          : "N/A",
        Status: r.status,
        Section: r.user?.section?.name || "N/A",
        Department:
          r.user?.section?.semester?.academicYear?.program?.department?.name ||
          "N/A",
      }));

    case "TEACHER_ATTENDANCE":
      return records.map((r) => ({
        Teacher: r.teacher?.name || r.teacher?.username || "N/A",
        Course: r.course?.title || "N/A",
        "Course Code": r.course?.code || "N/A",
        Date: new Date(r.date).toLocaleDateString(),
        Status: r.status,
        "Marked By": r.markedBy?.name || r.markedBy?.username || "N/A",
        Notes: r.notes || "",
      }));

    case "COURSE_ENROLLMENT":
      return records.map((r) => ({
        "Course Title": r.title,
        "Course Code": r.code,
        Teacher: r.teacher?.name || r.teacher?.username || "N/A",
        Department: r.department?.name || "N/A",
        Semester: r.semester?.name || "N/A",
        Enrollments: r._count?.enrollments || 0,
      }));

    default:
      return records;
  }
}
