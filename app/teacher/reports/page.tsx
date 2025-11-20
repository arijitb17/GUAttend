"use client";

import { useEffect, useState } from "react";
import { Download, FileSpreadsheet } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface Course {
  id: string;
  name: string;
  code: string;
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
      if (data.length === 0) {
        setError("No attendance data found for this course.");
      }
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

  const getAttendanceColorClass = (percentage: number) => {
    if (percentage >= 75) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (percentage >= 50) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const averageAttendance =
    report.length > 0
      ? (report.reduce((sum, r) => sum + r.percentage, 0) / report.length).toFixed(1)
      : "0";

  const below75 = report.filter((r) => r.percentage < 75).length;
  const between50And75 = report.filter(
    (r) => r.percentage >= 50 && r.percentage < 75
  ).length;
  const below50 = report.filter((r) => r.percentage < 50).length;

  // Pie chart data (buckets)
  const pieData = [
    { name: "≥ 75%", value: report.filter((r) => r.percentage >= 75).length },
    { name: "50–74%", value: between50And75 },
    { name: "< 50%", value: below50 },
  ];

  const PIE_COLORS = ["#22c55e", "#facc15", "#f97373"];

  // Bar chart data (per-student)
  const barData = report.map((r) => ({
    name:
      r.studentName.length > 12
        ? r.studentName.split(" ")[0] ||
          r.studentName.slice(0, 12) + (r.studentName.length > 12 ? "…" : "")
        : r.studentName,
    percentage: Number(r.percentage.toFixed(1)),
  }));

  return (
    <div className="w-full mx-auto py-6 space-y-8 text-slate-900">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between px-4 sm:px-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white text-xl shadow-[0_4px_10px_rgba(0,0,0,0.35)]">
              📊
            </span>
            <span>Attendance Reports</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 mt-1">
            Generate insights, visualize attendance, and export detailed reports.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 sm:px-6">
          <div className="border border-rose-200 bg-rose-50 text-rose-800 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Report Configuration */}
      <div className="px-4 sm:px-6">
        <div className="border border-slate-200 bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.05)] p-4 sm:p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              Report Configuration
            </h2>
            {report.length > 0 && (
              <span className="text-xs sm:text-sm text-slate-500">
                Showing data for{" "}
                <span className="font-medium text-slate-800">
                  {courses.find((c) => c.id === selectedCourse)?.name ||
                    "selected course"}
                </span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Course Select */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                Start Date{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                End Date{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, endDate: e.target.value }))
                }
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            <button
              onClick={generateReport}
              disabled={!selectedCourse || loading}
              className={`inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all ${
                !selectedCourse || loading
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 shadow-[0_10px_25px_rgba(15,23,42,0.08)]"
              }`}
            >
              <FileSpreadsheet className="mr-2" size={18} />
              {loading ? "Generating…" : "Generate Report"}
            </button>

            {report.length > 0 && (
              <button
                onClick={downloadCSV}
                className="inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
              >
                <Download className="mr-2" size={18} />
                Export to CSV
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary + Charts */}
      {report.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-slate-200 bg-white rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                  Total Students
                </p>
                <p className="text-2xl font-bold text-slate-900">{report.length}</p>
              </div>
              <div className="border border-indigo-200 bg-indigo-50 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">
                  Average Attendance
                </p>
                <p className="text-2xl font-bold text-indigo-700">
                  {averageAttendance}%
                </p>
              </div>
              <div className="border border-rose-200 bg-rose-50 rounded-2xl p-4 shadow-sm">
                <p className="text-xs font-semibold text-rose-600 uppercase mb-1">
                  Students Below 75%
                </p>
                <p className="text-2xl font-bold text-rose-700">{below75}</p>
              </div>
            </div>
          </div>

          {/* Charts row */}
          <div className="px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Pie chart */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                  Attendance Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value: any, name: any) => [
                          `${value} students`,
                          name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bar chart */}
              <div className="border border-slate-200 bg-white rounded-2xl p-4 sm:p-6 shadow-sm">
                <h3 className="text-sm sm:text-base font-semibold text-slate-900 mb-4">
                  Attendance by Student
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis tick={{ fontSize: 10 }} unit="%" domain={[0, 100]} />
                      <Tooltip
                        formatter={(value: any) => [`${value}%`, "Attendance"]}
                      />
                      <Bar dataKey="percentage" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Report Table */}
      <div className="px-4 sm:px-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto mb-4"></div>
              <p className="text-slate-500 text-sm">Generating report…</p>
            </div>
          </div>
        ) : report.length > 0 ? (
          <div className="border border-slate-200 bg-white rounded-2xl shadow-sm overflow-x-auto mt-4">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {[
                    "Student Name",
                    "Email",
                    "Total Sessions",
                    "Attended",
                    "Attendance %",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {report.map((student, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-4 sm:px-6 py-3 text-slate-900">
                      {student.studentName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-slate-600">
                      {student.studentEmail}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-center text-slate-700">
                      {student.totalSessions}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-center text-slate-700">
                      {student.attended}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full border ${getAttendanceColorClass(
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
          <div className="border border-slate-200 bg-white rounded-2xl p-8 sm:p-10 text-center shadow-sm mt-4">
            <FileSpreadsheet className="mx-auto mb-3 text-slate-400" size={40} />
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
              No Data Available
            </h3>
            <p className="text-slate-500 text-sm sm:text-base">
              No attendance records found for the selected criteria.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
