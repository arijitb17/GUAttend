"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";

interface Course {
  id: string;
  name: string;
  entryCode: string;
}

interface AttendanceReport {
  studentName: string;
  studentEmail: string;
  totalSessions: number;
  attended: number;
  percentage: number;
}

export default function TeacherReports() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [report, setReport] = useState<AttendanceReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view reports");
        return;
      }

      const res = await fetch("/api/teacher/courses", {
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
      setError("Failed to load courses");
    }
  }

  async function generateReport() {
    if (!selectedCourse) {
      setError("Please select a course");
      return;
    }

    setLoading(true);
    setError(null);
    setReport([]);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to generate reports");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams({ courseId: selectedCourse });
      if (dateRange.startDate) params.append("startDate", dateRange.startDate);
      if (dateRange.endDate) params.append("endDate", dateRange.endDate);

      const res = await fetch(`/api/teacher/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate report");
      }

      const data = await res.json();
      setReport(data);
      if (data.length === 0)
        setError("No attendance data found for this course.");
    } catch (error: any) {
      console.error("Failed to generate report:", error);
      setError(error.message || "Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  function downloadCSV() {
    if (report.length === 0) return;

    const selectedCourseName =
      courses.find((c) => c.id === selectedCourse)?.name || "Unknown";
    const headers = [
      "Student Name",
      "Email",
      "Total Sessions",
      "Attended",
      "Attendance %",
    ];
    const rows = report.map((r) => [
      r.studentName,
      r.studentEmail,
      r.totalSessions.toString(),
      r.attended.toString(),
      r.percentage.toFixed(1) + "%",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `attendance_report_${selectedCourseName.replace(
      /\s+/g,
      "_"
    )}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600 bg-green-50";
    if (percentage >= 50) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const averageAttendance =
    report.length > 0
      ? (report.reduce((sum, r) => sum + r.percentage, 0) / report.length).toFixed(1)
      : "0";

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-gray-100">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Attendance Reports</h1>
        <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
          Generate and export attendance statistics
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3 sm:p-4 text-red-300 text-sm sm:text-base">
          {error}
        </div>
      )}

      {/* Report Config */}
      <div className="bg-[#141414]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 shadow-[0_0_25px_rgba(255,255,255,0.05)] space-y-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white">
          Report Configuration
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Course Select */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Course *
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100 text-sm sm:text-base"
            >
              <option value="">Choose a course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name} ({course.entryCode})
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100 text-sm sm:text-base"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] border border-white/10 focus:ring-2 focus:ring-blue-500 text-gray-100 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateReport}
            disabled={!selectedCourse || loading}
            className="w-full flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm sm:text-base transition-all"
          >
            <FileSpreadsheet className="mr-2" size={18} />
            {loading ? "Generating..." : "Generate Report"}
          </button>

          {report.length > 0 && (
            <button
              onClick={downloadCSV}
              className="w-full flex items-center justify-center px-5 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm sm:text-base transition-all"
            >
              <Download className="mr-2" size={18} />
              Export to CSV
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {report.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-[#1a1a1a]/80 border border-white/10 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-400 mb-1">Total Students</p>
            <p className="text-2xl font-bold text-white">{report.length}</p>
          </div>
          <div className="bg-blue-900/30 border border-blue-500/30 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-300 mb-1">Average Attendance</p>
            <p className="text-2xl font-bold text-blue-400">
              {averageAttendance}%
            </p>
          </div>
          <div className="bg-purple-900/30 border border-purple-500/30 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-300 mb-1">Students Below 75%</p>
            <p className="text-2xl font-bold text-purple-400">
              {report.filter((r) => r.percentage < 75).length}
            </p>
          </div>
        </div>
      )}

      {/* Report Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Generating report...</p>
          </div>
        </div>
      ) : report.length > 0 ? (
        <div className="bg-[#141414]/80 border border-white/10 rounded-2xl shadow overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm sm:text-base">
            <thead className="bg-[#1f1f1f]/80 border-b border-white/10">
              <tr>
                {["Student Name", "Email", "Total Sessions", "Attended", "Attendance %"].map((col) => (
                  <th
                    key={col}
                    className="px-4 sm:px-6 py-3 text-left text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {report.map((student, i) => (
                <tr key={i} className="hover:bg-[#1a1a1a]">
                  <td className="px-4 sm:px-6 py-3 text-gray-200">{student.studentName}</td>
                  <td className="px-4 sm:px-6 py-3 text-gray-400">{student.studentEmail}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">{student.totalSessions}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">{student.attended}</td>
                  <td className="px-4 sm:px-6 py-3 text-center">
                    <span
                      className={`px-3 py-1 inline-flex text-sm font-semibold rounded-full ${getAttendanceColor(
                        student.percentage
                      )}`}
                    >
                      {student.percentage.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : selectedCourse && !loading ? (
        <div className="bg-[#141414]/80 border border-white/10 rounded-2xl p-8 sm:p-12 text-center">
          <FileSpreadsheet className="mx-auto mb-4 text-gray-500" size={48} />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
            No Data Available
          </h3>
          <p className="text-gray-400 text-sm sm:text-base">
            No attendance records found for the selected criteria.
          </p>
        </div>
      ) : null}
    </div>
  );
}
