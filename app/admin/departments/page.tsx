"use client";

import { useEffect, useState } from "react";
import {
  PlusCircle,
  X,
  Building2,
  Check,
  BookOpen,
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
  programs?: any[];
  teachers?: any[];
  _count?: {
    programs?: number;
    teachers?: number;
  };
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDept, setNewDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      const depts: Department[] = data.departments || data || [];
      setDepartments(depts);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  }

  async function addDepartment() {
    if (!newDept.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/admin/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDept.trim() }),
      });
      setNewDept("");
      setShowForm(false);
      await fetchDepartments();
    } catch (error) {
      console.error("Failed to add department:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteDepartment(id: string, name: string) {
    if (!confirm(`Delete "${name}" department? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
      await fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  }

  useEffect(() => {
    (async () => {
      setInitialLoading(true);
      await fetchDepartments();
      setInitialLoading(false);
    })();
  }, []);

  // Derived stats
  const totalDepartments = departments.length;
  const totalPrograms = departments.reduce(
    (sum, dept) => sum + (dept._count?.programs ?? dept.programs?.length ?? 0),
    0
  );
  const totalTeachers = departments.reduce(
    (sum, dept) => sum + (dept._count?.teachers ?? dept.teachers?.length ?? 0),
    0
  );

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              D
            </span>
            <span>Departments</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Manage academic departments and their structure.
          </p>
        </div>

        <Button
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.45)]"
        >
          <PlusCircle className="w-4 h-4" />
          {showForm ? "Close" : "Add Department"}
        </Button>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Total Departments
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {totalDepartments}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(15,23,42,0.5)]">
              <Building2 className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
          <CardContent className="p-4 sm:p-5 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-slate-500 uppercase tracking-wide">
                Active Programs
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
                Faculty Members
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {totalTeachers}
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-[0_6px_18px_rgba(16,185,129,0.65)]">
              <Users className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Department Form */}
      {showForm && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <CardTitle className="text-base sm:text-lg">
                Add New Department
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
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs sm:text-sm text-slate-600 mb-1.5 font-medium">
                  Department Name
                </label>
                <input
                  type="text"
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  placeholder="e.g., Computer Science, Mathematics"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                  onKeyDown={(e) => e.key === "Enter" && addDepartment()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={addDepartment}
                  disabled={loading || !newDept.trim()}
                  className="w-full sm:w-auto inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Departments List */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <CardTitle className="text-base sm:text-lg">All Departments</CardTitle>
          </div>
          <span className="text-xs sm:text-sm px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
            {totalDepartments} total
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
          ) : departments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-base sm:text-lg">
                No departments found
              </p>
              <p className="text-slate-500 text-sm sm:text-base">
                Add your first department to get started.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {departments.map((dept) => {
                const programsCount =
                  dept._count?.programs ?? dept.programs?.length ?? 0;
                const teachersCount =
                  dept._count?.teachers ?? dept.teachers?.length ?? 0;

                return (
                  <div
                    key={dept.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 hover:bg-white hover:shadow-[0_8px_22px_rgba(15,23,42,0.08)] transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-[0_4px_14px_rgba(15,23,42,0.6)]">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                          {dept.name}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-xs sm:text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-violet-500" />
                            {programsCount} programs
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Users className="w-3 h-3 text-emerald-500" />
                            {teachersCount} teachers
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-800 hover:bg-slate-100 text-xs sm:text-sm"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteDepartment(dept.id, dept.name)}
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
