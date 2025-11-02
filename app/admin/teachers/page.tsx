"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  UserCheck,
  UserX,
  Trash2,
  Check,
  X,
  Building,
} from "lucide-react";

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
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");

  // Fetch teachers
  async function fetchTeachers() {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/admin/teachers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const allTeachers: Teacher[] = Array.isArray(data.teachers) ? data.teachers : [];

      setTeachers(allTeachers.filter((t: Teacher) => t.departmentId));
      setPendingTeachers(allTeachers.filter((t: Teacher) => !t.departmentId));
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  }

  // Fetch departments
  async function fetchDepartments() {
    try {
      const token = localStorage.getItem("token");
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
    if (!selectedDepartment) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/admin/approve-teacher", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, teacherId, departmentId: selectedDepartment }),
      });

      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      setTeachers((prev) => [
        ...prev,
        { id: teacherId, departmentId: selectedDepartment, name: "", email: "" },
      ]);

      setSelectedTeacher(null);
      setSelectedDepartment("");
      fetchTeachers();
    } catch (error) {
      console.error("Failed to approve teacher:", error);
    } finally {
      setLoading(false);
    }
  }

  // Delete Teacher (works for approved and pending)
  async function deleteTeacher(teacherId: string) {
    if (!confirm("Are you sure you want to delete this teacher?")) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from both pending and approved lists
      setPendingTeachers((prev) => prev.filter((t) => t.id !== teacherId));
      setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    } finally {
      setLoading(false);
    }
  }

  // Reject Teacher (pending only)
  async function rejectTeacher(teacherId: string) {
    await deleteTeacher(teacherId);
  }

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 lg:space-y-10 text-white">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight">
          Teachers Management
        </h1>
        <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
          Approve, assign, and manage teachers efficiently.
        </p>
      </div>

      {/* Pending Teachers */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            <span className="hidden sm:inline">Pending Approvals</span>
            <span className="sm:hidden">Pending</span>
          </h2>
          <span className="text-xs sm:text-sm text-gray-300 bg-yellow-500/20 border border-yellow-500/30 px-3 py-1 rounded-full">
            {pendingTeachers.length}
          </span>
        </div>

        {pendingTeachers.length === 0 ? (
          <p className="text-gray-400 italic text-sm sm:text-base">No pending teacher registrations.</p>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {pendingTeachers.map((t) => (
              <div
                key={t.id}
                className="bg-[#0a0a0a] border border-white/10 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="w-full sm:w-auto">
                    <p className="font-semibold text-white text-sm sm:text-base">{t.name}</p>
                    <p className="text-xs sm:text-sm text-gray-400 break-all">{t.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button
                      onClick={() =>
                        setSelectedTeacher(selectedTeacher === t.id ? null : t.id)
                      }
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white text-xs sm:text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(34,197,94,0.2)]"
                    >
                      <UserCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      {selectedTeacher === t.id ? "Cancel" : "Approve"}
                    </button>

                    <button
                      onClick={() => rejectTeacher(t.id)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white text-xs sm:text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                      disabled={loading}
                    >
                      <UserX className="w-3 h-3 sm:w-4 sm:h-4" />
                      Reject
                    </button>

                    <button
                      onClick={() => deleteTeacher(t.id)}
                      className="flex items-center gap-1 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                      disabled={loading}
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Delete
                    </button>
                  </div>
                </div>

                {/* Department Select */}
                {selectedTeacher === t.id && (
                  <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                    <select
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
                      className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-lg px-3 py-2 text-xs sm:text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => approveTeacher(t.id)}
                      className={`flex items-center justify-center gap-1 px-4 py-2 text-white text-xs sm:text-sm font-medium rounded-lg transition-all ${
                        loading || !selectedDepartment
                          ? "bg-gray-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                      }`}
                      disabled={loading || !selectedDepartment}
                    >
                      <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Teachers */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            Approved Teachers
          </h2>
          <span className="text-xs sm:text-sm text-gray-300 bg-blue-500/20 border border-blue-500/30 px-3 py-1 rounded-full">
            {teachers.length}
          </span>
        </div>

        {teachers.length === 0 ? (
          <p className="text-gray-400 italic text-sm sm:text-base">No approved teachers found.</p>
        ) : (
          <div className="grid gap-3 sm:gap-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 lg:p-5 bg-[#0a0a0a] border border-white/10 rounded-lg sm:rounded-xl hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 gap-3"
              >
                <div className="w-full sm:w-auto">
                  <p className="font-semibold text-white text-sm sm:text-base">{t.name}</p>
                  <p className="text-xs sm:text-sm text-gray-400 break-all">{t.email}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Department: {t.departmentName || t.departmentId || "N/A"}
                  </p>
                </div>

                <button
                  onClick={() => deleteTeacher(t.id)}
                  className="flex items-center justify-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs sm:text-sm rounded-lg transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] w-full sm:w-auto"
                  disabled={loading}
                >
                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}