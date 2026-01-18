"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, BookPlus, Upload, FileBarChart } from "lucide-react";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Common administrative tasks
        </p>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Link href="/dashboard/users">
          <Button className="w-full justify-start" variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Create New User
          </Button>
        </Link>
        <Link href="/dashboard/courses">
          <Button className="w-full justify-start" variant="outline">
            <BookPlus className="mr-2 h-4 w-4" />
            Create New Course
          </Button>
        </Link>
        <Link href="/dashboard/users/bulk-upload">
          <Button className="w-full justify-start" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload Students
          </Button>
        </Link>
        <Link href="/dashboard/hierarchy">
          <Button className="w-full justify-start" variant="outline">
            <FileBarChart className="mr-2 h-4 w-4" />
            Manage Hierarchy
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
