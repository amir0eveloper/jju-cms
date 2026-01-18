import { db } from "@/lib/db";
import { Role } from "@/lib/generated/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BulkUploadForm } from "@/components/admin/users/bulk-upload-form";

export default async function BulkUploadPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  // Fetch sections for the dropdown
  const colleges = await db.college.findMany({
    include: {
      departments: {
        include: {
          programs: {
            include: {
              academicYears: {
                include: {
                  semesters: {
                    include: {
                      sections: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // Transform the deep hierarchy into the flat structure expected by the UI
  const formattedColleges = colleges.map((college) => ({
    id: college.id,
    name: college.name,
    departments: college.departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      sections: dept.programs.flatMap((prog) =>
        prog.academicYears.flatMap((year) =>
          year.semesters.flatMap((sem) =>
            sem.sections.map((sec) => ({
              id: sec.id,
              name: sec.name,
              level: sem.semesterNumber,
            })),
          ),
        ),
      ),
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-blue-500">
          Bulk Student Upload
        </h1>
        <p className="text-gray-500">
          Import students directly into a specific Section.
        </p>
      </div>

      <BulkUploadForm colleges={formattedColleges} />
    </div>
  );
}
