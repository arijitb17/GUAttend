"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  Trash2,
  PlusCircle,
  X,
  Loader2,
} from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
    fetchTeachers();
    fetchPrograms();
    fetchCourses();
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
        semesterNumber: semester,
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
      fetchCourses();
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
      fetchCourses();
    } catch {
      setError("Failed to delete course");
    }
  }

  const filteredTeachers = selectedDepartment
    ? teachers.filter((t) => t.departmentId === selectedDepartment)
    : teachers;

  return (
    <div className="space-y-8 text-white">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-5 h-5 text-red-400" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses</h1>
          <p className="text-gray-400 mt-1">
            Manage academic courses and their details
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#1f1f1f]/80 border border-white/10 hover:bg-[#2a2a2a] text-white rounded-lg font-medium transition-all duration-200"
        >
          {showForm ? (
            <>
              <X className="w-5 h-5 text-red-400" /> Close
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5 text-blue-400" /> Add Course
            </>
          )}
        </button>
      </div>

      {/* Add Course Form */}
      {showForm && (
        <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            Add New Course
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedTeacher("");
              }}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            {/* Teacher */}
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Teacher</option>
              {filteredTeachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.departmentName ? `(${t.departmentName})` : ""}
                </option>
              ))}
            </select>

            {/* Program */}
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Program</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Academic Year */}
            <input
              type="text"
              placeholder="e.g., 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />

            {/* Semester */}
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <option key={num} value={num}>
                  Semester {num}
                </option>
              ))}
            </select>

            {/* Course Name */}
            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-white/10 text-gray-300 rounded-lg hover:bg-[#2a2a2a] transition-all"
            >
              Cancel
            </button>
            <button
              onClick={addCourse}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? "Adding..." : "Add Course"}
            </button>
          </div>
        </div>
      )}

      {/* Course List */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-400" />
            Courses List
          </h2>
          <span className="text-sm text-gray-300 bg-[#1f1f1f] px-3 py-1 rounded-full border border-white/10">
            {courses.length}
          </span>
        </div>

        <div className="p-6">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No courses available</p>
              <p className="text-gray-500 text-sm">
                Add a course to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-4 bg-[#1a1a1a]/80 border border-white/10 rounded-xl hover:bg-[#232323] transition-all duration-200"
                >
                  <div>
                    <h3 className="font-semibold text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-400" />
                      {c.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Teacher: {c.teacher?.user?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {c.semester?.academicYear?.name || "Unknown Year"} •{" "}
                      {c.semester?.name || "Unknown Semester"}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteCourse(c.id, c.name)}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
