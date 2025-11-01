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
      const token = localStorage.getItem("token");
      const res = await fetch("/api/teacher/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter((course) =>
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.entryCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.semester.academicYear.program.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Courses</h1>
        <p className="text-gray-400 mt-2">
          Manage your assigned courses and student data.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative bg-[#1a1a1a]/60 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] p-4">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by course name, entry code, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
          />
        </div>
      </div>

      {/* Course Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center bg-[#141414]/80 border border-white/10 rounded-2xl p-12 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
          <BookOpen className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Courses Found</h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "You haven't been assigned any courses yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => router.push(`/teacher/courses/${course.id}`)}
              className="group relative p-6 rounded-2xl bg-[#1a1a1a]/60 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] hover:border-blue-500/30 transition-all duration-300 cursor-pointer"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition">
                    {course.name}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {course.semester.academicYear.program.name}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 text-blue-400 rounded-lg">
                  <BookOpen size={22} />
                </div>
              </div>

              {/* Course Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Building2 size={16} />
                  <span>{course.semester.academicYear.program.department.name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <CalendarDays size={16} />
                  <span>
                    {course.semester.academicYear.name} • {course.semester.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <KeyRound size={16} />
                  <span className="font-mono bg-[#222] border border-white/10 px-2 py-1 rounded-md text-gray-300">
                    {course.entryCode}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-white/10 text-sm">
                <div className="flex items-center gap-2 text-gray-300">
                  <GraduationCap size={16} />
                  <span className="font-medium text-white">
                    {course._count.students}
                  </span>
                  <span className="text-gray-400">students</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <CheckCircle2 size={16} />
                  <span className="font-medium text-white">
                    {course._count.attendance}
                  </span>
                  <span className="text-gray-400">sessions</span>
                </div>
              </div>

              {/* Hover Accent Border */}
              <div className="absolute inset-0 rounded-2xl border border-transparent group-hover:border-blue-500/40 transition-all duration-500 pointer-events-none"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
