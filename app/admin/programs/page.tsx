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

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/admin/programs");
      const data = await res.json();
      setPrograms(data.programs || []);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  }

  async function fetchDepartments() {
    try {
      const res = await fetch("/api/admin/departments");
      const data = await res.json();
      setDepartments(data.departments || []);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  }

  async function fetchStudents() {
    try {
      const res = await fetch("/api/admin/students");
      const data = await res.json();
      setStudents(data.students || []);
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
      fetchPrograms();
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
      fetchPrograms();
    } catch (error) {
      console.error("Failed to delete program:", error);
    }
  }

  useEffect(() => {
    fetchPrograms();
    fetchDepartments();
    fetchStudents();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Programs</h1>
          <p className="text-gray-400 mt-2">
            Manage academic programs and degree offerings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] text-white rounded-lg font-medium border border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all duration-200"
        >
          <PlusCircle className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {/* Add Program Form */}
      {showForm && (
        <div className="bg-[#141414]/80 border border-white/10 rounded-xl p-6 shadow-md backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-gray-300" />
              Add New Program
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Program Name
              </label>
              <input
                type="text"
                placeholder="e.g., Bachelor of Computer Science"
                className="w-full px-3 py-2 bg-transparent border border-white/20 rounded-lg text-gray-100 focus:ring-2 focus:ring-white/20 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 bg-transparent border border-white/20 rounded-lg text-gray-100 focus:ring-2 focus:ring-white/20 focus:outline-none"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
              >
                <option value="">Select a department</option>
                {departments.map((dept) => (
                  <option
                    key={dept.id}
                    value={dept.id}
                    className="bg-[#1a1a1a] text-gray-200"
                  >
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-300 border border-white/10 rounded-lg hover:bg-white/5 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={addProgram}
              disabled={loading || !name.trim() || !departmentId.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg font-medium transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add Program
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Programs List */}
      <div className="bg-[#141414]/80 border border-white/10 rounded-xl shadow-md backdrop-blur-sm">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-300" />
            All Programs
          </h2>
          <span className="text-sm text-gray-400 bg-white/10 px-3 py-1 rounded-full">
            {programs.length}
          </span>
        </div>

        <div className="p-6">
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No programs found</p>
              <p className="text-gray-500">
                Add your first program to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex items-center justify-between p-4 bg-[#1b1b1b] hover:bg-[#222] rounded-lg border border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-white/10 text-gray-200 rounded-full p-3">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-100">
                        {program.name}
                      </h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Building2 size={14} className="text-gray-500" />
                        <span className="font-mono bg-[#222] border border-white/10 px-2 py-1 rounded-md text-gray-300">
                          Dept: {program.departmentId.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <BookOpen size={14} className="text-gray-500" />
                        <span className="font-mono bg-[#222] border border-white/10 px-2 py-1 rounded-md text-gray-300">
                          Prog: {program.id.slice(0, 6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1 px-3 py-1 text-sm bg-white/10 text-gray-300 rounded-lg hover:bg-white/20 transition">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => deleteProgram(program.id, program.name)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition"
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

       {/* ✅ Stats Section (fixed according to Prisma schema) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "Total Programs",
            value: programs.length,
            icon: <BookOpen className="w-6 h-6" />,
          },
          {
            title: "Departments Linked",
            value: departments.length,
            icon: <Building2 className="w-6 h-6" />,
          },
          {
            title: "Total Students",
            value: students.length,
            icon: <Users className="w-6 h-6" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#141414]/80 border border-white/10 rounded-xl p-6 shadow-sm flex items-center justify-between hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition"
          >
            <div>
              <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-100 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="bg-white/10 text-gray-200 p-3 rounded-lg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}