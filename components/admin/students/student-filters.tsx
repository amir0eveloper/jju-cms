"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

export interface Department {
  id: string;
  name: string;
  programs: {
    id: string;
    name: string;
    academicYears: {
      id: string;
      name: string;
      semesters: {
        id: string;
        name: string;
        sections: { id: string; name: string }[];
      }[];
    }[];
  }[];
}

export function StudentFilters({ departments }: { departments: Department[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedDeptId, setSelectedDeptId] = useState(
    searchParams.get("dept") || "",
  );
  const [selectedProgramId, setSelectedProgramId] = useState(
    searchParams.get("prog") || "",
  );
  const [selectedYearId, setSelectedYearId] = useState(
    searchParams.get("year") || "",
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState(
    searchParams.get("sem") || "",
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    searchParams.get("sec") || "",
  );

  // Derived state for dependent dropdowns
  const selectedDept = departments.find((d) => d.id === selectedDeptId);
  const programs = selectedDept?.programs || [];

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const academicYears = selectedProgram?.academicYears || [];

  const selectedYear = academicYears.find((y) => y.id === selectedYearId);
  const semesters = selectedYear?.semesters || [];

  const selectedSemester = semesters.find((s) => s.id === selectedSemesterId);
  const sections = selectedSemester?.sections || [];

  // Update URL on filter change
  useEffect(() => {
    const params = new URLSearchParams(searchParams);

    if (search) params.set("search", search);
    else params.delete("search");

    if (selectedDeptId) params.set("dept", selectedDeptId);
    else params.delete("dept");

    if (selectedProgramId) params.set("prog", selectedProgramId);
    else params.delete("prog");

    if (selectedYearId) params.set("year", selectedYearId);
    else params.delete("year");

    if (selectedSemesterId) params.set("sem", selectedSemesterId);
    else params.delete("sem");

    if (selectedSectionId) params.set("sec", selectedSectionId);
    else params.delete("sec");

    // Debounce search update
    const timeout = setTimeout(() => {
      router.push(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [
    search,
    selectedDeptId,
    selectedProgramId,
    selectedYearId,
    selectedSemesterId,
    selectedSectionId,
    router,
    pathname,
  ]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-wrap">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search name or username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={selectedDeptId}
        onValueChange={(val) => {
          setSelectedDeptId(val);
          setSelectedProgramId("");
          setSelectedYearId("");
          setSelectedSemesterId("");
          setSelectedSectionId("");
        }}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Departments</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedProgramId}
        onValueChange={(val) => {
          setSelectedProgramId(val);
          setSelectedYearId("");
          setSelectedSemesterId("");
          setSelectedSectionId("");
        }}
        disabled={!selectedDeptId || selectedDeptId === "all"}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Program" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Programs</SelectItem>
          {programs.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedYearId}
        onValueChange={(val) => {
          setSelectedYearId(val);
          setSelectedSemesterId("");
          setSelectedSectionId("");
        }}
        disabled={!selectedProgramId || selectedProgramId === "all"}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Years</SelectItem>
          {academicYears.map((y) => (
            <SelectItem key={y.id} value={y.id}>
              {y.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedSemesterId}
        onValueChange={(val) => {
          setSelectedSemesterId(val);
          setSelectedSectionId("");
        }}
        disabled={!selectedYearId || selectedYearId === "all"}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Semester" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Semesters</SelectItem>
          {semesters.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedSectionId}
        onValueChange={setSelectedSectionId}
        disabled={!selectedSemesterId || selectedSemesterId === "all"}
      >
        <SelectTrigger className="w-full md:w-[150px]">
          <SelectValue placeholder="Section" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Sections</SelectItem>
          {sections.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(search || selectedDeptId) && (
        <Button
          variant="ghost"
          onClick={() => {
            setSearch("");
            setSelectedDeptId("");
            setSelectedProgramId("");
            setSelectedYearId("");
            setSelectedSemesterId("");
            setSelectedSectionId("");
          }}
        >
          Reset
        </Button>
      )}
    </div>
  );
}
