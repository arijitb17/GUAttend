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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Programs</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Manage academic programs and degree offerings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg font-medium transition-all duration-200 w-full sm:w-auto justify-center text-sm sm:text-base"
        >
          <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
          Add Program
        </button>
      </div>

      {/* Add Program Form */}
      {showForm && (
        <div className="bg-[#141414]/80 border border-white/10 rounded-xl p-4 sm:p-6 shadow-md backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Add New Program
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-200 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Program Name
              </label>
              <input
                type="text"
                placeholder="e.g., Bachelor of Computer Science"
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Department
              </label>
              <select
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm sm:text-base"
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

          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg transition-all text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={addProgram}
              disabled={loading || !name.trim() || !departmentId.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg font-medium transition-all text-sm sm:text-base disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
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
        <div className="p-4 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            All Programs
          </h2>
          <span className="text-xs sm:text-sm text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
            {programs.length}
          </span>
        </div>

        <div className="p-4 sm:p-6">
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-400 text-base sm:text-lg">No programs found</p>
              <p className="text-gray-600 text-sm sm:text-base">
                Add your first program to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-[#1b1b1b] hover:bg-[#222] rounded-lg border border-white/10 transition-all duration-200 gap-3"
                >
                  <div className="flex items-start gap-3 sm:gap-4 w-full sm:w-auto">
                    <div className="bg-white/10 text-gray-200 rounded-full p-2 sm:p-3 flex-shrink-0">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-100 text-sm sm:text-base">
                        {program.name}
                      </h3>
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-2">
                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                          <Building2 size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="font-mono bg-[#222] border border-white/10 px-2 py-1 rounded-md text-gray-300 break-all">
                            Dept: {program.departmentId.slice(0, 6).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                          <BookOpen size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="font-mono bg-[#222] border border-white/10 px-2 py-1 rounded-md text-gray-300 break-all">
                            Prog: {program.id.slice(0, 6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg transition">
                      <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => deleteProgram(program.id, program.name)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1 text-xs sm:text-sm bg-white border border-gray-200 hover:bg-gray-100 text-black rounded-lg transition"
                    >
                      c
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[
          {
            title: "Total Programs",
            value: programs.length,
            icon: <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />,
          },
          {
            title: "Departments Linked",
            value: departments.length,
            icon: <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />,
          },
          {
            title: "Total Students",
            value: students.length,
            icon: <Users className="w-5 h-5 sm:w-6 sm:h-6" />,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-[#141414]/80 border border-white/10 rounded-xl p-4 sm:p-6 shadow-sm flex items-center justify-between hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide">
                {stat.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-100 mt-1">
                {stat.value}
              </p>
            </div>
            <div className="bg-white/10 text-gray-200 p-2 sm:p-3 rounded-lg">
              {stat.icon}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
