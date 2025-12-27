"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  X,
  BookOpen,
  Check,
  Building2,
  Users,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Department {
  id: string;
  name: string;
}

interface Program {
  id: string;
  name: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
}

interface Student {
  id: string;
}

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/admin/programs");
      const data = await res.json();
      setPrograms(data.programs || data || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      setDepartments(data.departments || data || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  }

  async function fetchStudents() {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(data.students || data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  }

  async function addProgram() {
    if (!name.trim() || !departmentId.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          departmentId: departmentId.trim(),
        }),
      });
      setName("");
      setDepartmentId("");
      setShowForm(false);
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to add program:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteProgram(id: string, name: string) {
    if (
      !confirm(
        `Are you sure you want to delete the "${name}" program? This action cannot be undone.`
      )
    )
      return;

    try {
      await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
      await fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);
    }
  }

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await Promise.all([fetchPrograms(), fetchDepartments(), fetchStudents()]);
      setInitialLoading(false);
    })();
  }, []);

  const totalPrograms = programs.length;
  const departmentsLinked = departments.length;
  const totalStudents = students.length;

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              P
            </span>
            <span>Programs</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage academic programs and degree offerings.
          </p>
        </div>

        <Button
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.45)]"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? "Close" : "Add Program"}
        </Button>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Total Programs
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
                Departments Linked
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {departmentsLinked}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(56,189,248,0.65)]">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Total Students
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {totalStudents}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(16,185,129,0.65)]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Program Form */}
      {showForm && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Add New Program
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Program Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Bachelor of Computer Science"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-600 mb-1.5">
                  Department
                </label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  <option value="">Select a department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowForm(false)}
                className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </Button>
              <Button
                onClick={addProgram}
                disabled={loading || !name.trim() || !departmentId.trim()}
                className="text-slate-900 w-full sm:w-auto inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 " />
                    Add Program
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Programs List */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-violet-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(139,92,246,0.6)]">
              <BookOpen className="w-4 h-4" />
            </div>
            <CardTitle className="text-base sm:text-lg">All Programs</CardTitle>
          </div>
          <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {totalPrograms} total
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
          ) : programs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-base sm:text-lg">
                No programs found
              </p>
              <p className="text-slate-500 text-sm sm:text-base">
                Add your first program to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {programs.map((program) => {
                const dept =
                  program.department ||
                  departments.find((d) => d.id === program.departmentId);

                return (
                  <div
                    key={program.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="h-10 w-10 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(139,92,246,0.7)]">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {program.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs sm:text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-sky-500" />
                            {dept?.name || "Unknown department"}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            ID: {program.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteProgram(program.id, program.name)}
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
