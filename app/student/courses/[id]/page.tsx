"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  BookOpen,
  User,
  Hash,
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
} from "lucide-react";

interface CourseDetails {
  id: string;
  name: string;
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

export default function StudentCourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;

  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({
    totalSessions: 0,
    attended: 0,
    absent: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "attendance">("overview");

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
      fetchAttendance();
    }
  }, [courseId]);

  async function fetchCourseDetails() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/student/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCourse(data);
      }
    } catch (error) {
      console.error("Failed to fetch course details:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAttendance() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/student/courses/${courseId}/attendance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAttendance(data.records || []);
        
        // Calculate stats
        const total = data.records?.length || 0;
        const attended = data.records?.filter((r: AttendanceRecord) => r.status).length || 0;
        const absent = total - attended;
        const rate = total > 0 ? (attended / total) * 100 : 0;

        setStats({
          totalSessions: total,
          attended,
          absent,
          attendanceRate: Math.round(rate * 10) / 10,
        });
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a] text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Course not found</p>
          <button
            onClick={() => router.push("/student/courses")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <button
            onClick={() => router.push("/student/courses")}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft size={18} />
            Back to My Courses
          </button>
          
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <div className="bg-blue-500/20 p-2 sm:p-3 rounded-lg border border-blue-500/30 flex-shrink-0">
                  <BookOpen className="text-blue-400" size={24} />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{course.name}</h1>
                  <p className="text-gray-400 mt-1 text-xs sm:text-sm lg:text-base truncate">
                    {course.semester.academicYear.program.name}
                  </p>
                </div>
              </div>
            </div>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs sm:text-sm font-medium self-start">
              Active
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-1.5 sm:p-2 backdrop-blur-md flex gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm lg:text-base ${
              activeTab === "overview"
                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm lg:text-base ${
              activeTab === "attendance"
                ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <span className="hidden sm:inline">Attendance History</span>
            <span className="sm:hidden">Attendance</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-3 sm:p-4 lg:p-6 backdrop-blur-md hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-gray-400">Total Sessions</p>
                  <Clock className="text-blue-400" size={16} />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalSessions}</p>
              </div>

              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 sm:p-4 lg:p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-green-400">Attended</p>
                  <CheckCircle2 className="text-green-400" size={16} />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-300">{stats.attended}</p>
              </div>

              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 sm:p-4 lg:p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-red-400">Absent</p>
                  <XCircle className="text-red-400" size={16} />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-300">{stats.absent}</p>
              </div>

              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4 lg:p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs sm:text-sm text-purple-400">Attendance Rate</p>
                  <TrendingUp className="text-purple-400" size={16} />
                </div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-300">{stats.attendanceRate}%</p>
              </div>
            </div>

            {/* Course Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Course Details */}
              <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="text-blue-400" size={20} />
                  Course Details
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <Hash className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Entry Code</p>
                      <p className="font-mono text-white bg-[#0a0a0a] px-2 sm:px-3 py-1 rounded-lg inline-block border border-white/10 text-xs sm:text-sm">
                        {course.entryCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Academic Period</p>
                      <p className="text-white text-sm sm:text-base break-words">
                        {course.semester.academicYear.name} • {course.semester.name}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <GraduationCap className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Program</p>
                      <p className="text-white text-sm sm:text-base break-words">{course.semester.academicYear.program.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Enrolled Students</p>
                      <p className="text-white text-sm sm:text-base">{course._count.students} students</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher Information */}
              <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                  <User className="text-blue-400" size={20} />
                  Instructor Details
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Name</p>
                      <p className="text-white font-medium text-sm sm:text-base break-words">{course.teacher.user.name}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Hash className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Email</p>
                      <p className="text-white text-sm sm:text-base break-all">{course.teacher.user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Building2 className="text-gray-400 mt-1 flex-shrink-0" size={16} />
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-400">Department</p>
                      <p className="text-white text-sm sm:text-base break-words">{course.teacher.department.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            {stats.totalSessions > 0 && (
              <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
                <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
                  <Award className="text-blue-400" size={20} />
                  Performance Summary
                </h2>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-xs sm:text-sm">Overall Attendance</span>
                    <span className="text-white font-semibold text-sm sm:text-base">{stats.attendanceRate}%</span>
                  </div>
                  <div className="w-full bg-[#0a0a0a] rounded-full h-2.5 sm:h-3 border border-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                      style={{ width: `${stats.attendanceRate}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4 mt-6">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Sessions Held</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalSessions}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Present</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.attended}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Absent</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-400">{stats.absent}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Attendance Tab */}
        {activeTab === "attendance" && (
          <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2">
              <Calendar className="text-blue-400" size={20} />
              Attendance History
            </h2>

            {attendance.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <Calendar className="mx-auto mb-4 text-gray-500" size={40} />
                <p className="text-gray-400 text-sm sm:text-base">No attendance records yet</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {attendance
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-[#0a0a0a] border border-white/10 rounded-lg hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div
                          className={`p-2 rounded-lg flex-shrink-0 ${
                            record.status
                              ? "bg-green-500/20 border border-green-500/30"
                              : "bg-red-500/20 border border-red-500/30"
                          }`}
                        >
                          {record.status ? (
                            <CheckCircle2 className="text-green-400" size={18} />
                          ) : (
                            <XCircle className="text-red-400" size={18} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-medium text-sm sm:text-base break-words">
                            {new Date(record.timestamp).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-400">
                            {new Date(record.timestamp).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium self-start sm:self-center flex-shrink-0 ${
                          record.status
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {record.status ? "Present" : "Absent"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}