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
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Departments</h1>
          <p className="text-gray-400 mt-1">
            Manage academic departments and their structure
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f]/80 border border-white/10 hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5 text-blue-400" />
          Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showForm && (
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-400" />
              Add New Department
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-gray-400 mb-2">
                Department Name
              </label>
              <input
                type="text"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="e.g., Computer Science, Mathematics"
                className="text-white w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                onKeyPress={(e) => e.key === "Enter" && addDepartment()}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addDepartment}
                disabled={loading || !newDept.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-all duration-200"
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
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            All Departments
          </h2>
          <span className="text-sm text-gray-300 bg-[#1f1f1f] px-3 py-1 rounded-full border border-white/10">
            {departments.length}
          </span>
        </div>

        <div className="p-6">
          {departments.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No departments found</p>
              <p className="text-gray-500">
                Add your first department to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a]/80 border border-white/10 rounded-xl hover:bg-[#232323] transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/5 text-blue-400 rounded-full p-3 border border-white/10">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{dept.name}</h3>
                      <p className="text-sm text-gray-500">
                        Programs: {dept._count?.programs ?? 0}
                      </p>
                      <p className="text-sm text-gray-500">
                        Teachers: {dept._count?.teachers ?? 0}
                      </p>

                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteDepartment(dept.id, dept.name)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition"
                    >
                      <Trash2 className="w-4 h-4" />
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
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  {/* Total Departments */}
  <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          Total Departments
        </p>
        <p className="text-2xl font-bold mt-1">{departments.length}</p>
      </div>
      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
        <Building2 className="w-6 h-6 text-blue-400" />
      </div>
    </div>
  </div>

  {/* Total Programs (sum of all programs across departments) */}
  <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          Active Programs
        </p>
        <p className="text-2xl font-bold mt-1">
          {departments.reduce(
            (sum, dept) => sum + (dept._count?.programs || 0),
            0
          )}
        </p>
      </div>
      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
        <BookOpen className="w-6 h-6 text-purple-400" />
      </div>
    </div>
  </div>

  {/* Total Teachers (sum of all teachers across departments) */}
  <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400 uppercase tracking-wide">
          Faculty Members
        </p>
        <p className="text-2xl font-bold mt-1">
          {departments.reduce(
            (sum, dept) => sum + (dept._count?.teachers || 0),
            0
          )}
        </p>
      </div>
      <div className="bg-white/5 p-3 rounded-lg border border-white/10">
        <Users className="w-6 h-6 text-emerald-400" />
      </div>
    </div>
  </div>
</div>

    </div>
  );
}
