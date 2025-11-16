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
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Course {
  id: string;
  name: string;
  code: string; // 👈 IT-701 from DB
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
        department?: {
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

const STAT_STYLES = [
  {
    bg: "from-sky-400/30 via-sky-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-sky-500 to-indigo-400 shadow-[0_8px_20px_-4px_rgba(56,189,248,0.5)]",
  },
  {
    bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]",
  },
  {
    bg: "from-purple-400/30 via-purple-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-purple-500 to-pink-400 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]",
  },
];

// slug from name
function slugifyCourseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
      setLoading(true);

      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setError("Not authenticated. Please log in.");
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
        setError(errorData.error || "Failed to fetch courses.");
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError("An error occurred while fetching courses.");
    } finally {
      setLoading(false);
    }
  }

  const filteredCourses = courses.filter((course) => {
    const term = searchTerm.toLowerCase();

    return (
      course.name.toLowerCase().includes(term) ||
      course.teacher?.user?.name.toLowerCase().includes(term) ||
      course.entryCode.toLowerCase().includes(term) ||
      course.code.toLowerCase().includes(term) || // 👈 search by code
      course.semester.academicYear.program.name.toLowerCase().includes(term) ||
      course.semester.academicYear.program.department?.name
        ?.toLowerCase()
        .includes(term)
    );
  });

  function buildSlug(course: Course) {
    const nameSlug = slugifyCourseName(course.name);
    return `${course.code}-${nameSlug}`; // e.g. IT-701-data-structures
  }

  function handleViewDetails(course: Course) {
    const slug = buildSlug(course);
    router.push(`/student/courses/${slug}`);
  }

  function handleViewAttendance(course: Course) {
    const slug = buildSlug(course);
    router.push(`/student/courses/${slug}?tab=attendance`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-700">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto" />
          <p className="text-sm text-slate-500">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <Card className="max-w-md w-full border border-red-200 bg-red-50/70 shadow-[0_8px_30px_rgba(220,38,38,0.15)]">
          <CardContent className="pt-6 pb-5 space-y-4 text-center">
            <div className="text-3xl">⚠️</div>
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Error loading courses
              </p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <Button onClick={fetchCourses} className="mt-2 px-6" variant="default">
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalSessions = courses.reduce(
    (sum, c) => sum + (c._count?.attendance || 0),
    0
  );

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)]">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              <BookOpen size={20} />
            </span>
            <span>My Courses</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]">
            View your enrolled courses and keep track of active sessions.
          </p>
        </div>
      </div>

      {/* Stats */}
      {courses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Total Courses */}
          <Card className="relative overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STAT_STYLES[0].bg} opacity-90`}
            />
            <CardContent className="relative p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Total Courses
                </p>
                <p className="text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  {courses.length}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${STAT_STYLES[0].iconBg} text-white`}
              >
                <BookOpen size={22} />
              </div>
            </CardContent>
          </Card>

          {/* Active Semester */}
          <Card className="relative overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STAT_STYLES[1].bg} opacity-90`}
            />
            <CardContent className="relative p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Active Semester
                </p>
                <p className="text-base md:text-lg font-semibold mt-1 truncate max-w-[12rem] drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]">
                  {courses[0]?.semester?.name || "N/A"}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${STAT_STYLES[1].iconBg} text-white`}
              >
                <Calendar size={22} />
              </div>
            </CardContent>
          </Card>

          {/* Total Sessions */}
          <Card className="relative overflow-hidden border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${STAT_STYLES[2].bg} opacity-90`}
            />
            <CardContent className="relative p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                  Total Sessions
                </p>
                <p className="text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                  {totalSessions}
                </p>
              </div>
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${STAT_STYLES[2].iconBg} text-white`}
              >
                <GraduationCap size={22} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
        <CardContent className="p-3 md:p-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-[0_3px_8px_rgba(15,23,42,0.5)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by course name, course code (e.g. IT-701), teacher, entry code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent outline-none text-sm md:text-base text-slate-900 placeholder-slate-400"
          />
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
          <CardContent className="py-10 text-center space-y-3">
            <BookOpen className="mx-auto text-slate-300" size={40} />
            <p className="text-base md:text-lg font-semibold text-slate-900">
              {searchTerm ? "No courses match your search" : "No courses found"}
            </p>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {searchTerm
                ? "Try adjusting your search terms or clearing the filter."
                : "You have not been enrolled in any courses yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.12)] hover:shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-all duration-300"
            >
              <CardContent className="p-5 flex flex-col h-full">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-[0_4px_10px_rgba(56,189,248,0.5)]">
                    <BookOpen size={18} />
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-medium">
                    {course.semester?.name || "Active"}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-3 line-clamp-2 min-h-[3rem]">
                  {course.name}
                </h2>

                {/* Meta info */}
                <div className="space-y-2 text-xs md:text-sm text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {course.teacher?.user?.name || "Not assigned"}
                    </span>
                  </div>
                  {/* Course Code (IT-701) from DB */}
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                      {course.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="truncate">
                      {course.semester?.academicYear?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-slate-400 flex-shrink-0" />
                    <span>{course._count?.students || 0} students enrolled</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 justify-center"
                    onClick={() => handleViewDetails(course)}
                  >
                    View details
                  </Button>
                  <Button
                    variant="ghost"
                    className="sm:flex-shrink-0 border border-slate-200 hover:border-sky-500/60 hover:text-sky-700"
                    onClick={() => handleViewAttendance(course)}
                  >
                    Attendance
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
