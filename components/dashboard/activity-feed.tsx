"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { User, BookOpen } from "lucide-react";

interface ActivityFeedProps {
  recentUsers: Array<{
    id: string;
    name: string | null;
    username: string;
    role: string;
    createdAt: Date;
  }>;
  recentCourses: Array<{
    id: string;
    title: string;
    code: string;
    createdAt: Date;
    teacher: {
      name: string | null;
      username: string;
    };
  }>;
}

export function ActivityFeed({
  recentUsers,
  recentCourses,
}: ActivityFeedProps) {
  // Combine and sort activities
  const activities = [
    ...recentUsers.map((user) => ({
      type: "user" as const,
      id: user.id,
      title: user.name || user.username,
      subtitle: user.role,
      createdAt: user.createdAt,
    })),
    ...recentCourses.map((course) => ({
      type: "course" as const,
      id: course.id,
      title: course.title,
      subtitle: `${course.code} - ${course.teacher.name || course.teacher.username}`,
      createdAt: course.createdAt,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest system updates</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </p>
          ) : (
            activities.map((activity) => (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div
                  className={`p-2 rounded-full ${
                    activity.type === "user" ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  {activity.type === "user" ? (
                    <User className="h-4 w-4 text-blue-600" />
                  ) : (
                    <BookOpen className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {activity.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.subtitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(new Date(activity.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type === "user" ? "User" : "Course"}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
