"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  BookOpen,
  User,
  Calendar,
  Users,
  GraduationCap,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Award,
  Building2,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CourseSummary {
  id: string;
  name: string;
  code: string; // IT-701 from DB
  semester: {
    name: string;
    academicYear: {
      name: string;
      program: {
        name: string;
      };
    };
  };
}

interface CourseDetails {
  id: string;
  name: string;
  code?: string;
  entryCode: string;
  teacher: {
    user: {
      name: string;
      email: string;
    };
    department: {
      name: string;
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

interface AttendanceRecord {
  id: string;
  status: boolean;
  timestamp: string;
  course: {
    name: string;
  };
}

interface AttendanceStats {
  totalSessions: number;
  attended: number;
  absent: number;
  attendanceRate: number;
}

// slug from name
function slugifyCourseName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function StudentCourseDetailPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params?.slug; // e.g. "IT-701-data-structures"

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [courseCode, setCourseCode] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    attended: 0,
    absent: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "attendance">("overview");

  // parse slug: "IT-701-data-structures" -> { code: "IT-701", nameSlug: "data-structures" }
  const parsedSlug = useMemo<{ code: string; nameSlug: string } | null>(() => {
    if (!slug) return null;
    const parts = slug.split("-");
    if (parts.length < 3) return null;

    const code = `${parts[0]}-${parts[1]}`; // IT-701
    const nameSlug = parts.slice(2).join("-");
    return { code, nameSlug };
  }, [slug]);

  // Respect ?tab=attendance
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "attendance") {
      setActiveTab("attendance");
    }
  }, [searchParams]);

  useEffect(() => {
    async function resolveCourseFromSlug() {
      if (!parsedSlug) {
        setError("Invalid course link");
        setLoading(false);
        return;
      }

      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
          router.push("/login");
          return;
        }

        // 1️⃣ Fetch student's course list
        const listRes = await fetch("/api/student/courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!listRes.ok) {
          throw new Error("Failed to load your courses.");
        }

        const listData: CourseSummary[] = await listRes.json();
        const { code, nameSlug } = parsedSlug;

        // 2️⃣ Find matching course by code + slugified name
        const match = listData.find((c) => {
          const nameSlugCandidate = slugifyCourseName(c.name);
          return c.code === code && nameSlugCandidate === nameSlug;
        });

        if (!match) {
          throw new Error("Course not found for this link.");
        }

        setCourseCode(match.code);

        // 3️⃣ Fetch full details using internal course ID
        const detailRes = await fetch(`/api/student/courses/${match.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!detailRes.ok) {
          throw new Error("Failed to fetch course details");
        }

        const detailData: CourseDetails = await detailRes.json();
        setCourse(detailData);

        // 4️⃣ Fetch attendance for that ID
        const attRes = await fetch(
          `/api/student/courses/${match.id}/attendance`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (attRes.ok) {
          const data = await attRes.json();
          const records: AttendanceRecord[] = data.records || [];
          setAttendance(records);

          const total = records.length;
          const attended = records.filter((r) => r.status).length;
          const absent = total - attended;
          const rate = total > 0 ? (attended / total) * 100 : 0;

          setStats({
            totalSessions: total,
            attended,
            absent,
            attendanceRate: Math.round(rate * 10) / 10,
          });
        }
      } catch (e: any) {
        console.error("Student course detail error:", e);
        setError(e.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    }

    resolveCourseFromSlug();
  }, [parsedSlug, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] text-slate-700">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-900 mx-auto" />
          <p className="text-sm text-slate-500">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex items-center justify-center min-h-[320px]">
        <Card className="max-w-md w-full border border-slate-200 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.12)]">
          <CardContent className="pt-6 pb-5 text-center space-y-4">
            <p className="text-base md:text-lg font-semibold text-slate-900">
              {error ? "Something went wrong" : "Course not found"}
            </p>
            <p className="text-sm text-slate-500">
              {error ||
                "The course you’re trying to view may not exist or you no longer have access."}
            </p>
            <Button
              className="mt-2"
              onClick={() => router.push("/student/courses")}
            >
              Back to My Courses
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900">
      {/* Header Card */}
      <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <CardContent className="p-4 md:p-6 space-y-4">
          <Button
            variant="ghost"
            size="sm"
            className="inline-flex items-center gap-2 px-0 text-sky-600 hover:text-sky-700 hover:bg-transparent"
            onClick={() => router.push("/student/courses")}
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Back to My Courses</span>
          </Button>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
            <div className="flex-1 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-100 text-sky-600 shadow-[0_4px_10px_rgba(56,189,248,0.5)]">
                <BookOpen size={22} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight break-words">
                  {course.name}
                </h1>
                <p className="text-sm md:text-base text-slate-500 mt-1 truncate">
                  {course.semester.academicYear.program.name}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 md:gap-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                  Active
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">
                  {course.semester.academicYear.name} • {course.semester.name}
                </span>
              </div>
              {courseCode && (
                <span className="font-mono px-3 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-800 text-xs">
                  {courseCode}
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
<Card className="border border-slate-200 bg-slate-50/60 rounded-2xl shadow-[0_4px_16px_rgba(15,23,42,0.06)]">
  <CardContent className="p-1.5 md:p-2 flex gap-1.5 md:gap-2">
    <button
      onClick={() => setActiveTab("overview")}
      className={`flex-1 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all ${
        activeTab === "overview"
          ? "bg-white text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.15)]"
          : "text-slate-500 hover:text-slate-900 hover:bg-white"
      }`}
    >
      Overview
    </button>
    <button
      onClick={() => setActiveTab("attendance")}
      className={`flex-1 px-3 md:px-6 py-2 md:py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all ${
        activeTab === "attendance"
          ? "bg-white text-slate-900 shadow-[0_4px_14px_rgba(15,23,42,0.15)]"
          : "text-slate-500 hover:text-slate-900 hover:bg-white"
      }`}
    >
      <span className="hidden sm:inline">Attendance History</span>
      <span className="sm:hidden">Attendance</span>
    </button>
  </CardContent>
</Card>


      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6 md:space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm text-slate-500">
                    Total Sessions
                  </p>
                  <Clock className="text-sky-500" size={18} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-slate-900">
                  {stats.totalSessions}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 bg-emerald-50 rounded-2xl shadow-[0_6px_18px_rgba(16,185,129,0.18)]">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm text-emerald-700">Attended</p>
                  <CheckCircle2 className="text-emerald-600" size={18} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-emerald-800">
                  {stats.attended}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-rose-200 bg-rose-50 rounded-2xl shadow-[0_6px_18px_rgba(244,63,94,0.18)]">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm text-rose-700">Absent</p>
                  <XCircle className="text-rose-600" size={18} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-rose-800">
                  {stats.absent}
                </p>
              </CardContent>
            </Card>

            <Card className="border border-violet-200 bg-violet-50 rounded-2xl shadow-[0_6px_18px_rgba(124,58,237,0.18)]">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs md:text-sm text-violet-700">
                    Attendance Rate
                  </p>
                  <TrendingUp className="text-violet-600" size={18} />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-violet-800">
                  {stats.attendanceRate}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Course & Teacher Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Details */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                  <BookOpen size={18} />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="text-slate-400 mt-1 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">
                      Academic Period
                    </p>
                    <p className="text-sm md:text-base text-slate-900 break-words">
                      {course.semester.academicYear.name} • {course.semester.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <GraduationCap
                    className="text-slate-400 mt-1 flex-shrink-0"
                    size={16}
                  />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">Program</p>
                    <p className="text-sm md:text-base text-slate-900 break-words">
                      {course.semester.academicYear.program.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="text-slate-400 mt-1 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">
                      Enrolled Students
                    </p>
                    <p className="text-sm md:text-base text-slate-900">
                      {course._count.students} students
                    </p>
                  </div>
                </div>

                {/* Entry code hidden, neutral tip instead */}
                <div className="flex items-start gap-3 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
                  <Info
                    className="text-slate-500 mt-0.5 flex-shrink-0"
                    size={16}
                  />
                  <p className="text-xs md:text-sm text-slate-600">
                    To mark your attendance, use the{" "}
                    <strong>entry code shared by your teacher</strong> in class
                    or on your course announcements.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Details */}
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                  <User size={18} />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Instructor Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="text-slate-400 mt-1 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">Name</p>
                    <p className="text-sm md:text-base text-slate-900 break-words">
                      {course.teacher.user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2
                    className="text-slate-400 mt-1 flex-shrink-0"
                    size={16}
                  />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">
                      Department
                    </p>
                    <p className="text-sm md:text-base text-slate-900 break-words">
                      {course.teacher.department.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="text-slate-400 mt-1 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-slate-500">Email</p>
                    <p className="text-sm md:text-base text-slate-900 break-all">
                      {course.teacher.user.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          {stats.totalSessions > 0 && (
            <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3 flex flex-row items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                  <Award size={18} />
                </div>
                <CardTitle className="text-base md:text-lg">
                  Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs md:text-sm text-slate-500">
                      Overall Attendance
                    </span>
                    <span className="text-sm md:text-base font-semibold text-slate-900">
                      {stats.attendanceRate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-500 to-sky-400 transition-all duration-500"
                      style={{ width: `${stats.attendanceRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-slate-500 mb-1">
                      Sessions Held
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-slate-900">
                      {stats.totalSessions}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-slate-500 mb-1">
                      Present
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-emerald-600">
                      {stats.attended}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-slate-500 mb-1">
                      Absent
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-rose-600">
                      {stats.absent}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === "attendance" && (
        <Card className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)]">
          <CardHeader className="pb-3 flex flex-row items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <Calendar size={18} />
            </div>
            <CardTitle className="text-base md:text-lg">
              Attendance History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="mx-auto mb-3 text-slate-300" size={40} />
                <p className="text-sm md:text-base text-slate-500">
                  No attendance records yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {attendance
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3.5 md:p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-sky-400/70 hover:bg-sky-50/60 transition-all"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div
                          className={`p-2.5 rounded-lg flex-shrink-0 ${
                            record.status
                              ? "bg-emerald-50 border border-emerald-200"
                              : "bg-rose-50 border border-rose-200"
                          }`}
                        >
                          {record.status ? (
                            <CheckCircle2 className="text-emerald-600" size={18} />
                          ) : (
                            <XCircle className="text-rose-600" size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm md:text-base font-medium text-slate-900 break-words">
                            {new Date(record.timestamp).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs md:text-sm text-slate-500">
                            {new Date(record.timestamp).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm font-medium self-start md:self-center ${
                          record.status
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {record.status ? "Present" : "Absent"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
