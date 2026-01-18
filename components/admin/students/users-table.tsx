import { getStudents } from "@/components/admin/students/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export async function UsersTable({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const deptId =
    typeof searchParams.dept === "string" ? searchParams.dept : undefined;
  const yearId =
    typeof searchParams.year === "string" ? searchParams.year : undefined;
  const semId =
    typeof searchParams.sem === "string" ? searchParams.sem : undefined;
  const secId =
    typeof searchParams.sec === "string" ? searchParams.sec : undefined;

  const students = await getStudents({ search, deptId, yearId, semId, secId });

  if (students.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No students found.</div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Section</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => {
            const year = student.section?.semester?.academicYear?.name || "-";
            const semester = student.section?.semester?.name || "-";
            const section = student.section?.name || "-";

            return (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.name}</TableCell>
                <TableCell>{student.username}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {student.department?.code || "-"}
                  </Badge>
                </TableCell>
                <TableCell>{year}</TableCell>
                <TableCell>{semester}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{section}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
