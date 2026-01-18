"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ScheduleItem {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  room: string;
  type: "Lecture" | "Lab" | "Tutorial";
}

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function ScheduleManager({
  initialSchedules = [],
  onChange,
}: {
  initialSchedules?: ScheduleItem[];
  onChange: (schedules: ScheduleItem[]) => void;
}) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);

  const [newDay, setNewDay] = useState<number>(1); // Monday
  const [newStart, setNewStart] = useState("08:30");
  const [newEnd, setNewEnd] = useState("10:30");
  const [newRoom, setNewRoom] = useState("");
  const [newType, setNewType] = useState<"Lecture" | "Lab" | "Tutorial">(
    "Lecture",
  );

  useEffect(() => {
    onChange(schedules);
  }, [schedules, onChange]);

  const addSchedule = () => {
    if (!newRoom) return;

    setSchedules([
      ...schedules,
      {
        dayOfWeek: newDay,
        startTime: newStart,
        endTime: newEnd,
        room: newRoom,
        type: newType,
      },
    ]);
    setNewRoom(""); // Clear room input
  };

  const removeSchedule = (index: number) => {
    const next = [...schedules];
    next.splice(index, 1);
    setSchedules(next);
  };

  return (
    <div className="space-y-4 border rounded-md p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Class Schedule</h3>
        <Badge variant="outline">{schedules.length} slots</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {schedules.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between bg-white p-2 rounded border text-[11px] h-10"
          >
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1">
                <span className="font-bold text-blue-800">
                  {DAYS[item.dayOfWeek].substring(0, 3)}
                </span>
                <span className="text-gray-600">
                  {item.startTime}-{item.endTime}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span className="font-medium">{item.type}</span>
                <span>•</span>
                <span>Rm: {item.room}</span>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeSchedule(idx)}
              className="h-6 w-6 text-red-400 hover:text-red-600 hover:bg-red-50"
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="bg-white p-3 rounded-lg border border-slate-200 mt-4 space-y-3">
        {/* Row 1: Primary Info */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              Day
            </Label>
            <Select
              value={newDay.toString()}
              onValueChange={(v) => setNewDay(parseInt(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map((day, i) => (
                  <SelectItem key={i} value={i.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              Room
            </Label>
            <Input
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="h-8 text-xs"
              placeholder="Ex. 101"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              Type
            </Label>
            <Select value={newType} onValueChange={(v: any) => setNewType(v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lecture">Lecture</SelectItem>
                <SelectItem value="Lab">Lab</SelectItem>
                <SelectItem value="Tutorial">Tutorial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Row 2: Timing & Action */}
        <div className="grid grid-cols-5 gap-3 items-end">
          <div className="col-span-2 space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              Start Time
            </Label>
            <Input
              type="time"
              value={newStart}
              onChange={(e) => setNewStart(e.target.value)}
              className="h-8 text-xs px-1"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <Label className="text-[10px] font-bold text-slate-500 uppercase">
              End Time
            </Label>
            <Input
              type="time"
              value={newEnd}
              onChange={(e) => setNewEnd(e.target.value)}
              className="h-8 text-xs px-1"
            />
          </div>
          <div className="col-span-1">
            <Button
              onClick={addSchedule}
              type="button"
              className="w-full h-8 bg-blue-600 hover:bg-blue-700 shadow-sm"
              disabled={!newRoom}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
