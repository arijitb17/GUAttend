"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  BookOpen,
  Building2,
  CalendarDays,
  GraduationCap,
  CheckCircle2,
  Search,
  Download,
  ArrowLeft,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseSummary {
  id: string;
  name: string;
  code: string;       // 👈 from DB, e.g. IT-701
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

interface CourseDetail {
  id: string;
  name: string;
  code: string;       // 👈 from DB
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
  teacher: {
    user: {
      name: string;
      email: string;
    };
  };
  students: Array<{
    id: string;
    user: {
      name: string;
      email: string;
    };
    program: {
      name: string;
    };
    faceEmbedding: boolean;
    joinedAt: string;
    status: string;
    _count: {
      attendance: number;
    };
  }>;
  _count: {
    students: number;
    attendance: number;
  };
  attendance: Array<{
    id: string;
    timestamp: string;
    student: {
      user: {
        name: string;
      };
    };
    status: boolean;
  }>;
}

// ⭐ Same style language as TeacherOverview
const DETAIL_STAT_STYLES = [
  {
    bg: "from-indigo-400/30 via-indigo-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-indigo-500 to-sky-400 shadow-[0_8px_20px_-4px_rgba(79,70,229,0.4)]",
  },
  {
    bg: "from-emerald-400/30 via-emerald-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-emerald-500 to-lime-400 shadow-[0_8px_20px_-4px_rgba(16,185,129,0.4)]",
  },
  {
    bg: "from-amber-400/30 via-amber-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-amber-500 to-orange-400 shadow-[0_8px_20px_-4px_rgba(245,158,11,0.4)]",
  },
  {
    bg: "from-purple-400/30 via-purple-400/10 to-transparent",
    iconBg:
      "bg-gradient-to-br from-purple-500 to-pink-400 shadow-[0_8px_20px_-4px_rgba(168,85,247,0.4)]",
  },
];

// kebab-case slug from course name
function slugifyCourseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const slug = params?.slug; // e.g. "IT-701-natural-language-processing"

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const parsedSlug = useMemo<{ code: string; nameSlug: string } | null>(() => {
    if (!slug) return null;
    const parts = slug.split("-");
    if (parts.length < 3) return null;

    const code = parts.slice(0, 2).join("-"); // "IT-701"
    const nameSlug = parts.slice(2).join("-"); // "natural-language-processing"
    return { code, nameSlug };
  }, [slug]);

  useEffect(() => {
    async function resolveCourseFromSlug() {
      if (!parsedSlug) {
        setError("Invalid course link");
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        // 1️⃣ fetch teacher’s courses list
        const listRes = await fetch("/api/teacher/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!listRes.ok) {
          throw new Error("Failed to load courses for this teacher.");
        }

        const listData: CourseSummary[] = await listRes.json();
        const { code, nameSlug } = parsedSlug;

        // 2️⃣ find matching course by DB course.code + slugified name
        const match = listData.find((c) => {
          const nameSlugCandidate = slugifyCourseName(c.name);
          return c.code === code && nameSlugCandidate === nameSlug;
        });

        if (!match) {
          throw new Error("Course not found for this link.");
        }

        // 3️⃣ fetch full details using real DB id (still hidden from URL)
        const detailRes = await fetch(`/api/teacher/courses/${match.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (detailRes.status === 401) {
          router.push("/login");
          return;
        }

        if (!detailRes.ok) {
          throw new Error("Failed to fetch course details");
        }

        const detailData: CourseDetail = await detailRes.json();
        setCourse(detailData);
      } catch (err: any) {
        console.error("Course detail fetch error:", err);
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }

    resolveCourseFromSlug();
  }, [parsedSlug, router]);

  function exportToExcel() {
    if (!course) return;

    const exportData = course.students.map((student) => ({
      Name: student.user.name,
      Email: student.user.email,
      Program: student.program.name,
      "Face Registered": student.faceEmbedding ? "Yes" : "No",
      "Enrollment Date": new Date(student.joinedAt).toLocaleDateString(),
      Status: student.status,
      "Attendance Count": student._count.attendance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

    (worksheet as any)["!cols"] = [
      { wch: 24 },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, `${course.name}_students.xlsx`);
  }

  const filteredStudents = course?.students.filter((student) => {
    const query = searchTerm.toLowerCase();
    return (
      student.user.name.toLowerCase().includes(query) ||
      student.user.email.toLowerCase().includes(query) ||
      student.program.name.toLowerCase().includes(query)
    );
  });

  const registeredCount = course?.students.filter((s) => s.faceEmbedding).length || 0;
  const totalSessions = course?._count?.attendance || 0;
  const attendanceRate =
    course?.students.length && totalSessions > 0
      ? Math.round(
          (course.students.reduce((sum, s) => sum + s._count.attendance, 0) /
            (course.students.length * totalSessions)) *
            100
        )
      : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] text-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="space-y-6 text-slate-900">
        <Button
          variant="ghost"
          onClick={() => router.push("/teacher/courses")}
          className="flex items-center gap-2 w-fit px-0 hover:bg-transparent text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Courses</span>
        </Button>

        <Card className="border border-red-200 bg-red-50 rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.08)] max-w-md">
          <CardHeader>
            <CardTitle className="text-red-800">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 text-sm mb-4">{error || "Course not found"}</p>
            <Button
              onClick={() => router.push("/teacher/courses")}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              Go back to courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deptName = course.semester.academicYear.program.department.name;

  const statCards = [
    {
      title: "Total Students",
      value: course._count.students,
      icon: GraduationCap,
    },
    {
      title: "Face Registered",
      value: registeredCount,
      icon: UserCheck,
    },
    {
      title: "Total Sessions",
      value: totalSessions,
      icon: CheckCircle2,
    },
    {
      title: "Avg Attendance",
      value: `${attendanceRate}%`,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-10 text-slate-900">
      {/* Top header with back + title */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => router.push("/teacher/courses")}
            className="flex items-center gap-2 px-0 hover:bg-transparent text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back to Courses</span>
          </Button>
        </div>
      </div>

      {/* Course header card */}
      <Card className="border border-slate-400 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)]">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
                  <BookOpen size={20} />
                </span>
                <span>{course.name}</span>
              </h1>
              <p className="text-sm md:text-base text-slate-600 mt-1">
                {course.semester.academicYear.program.name}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-slate-700">
                <span className="inline-flex items-center gap-2">
                  <Building2 size={16} className="text-slate-500" />
                  <span>{deptName}</span>
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-500" />
                  <span>
                    {course.semester.academicYear.name} • {course.semester.name}
                  </span>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-sm">
              {course.code && (
                <span className="font-mono px-3 py-1 rounded-md border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs">
                  {course.code}
                </span>
              )}
              <div className="text-right text-xs text-slate-500">
                <div>
                  Taught by{" "}
                  <span className="font-medium text-slate-700">
                    {course.teacher.user.name}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {course.teacher.user.email}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats + Students */}
      <div className="grid gap-6 lg:grid-cols-[2fr,1.3fr]">
        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            const style = DETAIL_STAT_STYLES[index];
            return (
              <Card
                key={card.title}
                className="relative overflow-hidden border border-slate-400 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.12)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)] transition-all duration-300"
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${style.bg} opacity-90`}
                />
                <CardContent className="relative p-5 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-slate-600 uppercase">
                      {card.title}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-1 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${style.iconBg} text-white`}
                  >
                    <Icon size={22} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Students section (search + export + table in one card) */}
        <Card className="border border-slate-400 bg-white rounded-2xl shadow-[0_6px_18px_rgba(0,0,0,0.1)] overflow-hidden">
          <CardHeader className="pb-3 px-4 md:px-6 pt-4 md:pt-5">
            <CardTitle className="text-base md:text-lg flex items-center justify-between">
              <span>Students</span>
              <span className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
                Management
              </span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5 px-4 md:px-6 pb-6">
            {/* Search + Export Row */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name, email, or program..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent pl-9 pr-4 py-2 text-sm text-slate-900 border border-slate-400 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none placeholder:text-slate-400"
                />
              </div>

              <Button
                onClick={exportToExcel}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-slate-900 text-sm px-4 py-2 rounded-lg whitespace-nowrap"
              >
                <Download size={18} />
                Export to Excel
              </Button>
            </div>

            {/* Table or Empty State */}
            {!filteredStudents || filteredStudents.length === 0 ? (
              <div className="py-10 text-center">
                <GraduationCap className="mx-auto mb-4 text-slate-400" size={48} />
                <h3 className="text-lg font-semibold mb-2 text-slate-900">
                  No Students Found
                </h3>
                <p className="text-slate-600 text-sm">
                  {searchTerm
                    ? "Try adjusting your search terms."
                    : "No students enrolled in this course yet."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 md:-mx-6 mt-2">
                <table className="w-full min-w-[640px]">
                  <thead className="bg-slate-50 border-y border-slate-200">
                    <tr>
                      {[
                        "Student",
                        "Program",
                        "Face Data",
                        "Enrollment Date",
                        "Status",
                        "Attendance",
                      ].map((head) => (
                        <th
                          key={head}
                          className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                        >
                          {head}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-200">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        {/* Student Name + Email */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="font-medium text-slate-900">
                              {student.user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {student.user.email}
                            </p>
                          </div>
                        </td>

                        {/* Program */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {student.program.name}
                        </td>

                        {/* Face Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              student.faceEmbedding
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-rose-50 text-rose-700 border border-rose-200"
                            }`}
                          >
                            {student.faceEmbedding ? (
                              <>
                                <UserCheck size={14} className="mr-1" />
                                Registered
                              </>
                            ) : (
                              <>
                                <UserX size={14} className="mr-1" />
                                Missing
                              </>
                            )}
                          </span>
                        </td>

                        {/* Enrollment Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {new Date(student.joinedAt).toLocaleDateString()}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${
                              student.status === "active"
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                : "bg-slate-50 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>

                        {/* Attendance */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">
                              {student._count.attendance}
                            </span>
                            <span className="text-slate-500 text-xs">
                              / {totalSessions}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
