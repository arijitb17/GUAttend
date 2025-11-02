"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  User,
  Hash,
  Search,
  Calendar,
  Users,
  GraduationCap,
} from "lucide-react";

interface Course {
  id: string;
  name: string;
  entryCode: string;
  teacher: {
    user: {
      name: string;
      email: string;
    };
  };
  semester: {
    name: string;
    academicYear: {
      name: string;
      program: {
        name: string;
      };
    };
  };
  _count: {
    students: number;
    attendance: number;
  };
}

export default function MyCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please log in.");
        setLoading(false);
        return;
      }
      const res = await fetch("/api/student/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to fetch courses");
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("An error occurred while fetching courses");
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.teacher?.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.entryCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function handleViewDetails(courseId: string) {
    router.push(`/student/courses/${courseId}`);
  }

  function handleViewAttendance(courseId: string) {
    router.push(`/student/courses/${courseId}?tab=attendance`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white px-4">
        <div className="text-center max-w-md w-full bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <p className="font-semibold mb-2 text-sm sm:text-base">Error Loading Courses</p>
          <p className="text-gray-400 mb-4 text-xs sm:text-sm">{error}</p>
          <button
            onClick={fetchCourses}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-white">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">My Courses</h1>
        <p className="text-gray-400 mt-2 text-sm sm:text-base">
          View your enrolled courses and track your progress.
        </p>
      </div>

      {/* Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md flex justify-between items-center hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Courses</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{courses.length}</p>
            </div>
            <BookOpen className="text-blue-400" size={28} />
          </div>

          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md flex justify-between items-center hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Active Semester</p>
              <p className="text-base sm:text-lg font-semibold text-white mt-1 truncate">
                {courses[0]?.semester?.name || "N/A"}
              </p>
            </div>
            <Calendar className="text-green-400 flex-shrink-0" size={28} />
          </div>

          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md flex justify-between items-center hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-xs sm:text-sm text-gray-400">Total Sessions</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {courses.reduce((sum, c) => sum + (c._count?.attendance || 0), 0)}
              </p>
            </div>
            <GraduationCap className="text-purple-400" size={28} />
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-3 sm:p-4 mb-6 sm:mb-8 backdrop-blur-md flex items-center gap-3">
        <Search className="text-gray-400 flex-shrink-0" size={18} />
        <input
          type="text"
          placeholder="Search courses, teachers, or entry codes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent w-full outline-none text-white placeholder-gray-500 text-sm sm:text-base"
        />
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-8 sm:p-12 backdrop-blur-md text-center">
          <BookOpen className="mx-auto mb-4 text-gray-500" size={40} />
          <p className="text-base sm:text-lg font-semibold mb-2">
            {searchTerm ? "No courses match your search" : "No Courses Found"}
          </p>
          <p className="text-gray-400 text-xs sm:text-sm">
            {searchTerm
              ? "Try adjusting your search terms."
              : "You have not been enrolled in any courses yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-blue-500/20 p-2.5 sm:p-3 rounded-lg border border-blue-500/30">
                  <BookOpen className="text-blue-400" size={20} />
                </div>
                <span className="px-2.5 sm:px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-medium">
                  {course.semester?.name || "Active"}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-semibold text-white mb-3 line-clamp-2 min-h-[3rem]">
                {course.name}
              </h2>

              <div className="space-y-2 text-xs sm:text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="truncate">{course.teacher?.user?.name || "Not assigned"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="font-mono bg-[#0a0a0a] px-2 py-0.5 rounded border border-white/10">
                    {course.entryCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="truncate">{course.semester?.academicYear?.name || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={14} className="text-gray-500 flex-shrink-0" />
                  <span>{course._count?.students || 0} students enrolled</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => handleViewDetails(course.id)}
                  className="flex-1 px-3 sm:px-4 py-2 bg-[#0a0a0a] rounded-lg hover:bg-[#141414] transition-all text-xs sm:text-sm font-medium"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleViewAttendance(course.id)}
                  className="px-3 sm:px-4 py-2 bg-[#0a0a0a] border border-white/10 text-gray-300 rounded-lg hover:border-blue-500/40 hover:text-white transition-all text-xs sm:text-sm font-medium sm:flex-shrink-0"
                >
                  Attendance
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}