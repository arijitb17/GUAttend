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

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDepartments: 0,
    totalPrograms: 0,
    totalTeachers: 0,
  });
  const [newDept, setNewDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      const depts = data.departments || [];
      setDepartments(depts);

      // calculate derived stats
      const totalPrograms = depts.reduce(
        (acc: number, dept: any) => acc + (dept.programs?.length || 0),
        0
      );
      const totalTeachers = depts.reduce(
        (acc: number, dept: any) => acc + (dept.teachers?.length || 0),
        0
      );

      setStats({
        totalDepartments: depts.length,
        totalPrograms,
        totalTeachers,
      });
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
      fetchDepartments();
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
      fetchDepartments();
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  }

  useEffect(() => {
    fetchDepartments();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Departments</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Manage academic departments and their structure
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg font-medium transition-all duration-200 w-full sm:w-auto text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showForm && (
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Add New Department
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">
                Department Name
              </label>
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="e.g., Computer Science, Mathematics"
                className="text-white w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
                onKeyPress={(e) => e.key === "Enter" && addDepartment()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addDepartment}
                disabled={loading || !newDept.trim()}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg font-medium transition-all duration-200 text-sm sm:text-base disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
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
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            All Departments
          </h2>
          <span className="text-xs sm:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
            {departments.length}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {departments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">No departments found</p>
              <p className="text-gray-600 text-sm sm:text-base">
                Add your first department to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-[#1a1a1a]/80 border border-white/10 rounded-lg sm:rounded-xl hover:bg-[#232323] transition-all duration-200 gap-3"
                >
                  <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="bg-white/5 text-blue-400 rounded-full p-2 sm:p-3 border border-white/10 flex-shrink-0">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white text-sm sm:text-base">{dept.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Programs: {dept._count?.programs ?? 0}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Teachers: {dept._count?.teachers ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg transition">
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDepartment(dept.id, dept.name)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg transition"
                    >
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Department Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Departments */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                Total Departments
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">{departments.length}</p>
            </div>
            <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Total Programs */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                Active Programs
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {departments.reduce(
                  (sum, dept) => sum + (dept._count?.programs || 0),
                  0
                )}
              </p>
            </div>
            <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                Faculty Members
              </p>
              <p className="text-xl sm:text-2xl font-bold mt-1">
                {departments.reduce(
                  (sum, dept) => sum + (dept._count?.teachers || 0),
                  0
                )}
              </p>
            </div>
            <div className="bg-white/5 p-2 sm:p-3 rounded-lg border border-white/10">
              <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
