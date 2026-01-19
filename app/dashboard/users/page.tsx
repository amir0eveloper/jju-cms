import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { UserForm } from "@/components/admin/user-form";
import { deleteUser } from "./actions";
import { UserFormWrapper } from "@/components/admin/user-form-wrapper";
import { UsersTable } from "@/components/admin/users/users-table";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== Role.ADMIN) {
    redirect("/dashboard");
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const departments = await db.department.findMany({
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
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-500">
            Users
          </h1>
          <p className="text-gray-500">Manage system users and their roles.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/users/bulk-upload">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </Button>
          </Link>
          <UserFormWrapper departments={departments} />
        </div>
      </div>

      <UsersTable users={users} departments={departments} />
    </div>
  );
}
