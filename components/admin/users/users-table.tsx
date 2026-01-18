"use client";

import { useState } from "react";
import { EditUserForm } from "./edit-user-form";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Edit, Search } from "lucide-react";
import { deleteUser } from "@/app/dashboard/users/actions";
import { Role } from "@/lib/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";

interface User {
  id: string;
  name: string | null;
  username: string;
  role: Role;
  createdAt: Date;
  departmentId: string | null;
  sectionId: string | null;
}

interface Section {
  id: string;
  name: string;
}

interface Semester {
  id: string;
  name: string;
  sections: Section[];
}

interface AcademicYear {
  id: string;
  name: string;
  semesters: Semester[];
}

interface Program {
  id: string;
  name: string;
  academicYears: AcademicYear[];
}

interface Department {
  id: string;
  name: string;
  programs: Program[];
}

export function UsersTable({
  users,
  departments,
}: {
  users: User[];
  departments: Department[];
}) {
  const [activeTab, setActiveTab] = useState<"staff" | "students">("students");
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((user) => {
    // 2. Filter by Active Tab
    if (activeTab === "staff") {
      return ([Role.TEACHER, Role.CLASS_MANAGER] as Role[]).includes(user.role);
    }
    if (activeTab === "students" && user.role !== Role.STUDENT) return false;

    // 3. Search Filter
    const matchesSearch =
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.username.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Tabs */}
        <div className="flex p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab("staff")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "staff"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === "students"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Students
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder={`Search ${activeTab}...`}
            className="pl-8 w-full sm:w-75"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Username</TableHead>
              {activeTab === "staff" && <TableHead>Role</TableHead>}
              {activeTab === "students" && <TableHead>Department</TableHead>}
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-gray-500"
                >
                  No {activeTab} found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  {activeTab === "staff" && (
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {user.role}
                      </Badge>
                    </TableCell>
                  )}
                  {activeTab === "students" && (
                    <TableCell>
                      {departments.find((d) => d.id === user.departmentId)
                        ?.name || "-"}
                    </TableCell>
                  )}
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Dialog
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => !open && setEditingUser(null)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingUser(user)}
                          >
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Button>
                        </DialogTrigger>
                        {editingUser?.id === user.id && (
                          <EditUserForm
                            user={user}
                            setOpen={(open: boolean) =>
                              !open && setEditingUser(null)
                            }
                            departments={departments}
                          />
                        )}
                      </Dialog>

                      <form
                        action={async () => {
                          await deleteUser(user.id);
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
