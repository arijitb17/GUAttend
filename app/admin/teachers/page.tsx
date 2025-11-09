"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  Building,
  Trash2
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

      setSelectedTeacher(null);
      setSelectedDepartment("");
      fetchTeachers();
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
      await fetch(`/api/admin/teachers/${teacherId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchTeachers();
    } catch (error) {
      console.error("Failed to delete teacher:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTeachers();
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-8 text-white">

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Teachers Management</h1>
        <p className="text-gray-400 mt-1 sm:text-base text-sm">
          Approve, assign, and manage teachers efficiently.
        </p>
      </div>

      {/* Pending Teachers */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl backdrop-blur-md p-5 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-yellow-400" /> Pending Approvals
          </h2>
          <span className="text-sm text-gray-300 bg-yellow-500/20 border border-yellow-500/40 px-3 py-1 rounded-full">
            {pendingTeachers.length}
          </span>
        </div>

        {pendingTeachers.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending teacher registrations.</p>
        ) : (
          <div className="space-y-4">
            {pendingTeachers.map((t) => (
              <div key={t.id} className="bg-[#0a0a0a] border border-white/10 p-4 rounded-xl transition-all">
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-gray-400 text-sm">{t.email}</p>

                {/* BUTTON ROW (white buttons like quick actions) */}
                <div className="flex flex-wrap gap-3 mt-3">
                  <button
                    onClick={() => setSelectedTeacher(selectedTeacher === t.id ? null : t.id)}
                    className="bg-white border border-gray-200 hover:bg-gray-100 text-black text-sm px-3 py-1.5 rounded-lg transition-all"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => deleteTeacher(t.id)}
                    className="bg-white border border-gray-200 hover:bg-gray-100 text-black text-sm px-3 py-1.5 rounded-lg transition-all"
                  >
                    Reject
                  </button>
                </div>

                {/* SELECT DEPARTMENT & CONFIRM */}
                {selectedTeacher === t.id && (
                  <div className="mt-3 flex gap-3">
                    <select
                      className="flex-1 bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                      value={selectedDepartment}
                      onChange={(e) => setSelectedDepartment(e.target.value)}
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
                      className="bg-white border border-gray-200 hover:bg-gray-100 text-black text-sm px-3 py-2 rounded-lg transition-all"
                      disabled={loading || !selectedDepartment}
                    >
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
      <div className="bg-[#141414]/80 border border-white/10 rounded-2xl backdrop-blur-md p-5 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-400" /> Approved Teachers
          </h2>
          <span className="text-sm text-gray-300 bg-blue-500/20 border border-blue-500/40 px-3 py-1 rounded-full">
            {teachers.length}
          </span>
        </div>

        <div className="space-y-4">
          {teachers.map((t) => (
            <div key={t.id} className="flex justify-between items-center p-4 bg-[#0a0a0a] border border-white/10 rounded-xl">
              <div>
                <p className="font-medium text-white">{t.name}</p>
                <p className="text-gray-400 text-sm">{t.email}</p>
                <p className="text-gray-600 text-sm">Dept: {t.departmentName}</p>
              </div>

              <button
                onClick={() => deleteTeacher(t.id)}
                className="bg-white border border-gray-200 hover:bg-gray-100 text-black text-sm px-3 py-1.5 rounded-lg transition-all"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      <span className="sm:inline">Delete</span>
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
