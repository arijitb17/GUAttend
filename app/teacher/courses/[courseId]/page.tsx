"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import {
  BookOpen,
  Building2,
  CalendarDays,
  KeyRound,
  GraduationCap,
  CheckCircle2,
  Search,
  Download,
  ArrowLeft,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";

interface CourseDetail {
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

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetail();
    }
  }, [courseId]);

  async function fetchCourseDetail() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/teacher/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch course details");
      }

      const data = await res.json();
      setCourse(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  }

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

    // Auto-size columns
    const maxWidth = exportData.reduce((w, r) => Math.max(w, r.Name.length), 10);
    worksheet["!cols"] = [
      { wch: maxWidth },
      { wch: 30 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 15 },
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
  const attendanceRate = course?.students.length && totalSessions > 0
    ? Math.round(
        (course.students.reduce((sum, s) => sum + s._count.attendance, 0) /
          (course.students.length * totalSessions)) *
          100
      )
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error || "Course not found"}</p>
          <button
            onClick={() => router.back()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-white min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Courses</span>
      </button>

      {/* Course Header */}
      <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-8 backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)]">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{course.name}</h1>
            <p className="text-xl text-gray-400">
              {course.semester.academicYear.program.name}
            </p>
          </div>
          <div className="p-4 bg-blue-500/20 text-blue-400 rounded-xl">
            <BookOpen size={32} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <Building2 size={18} className="text-gray-400" />
            <span>{course.semester.academicYear.program.department.name}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <CalendarDays size={18} className="text-gray-400" />
            <span>
              {course.semester.academicYear.name} • {course.semester.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <KeyRound size={18} className="text-gray-400" />
            <span className="font-mono bg-[#222] border border-white/10 px-3 py-1 rounded-md">
              {course.entryCode}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <GraduationCap size={18} className="text-gray-400" />
            <span>Teacher: {course.teacher.user.name}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <GraduationCap className="text-blue-400" size={24} />
            <span className="text-3xl font-bold text-white">
              {course._count.students}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Students</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="text-green-400" size={24} />
            <span className="text-3xl font-bold text-white">{registeredCount}</span>
          </div>
          <p className="text-gray-400 text-sm">Face Registered</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle2 className="text-purple-400" size={24} />
            <span className="text-3xl font-bold text-white">
              {totalSessions}
            </span>
          </div>
          <p className="text-gray-400 text-sm">Total Sessions</p>
        </div>

        <div className="bg-[#1a1a1a]/60 border border-white/10 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-yellow-400" size={24} />
            <span className="text-3xl font-bold text-white">{attendanceRate}%</span>
          </div>
          <p className="text-gray-400 text-sm">Avg Attendance</p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between bg-[#1a1a1a]/60 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search students by name, email, or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 py-2 text-sm text-white border border-white/10 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-gray-500"
          />
        </div>
        <button
          onClick={exportToExcel}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition font-medium whitespace-nowrap"
        >
          <Download size={18} />
          Export to Excel
        </button>
      </div>

      {/* Students Table */}
      {filteredStudents && filteredStudents.length === 0 ? (
        <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-12 text-center backdrop-blur-md">
          <GraduationCap className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-xl font-semibold mb-2">No Students Found</h3>
          <p className="text-gray-400">
            {searchTerm
              ? "Try adjusting your search terms."
              : "No students enrolled in this course yet."}
          </p>
        </div>
      ) : (
        <div className="bg-[#141414]/80 border border-white/10 rounded-2xl backdrop-blur-md shadow-[0_0_25px_rgba(255,255,255,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#1a1a1a] border-b border-white/10">
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
                      className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredStudents?.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-[#1f1f1f] transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {student.user.name}
                        </div>
                        <div className="text-sm text-gray-400">
                          {student.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                      {student.program.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.faceEmbedding
                            ? "bg-green-900/30 text-green-400 border border-green-700/50"
                            : "bg-red-900/30 text-red-400 border border-red-700/50"
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
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300 text-sm">
                      {new Date(student.joinedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.status === "active"
                            ? "bg-blue-900/30 text-blue-400 border border-blue-700/50"
                            : "bg-gray-900/30 text-gray-400 border border-gray-700/50"
                        }`}
                      >
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {student._count.attendance}
                        </span>
                        <span className="text-gray-400 text-sm">
                          / {totalSessions}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}