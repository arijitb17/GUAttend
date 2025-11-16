"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Trash2,
  PlusCircle,
  X,
  Loader2,
  Building2,
  Users,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface Teacher {
  id: string;
  name: string;
  email?: string;
  departmentId: string | null;
  departmentName?: string | null;
}

interface Program {
  id: string;
  name: string;
}

type Course = {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacher?: {
    id: string;
    user?: {
      id: string;
      name: string | null;
    };
  };
  semester?: {
    id: string;
    name: string;
    academicYear?: {
      id: string;
      name: string;
      program?: {
        id: string;
        name: string;
      };
    };
  };
};

export default function CoursesPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");
  const [courseName, setCourseName] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await Promise.all([
        fetchDepartments(),
        fetchTeachers(),
        fetchPrograms(),
        fetchCourses(),
      ]);
      setInitialLoading(false);
    })();
  }, []);

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch {
      setError("Failed to fetch departments");
    }
  }

  async function fetchTeachers() {
    try {
      const res = await fetch("/api/admin/teachers", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      const teacherList: Teacher[] = (data.teachers || [])
        .filter((t: any) => !t.isPending)
        .map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
          departmentId: t.departmentId,
          departmentName: t.departmentName,
        }));
      setTeachers(teacherList);
    } catch {
      setError("Failed to fetch teachers");
    }
  }

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/admin/programs", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch {
      setError("Failed to fetch programs");
    }
  }

  async function fetchCourses() {
    try {
      const res = await fetch("/api/admin/courses", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      setError("Failed to fetch courses");
    }
  }

  async function addCourse() {
    if (!courseName || !selectedTeacher || !selectedProgram || !academicYear || !semester) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: courseName,
        teacherId: selectedTeacher,
        programId: selectedProgram,
        academicYear,
        semesterNumber: semester, // "1".."8"
      };

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add course");

      setCourseName("");
      setSelectedDepartment("");
      setSelectedTeacher("");
      setSelectedProgram("");
      setAcademicYear("");
      setSemester("");
      setShowForm(false);
      setError(null);
      await fetchCourses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteCourse(id: string, name: string) {
    if (!confirm(`Delete course "${name}"?`)) return;
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      await fetchCourses();
    } catch {
      setError("Failed to delete course");
    }
  }

  const filteredTeachers = selectedDepartment
    ? teachers.filter((t) => t.departmentId === selectedDepartment)
    : teachers;

  const totalCourses = courses.length;
  const totalPrograms = programs.length;
  const totalTeachers = teachers.length;

  return (
    <div className="space-y-8 text-slate-900">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center justify-between text-sm sm:text-base shadow-[0_6px_16px_rgba(248,113,113,0.25)]">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-3">
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              C
            </span>
            <span>Courses</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage academic courses and their teachers, programs & semesters.
          </p>
        </div>

        <Button
          onClick={() => {
            setShowForm((prev) => !prev);
            setError(null);
          }}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.45)]"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Close
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Add Course
            </>
          )}
        </Button>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Total Courses
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{totalCourses}</p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(16,185,129,0.65)]">
              <GraduationCap className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Programs Covered
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {totalPrograms}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(139,92,246,0.65)]">
              <BookOpen className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Teaching Faculty
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {totalTeachers}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(56,189,248,0.65)]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Course Form */}
      {showForm && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Add New Course
              </CardTitle>
            </div>
            <button
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Department */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDepartment}
                  onChange={(e) => {
                    setSelectedDepartment(e.target.value);
                    setSelectedTeacher("");
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                >
                  <option value="">All Departments</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Teacher
                </label>
                <select
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                >
                  <option value="">Select Teacher</option>
                  {filteredTeachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.departmentName ? ` (${t.departmentName})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Program */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Program
                </label>
                <select
                  value={selectedProgram}
                  onChange={(e) => setSelectedProgram(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                >
                  <option value="">Select Program</option>
                  {programs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Academic Year */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Academic Year
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2024-2025"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                />
              </div>

              {/* Semester */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Semester {num}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course Name */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Course Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Data Structures and Algorithms"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-3">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={addCourse}
                disabled={loading}
                className="text-slate-900 w-full sm:w-auto inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Adding..." : "Add Course"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course List */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(16,185,129,0.6)]">
              <GraduationCap className="w-4 h-4" />
            </div>
            <CardTitle className="text-base sm:text-lg">Courses List</CardTitle>
          </div>
          <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {totalCourses} total
          </span>
        </CardHeader>

        <CardContent>
          {initialLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl border border-slate-200 bg-slate-50 animate-pulse"
                />
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-base sm:text-lg">
                No courses available
              </p>
              <p className="text-slate-500 text-sm">
                Add a course to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                      <BookOpen className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="break-words">{c.name}</span>
                    </h3>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-[11px]">
                        {c.code ?? "—"}
                      </span>
                      <span>
                        Teacher:{" "}
                        <span className="font-medium">
                          {c.teacher?.user?.name || "Unknown"}
                        </span>
                      </span>
                    </div>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {c.semester?.academicYear?.name || "Unknown Year"} •{" "}
                      {c.semester?.name || "Unknown Semester"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCourse(c.id, c.name)}
                    className="self-start sm:self-auto border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
