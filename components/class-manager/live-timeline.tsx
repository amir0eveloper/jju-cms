"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveClass {
  id: string; // schedule ID
  courseName: string;
  courseCode: string;
  teacherName: string;
  room: string;
  startTime: string;
  endTime: string;
  status: "UPCOMING" | "LIVE" | "COMPLETED";
}

export function LiveClassTimeline({ classes }: { classes: LiveClass[] }) {
  if (classes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No classes scheduled for the rest of the day.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Live Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2",
                  cls.status === "LIVE"
                    ? "bg-green-500 text-white"
                    : "bg-slate-300 text-slate-500",
                )}
              >
                {cls.status === "LIVE" ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border shadow-sm bg-white">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-blue-500">
                    {cls.startTime} - {cls.endTime}
                  </div>
                  <Badge
                    variant={cls.status === "LIVE" ? "default" : "secondary"}
                  >
                    {cls.status}
                  </Badge>
                </div>
                <div className="text-lg font-semibold text-blue-700 mb-1">
                  {cls.courseName}{" "}
                  <span className="text-xs text-gray-400 font-normal">
                    ({cls.courseCode})
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Teacher:{" "}
                  <span className="font-medium text-blue-500">
                    {cls.teacherName}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <MapPin className="w-3 h-3 mr-1" />
                  Room: {cls.room}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
