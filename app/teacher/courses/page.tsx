"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Building2,
  CalendarDays,
  KeyRound,
  GraduationCap,
  CheckCircle2,
  Search,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  code: string; // 👈 IT-701 from DB
  entryCode: string;
  semester: {
    name: string;
    academicYear: {
      name: string;
      program: {
        name: string;
        department: {
          name: string;
        };
      };
    };
  };
  _count: {
    students: number;
    attendance: number;
  };
}

export default function TeacherCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Missing auth token for teacher courses");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/teacher/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        console.error("Failed to fetch courses, status:", res.status);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  // Helper: kebab-case slug from course name
  function slugifyCourseName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const filteredCourses = courses.filter((course) => {
    const search = searchTerm.toLowerCase();
    return (
      course.name.toLowerCase().includes(search) ||
      course.code.toLowerCase().includes(search) || // 👈 search by course code
      course.entryCode.toLowerCase().includes(search) ||
      course.semester.academicYear.program.name.toLowerCase().includes(search) ||
      course.semester.academicYear.program.department.name
        .toLowerCase()
        .includes(search)
    );
  });

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
            C
          </span>
          <span>My Courses</span>
        </h1>
        <p className="text-sm md:text-base text-slate-600 mt-1">
          Manage your assigned courses, students, and attendance sessions.
        </p>
      </div>

      {/* Search Bar */}
      <div className="border border-slate-400 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.06)] p-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by course name, course code (e.g. IT-701), entry code, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-slate-900 border border-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Course Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center bg-white border border-slate-400 rounded-2xl p-12 shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
          <BookOpen className="mx-auto mb-4 text-slate-400" size={48} />
          <h3 className="text-xl font-semibold mb-2 text-slate-900">No Courses Found</h3>
          <p className="text-slate-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "You haven't been assigned any courses yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const deptName =
              course.semester.academicYear.program.department.name;
            const programName = course.semester.academicYear.program.name;

            // ✅ use DB course.code in slug (e.g. IT-701)
            const slug = `${course.code}-${slugifyCourseName(course.name)}`;

            return (
              <div
                key={course.id}
                onClick={() => router.push(`/teacher/courses/${slug}`)}
                className="group relative p-6 rounded-2xl bg-white border border-slate-400 shadow-[0_6px_18px_rgba(0,0,0,0.10)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.16)] hover:border-indigo-500/70 transition-all duration-300 cursor-pointer"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {programName}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
                    <BookOpen size={22} />
                  </div>
                </div>

                {/* Course Info */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 size={16} />
                    <span>{deptName}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays size={16} />
                    <span>
                      {course.semester.academicYear.name} • {course.semester.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <KeyRound size={16} />
                    <span className="font-mono px-2 py-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs">
                      {course.code}
                    </span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-300 text-sm">
                  <div className="flex items-center gap-2 text-slate-700">
                    <GraduationCap size={16} />
                    <span className="font-medium">
                      {course._count.students}
                    </span>
                    <span className="text-slate-500">students</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 size={16} />
                    <span className="font-medium">
                      {course._count.attendance}
                    </span>
                    <span className="text-slate-500">sessions</span>
                  </div>
                </div>

                {/* Subtle hover outline */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent group-hover:border-indigo-400/60 transition-all duration-300" />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
