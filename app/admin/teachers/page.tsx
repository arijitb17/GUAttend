"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Building2,
  Trash2,
  Mail,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Teacher {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  departmentName?: string;
}

interface Department {
  id: string;
  name: string;
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [pendingTeachers, setPendingTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // which teacher is currently being approved + its selected department
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [activeDepartmentId, setActiveDepartmentId] = useState<string>("");

  // Fetch teachers
  async function fetchTeachers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const allTeachers: Teacher[] = Array.isArray(data.teachers)
        ? data.teachers
        : [];

      setTeachers(allTeachers.filter((t) => t.departmentId));
      setPendingTeachers(allTeachers.filter((t) => !t.departmentId));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  }

  // Fetch departments
  async function fetchDepartments() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/admin/departments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : data.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  }

  // Approve Teacher
  async function approveTeacher(teacherId: string) {
    if (!activeDepartmentId) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/admin/approve-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token, // keeping your original body format
          teacherId,
          departmentId: activeDepartmentId,
        }),
      });

      setActiveTeacherId(null);
      setActiveDepartmentId("");
      await fetchTeachers();
    } catch (error) {
      console.error("Failed to approve teacher:", error);
    } finally {
      setLoading(false);
    }
  }

  // Delete Teacher
  async function deleteTeacher(teacherId: string) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchTeachers();
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      setInitialLoading(true);
      await Promise.all([fetchTeachers(), fetchDepartments()]);
      setInitialLoading(false);
    }
    init();
  }, []);

  const totalTeachers = teachers.length + pendingTeachers.length;

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-lg shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              T
            </span>
            <span>Teachers Management</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1">
            Approve new teachers, assign departments, and manage faculty
            records.
          </p>
        </div>

        {/* Small stats strip */}
        <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm">
          <div className="rounded-xl bg-white border border-slate-200 px-3 py-2 shadow-[0_4px_14px_rgba(15,23,42,0.08)]">
            <p className="text-[11px] uppercase tracking-wide text-slate-400">
              Total
            </p>
            <p className="text-lg font-semibold mt-1 flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-700" />
              {totalTeachers}
            </p>
            <p className="text-[11px] text-slate-500">Teachers</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 border border-amber-200 px-3 py-2 shadow-[0_4px_14px_rgba(251,191,36,0.25)]">
            <p className="text-[11px] uppercase tracking-wide text-amber-700/90">
              Pending
            </p>
            <p className="text-lg font-semibold mt-1 text-amber-900">
              {pendingTeachers.length}
            </p>
            <p className="text-[11px] text-amber-800/80">Approvals</p>
          </div>
          <div className="rounded-xl bg-gradient-to-br from-sky-100 to-sky-50 border border-sky-200 px-3 py-2 shadow-[0_4px_14px_rgba(56,189,248,0.25)]">
            <p className="text-[11px] uppercase tracking-wide text-sky-700/90">
              Approved
            </p>
            <p className="text-lg font-semibold mt-1 text-sky-900">
              {teachers.length}
            </p>
            <p className="text-[11px] text-sky-800/80">Assigned</p>
          </div>
        </div>
      </div>

      {/* Two-column layout: Pending + Approved */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pending Approvals */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white shadow-[0_4px_12px_rgba(251,191,36,0.6)]">
                  <UserPlus size={18} />
                </span>
                <span>Pending Approvals</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Review new registrations and assign them to departments.
              </p>
            </div>
            <span className="text-xs sm:text-sm px-3 py-1 rounded-full border border-amber-300 bg-amber-50 text-amber-800 font-medium">
              {pendingTeachers.length} pending
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {initialLoading ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 h-20"
                  />
                ))}
              </div>
            ) : pendingTeachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 flex items-center justify-center">
                <p className="text-sm text-slate-500">
                  No pending teacher registrations right now.
                </p>
              </div>
            ) : (
              pendingTeachers.map((t) => (
                <div
                  key={t.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 space-y-3 hover:bg-slate-50 hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {t.email}
                      </p>
                      <p className="text-xs text-amber-700 mt-1 font-medium">
                        Pending approval
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-xs sm:text-sm"
                        onClick={() => {
                          setActiveTeacherId(
                            activeTeacherId === t.id ? null : t.id
                          );
                          setActiveDepartmentId("");
                        }}
                      >
                        Assign & Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm"
                        onClick={() => deleteTeacher(t.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>

                  {activeTeacherId === t.id && (
                    <div className="border-t border-slate-200 pt-3 mt-1 flex flex-col sm:flex-row gap-3 sm:items-end">
                      <div className="flex-1">
                        <label className="text-[11px] font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Assign Department
                        </label>
                        <select
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/70"
                          value={activeDepartmentId}
                          onChange={(e) =>
                            setActiveDepartmentId(e.target.value)
                          }
                        >
                          <option value="">Select department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.id}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm"
                        disabled={loading || !activeDepartmentId}
                        onClick={() => approveTeacher(t.id)}
                      >
                        {loading && activeTeacherId === t.id ? (
                          <span className="mr-2 h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        )}
                        Confirm
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Approved Teachers */}
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.6)]">
                  <Building2 size={18} />
                </span>
                <span>Approved Teachers</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Teachers already assigned to departments.
              </p>
            </div>
            <span className="text-xs sm:text-sm px-3 py-1 rounded-full border border-sky-200 bg-sky-50 text-sky-800 font-medium">
              {teachers.length} active
            </span>
          </CardHeader>
          <CardContent className="space-y-3">
            {initialLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 h-20"
                  />
                ))}
              </div>
            ) : teachers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/60 py-8 flex items-center justify-center">
                <p className="text-sm text-slate-500">
                  No approved teachers yet. Approve pending requests to populate
                  this list.
                </p>
              </div>
            ) : (
              teachers.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 hover:shadow-[0_6px_20px_rgba(15,23,42,0.08)] transition-all"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {t.email}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Department:{" "}
                      <span className="font-medium text-slate-800">
                        {t.departmentName || "Not assigned"}
                      </span>
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-600 hover:bg-red-50 text-xs sm:text-sm self-start sm:self-auto"
                    onClick={() => deleteTeacher(t.id)}
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
